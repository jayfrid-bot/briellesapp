// game.js — "Escape the Body!" 🫀
// You are a white blood cell trying to escape!
// Dodge the organs and reach the green EXIT portal before time runs out.

let gc = null, gctx = null;      // game canvas and drawing context
let gRunning = false;             // is the game loop running right now?
let gControlsSetup = false;       // keyboard + touch events registered only once
let gAnimId = null;               // requestAnimationFrame ID
let gDifficulty = "easy";        // "easy", "medium", or "hard"
let gStartTime = 0;               // performance.now() when this round began
let gElapsed = 0;                 // seconds since round started
let gLastTimestamp = 0;           // used to calculate delta-time between frames
let gOrgans = [];                 // the obstacle organs for this round
let gHitName = "";                // name of the last organ the player bumped into
let gHitTimer = 0;                // countdown (frames) to hide the hit-name label
let gPlayerSpeed = 4.8;          // pixels per frame the player can move

// The player — a white blood cell
const gPlayer = { x: 0, y: 0, r: 10 };

// Target point: player moves toward wherever you clicked / touched
let gTarget = null;

// Which keyboard keys are held right now
const gKeys = {};

// The green EXIT portal at the top of the body
const gExit = { x: 0, y: 0, r: 24 };

// Best escape times remembered across sessions
const gBest = { easy: null, medium: null, hard: null };

// ─────────────────────────────────────────────────────────────────────────────
//  ORGAN DEFINITIONS
//  Each row: [name, centerX%, centerY%, halfWidth%, halfHeight%,
//             fillColor, darkColor, moveSpeedX, moveSpeedY, oscillationAmplitude]
//  x/y are fractions (0–1) of the canvas size.
// ─────────────────────────────────────────────────────────────────────────────
const ORG_DEFS = [
  ["Heart",        0.37, 0.44, 0.10, 0.09, "#e63946", "#9d0208", 1.1, 0.0,  22],
  ["Left Lung",    0.26, 0.30, 0.09, 0.14, "#ffb4a2", "#e07a5f", 0.0, 0.7,  14],
  ["Right Lung",   0.63, 0.30, 0.09, 0.14, "#ffb4a2", "#e07a5f", 0.0, 0.7,  14],
  ["Liver",        0.67, 0.51, 0.13, 0.09, "#9d4edd", "#5a189a", 0.8, 0.0,  18],
  ["Stomach",      0.41, 0.59, 0.12, 0.09, "#ffd166", "#f4a261", 0.7, 0.6,  18],
  ["Left Kidney",  0.22, 0.67, 0.06, 0.09, "#d62828", "#9d0208", 0.0, 0.9,  12],
  ["Right Kidney", 0.71, 0.67, 0.06, 0.09, "#d62828", "#9d0208", 0.0, -0.9, 12],
  ["Intestines",   0.49, 0.80, 0.20, 0.07, "#e9c46a", "#a97c50", 0.5, 0.0,  24],
];

// ─────────────────────────────────────────────────────────────────────────────
//  ENTRY POINT — called from the "Play a Game!" button on the home screen
// ─────────────────────────────────────────────────────────────────────────────
function openBodyGame() {
  showScreen("game-screen");
  // Short delay so the screen is visible before we measure its size
  setTimeout(initBodyGame, 60);
}

function initBodyGame() {
  gc   = document.getElementById("game-canvas");
  gctx = gc.getContext("2d");

  if (!gControlsSetup) {
    setupGameControls();
    gControlsSetup = true;
  }

  loadBestTimes();
  resizeGameCanvas();
  startRound();
}

function resizeGameCanvas() {
  const wrap = document.getElementById("game-wrap");
  const W = Math.min(wrap.clientWidth || 500, 520);
  const H = Math.round(W * 1.18);   // portrait shape — taller than wide
  gc.width  = W;
  gc.height = H;
}

// ─────────────────────────────────────────────────────────────────────────────
//  START A NEW ROUND
// ─────────────────────────────────────────────────────────────────────────────
function startRound() {
  gRunning = false;
  if (gAnimId) { cancelAnimationFrame(gAnimId); gAnimId = null; }

  // Reset player to bottom-center
  gPlayer.x = gc.width  * 0.50;
  gPlayer.y = gc.height * 0.91;
  gTarget   = null;
  gHitName  = "";
  gHitTimer = 0;

  // Place the exit portal at top-center
  gExit.x = gc.width  * 0.50;
  gExit.y = gc.height * 0.07;

  buildOrgans();

  document.getElementById("game-message").classList.add("hidden");

  gStartTime    = performance.now();
  gLastTimestamp = gStartTime;
  gElapsed      = 0;
  updateTimerEl();

  gRunning = true;
  gAnimId = requestAnimationFrame(gameFrame);
}

// ─────────────────────────────────────────────────────────────────────────────
//  BUILD ORGANS FOR THE CHOSEN DIFFICULTY
// ─────────────────────────────────────────────────────────────────────────────
function buildOrgans() {
  const W = gc.width, H = gc.height;
  const cfgMap = {
    easy:   { sz: 0.80, spd: 0.0,  ps: 4.8 },
    medium: { sz: 1.00, spd: 0.55, ps: 4.0 },
    hard:   { sz: 1.18, spd: 1.25, ps: 3.2 },
  };
  const cfg = cfgMap[gDifficulty];
  gPlayerSpeed = cfg.ps;

  gOrgans = ORG_DEFS.map(function(def, i) {
    const [name, rx, ry, ew, eh, color, dark, mx, my, amp] = def;
    return {
      name:  name,
      x:     rx * W,          // current center x (moves each frame)
      y:     ry * H,          // current center y
      ox:    rx * W,          // origin x (oscillates around this)
      oy:    ry * H,          // origin y
      rw:    ew * W * cfg.sz / 2,   // horizontal radius of the ellipse
      rh:    eh * H * cfg.sz / 2,   // vertical radius of the ellipse
      color: color,
      dark:  dark,
      vx:    mx * cfg.spd,    // x oscillation speed  (0 = stationary)
      vy:    my * cfg.spd,    // y oscillation speed
      amp:   amp * cfg.sz,    // oscillation distance in pixels
      phase: i * 1.15,        // stagger so they don't all move in sync
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN GAME LOOP
// ─────────────────────────────────────────────────────────────────────────────
function gameFrame(now) {
  if (!gRunning) return;

  // dt = 1.0 at 60 fps; higher when lagging, capped so big pauses don't teleport
  const dt = Math.min((now - gLastTimestamp) / 16.667, 3.0);
  gLastTimestamp = now;
  gElapsed = (now - gStartTime) / 1000;

  updateTimerEl();
  movePlayer(dt);
  oscillateOrgans();
  resolveCollisions();
  checkWin();
  drawGame();

  if (gHitTimer > 0) gHitTimer -= dt;

  gAnimId = requestAnimationFrame(gameFrame);
}

// ─────────────────────────────────────────────────────────────────────────────
//  PLAYER MOVEMENT
// ─────────────────────────────────────────────────────────────────────────────
function movePlayer(dt) {
  const spd = gPlayerSpeed * dt;
  let dx = 0, dy = 0;

  // Keyboard: arrow keys or WASD
  if (gKeys["ArrowLeft"]  || gKeys["a"] || gKeys["A"]) dx -= 1;
  if (gKeys["ArrowRight"] || gKeys["d"] || gKeys["D"]) dx += 1;
  if (gKeys["ArrowUp"]    || gKeys["w"] || gKeys["W"]) dy -= 1;
  if (gKeys["ArrowDown"]  || gKeys["s"] || gKeys["S"]) dy += 1;

  // Mouse / touch: move toward the target point
  if (gTarget) {
    const tdx = gTarget.x - gPlayer.x;
    const tdy = gTarget.y - gPlayer.y;
    const dist = Math.sqrt(tdx * tdx + tdy * tdy);
    if (dist > 6) { dx += tdx / dist; dy += tdy / dist; }
  }

  // Normalize diagonal movement so it isn't faster
  const mag = Math.sqrt(dx * dx + dy * dy);
  if (mag > 0.01) { dx /= mag; dy /= mag; }

  gPlayer.x = Math.max(gPlayer.r, Math.min(gc.width  - gPlayer.r, gPlayer.x + dx * spd));
  gPlayer.y = Math.max(gPlayer.r, Math.min(gc.height - gPlayer.r, gPlayer.y + dy * spd));
}

// Move organs back and forth using a smooth sine wave
function oscillateOrgans() {
  const t = gElapsed;
  gOrgans.forEach(function(o) {
    o.x = o.ox + (o.vx !== 0 ? Math.sin(t * o.vx + o.phase) * o.amp : 0);
    o.y = o.oy + (o.vy !== 0 ? Math.sin(t * o.vy + o.phase) * o.amp : 0);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  COLLISION DETECTION
// ─────────────────────────────────────────────────────────────────────────────
function resolveCollisions() {
  for (let i = 0; i < gOrgans.length; i++) {
    const o  = gOrgans[i];
    const dx = gPlayer.x - o.x;
    const dy = gPlayer.y - o.y;

    // Expand the ellipse by the player radius to check for overlap
    const ex = dx / (o.rw + gPlayer.r);
    const ey = dy / (o.rh + gPlayer.r);

    if (ex * ex + ey * ey < 1) {
      // Player is inside the organ — push them back to the surface
      const angle = Math.atan2(dy, dx);
      // Actual distance from organ center to its ellipse surface at this angle
      const surfR = Math.sqrt(
        Math.pow(o.rw * Math.cos(angle), 2) +
        Math.pow(o.rh * Math.sin(angle), 2)
      );
      gPlayer.x = o.x + Math.cos(angle) * (surfR + gPlayer.r + 2);
      gPlayer.y = o.y + Math.sin(angle) * (surfR + gPlayer.r + 2);

      // Briefly show the organ's name so kids learn it while playing!
      gHitName  = o.name;
      gHitTimer = 80;
      break;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  WIN CONDITION
// ─────────────────────────────────────────────────────────────────────────────
function checkWin() {
  const dx = gPlayer.x - gExit.x;
  const dy = gPlayer.y - gExit.y;
  if (Math.sqrt(dx * dx + dy * dy) < gExit.r + gPlayer.r - 4) {
    gRunning = false;
    showWinScreen();
  }
}

function showWinScreen() {
  const t    = gElapsed.toFixed(1);
  const best = gBest[gDifficulty];
  const isNewBest = (best === null || gElapsed < best);
  if (isNewBest) { gBest[gDifficulty] = gElapsed; saveBestTimes(); }

  document.getElementById("msg-title").textContent = "You escaped! 🎉";
  let txt = "Time: " + t + "s   " + getDiffLabel();
  if (isNewBest) { txt += "\n🏆 New best time!"; }
  else { txt += "\n(Your best: " + best.toFixed(1) + "s)"; }
  document.getElementById("msg-text").textContent = txt;
  document.getElementById("game-message").classList.remove("hidden");
}

function getDiffLabel() {
  return { easy: "🌱 Easy", medium: "⚡ Medium", hard: "🔥 Hard" }[gDifficulty];
}

// ─────────────────────────────────────────────────────────────────────────────
//  DRAWING
// ─────────────────────────────────────────────────────────────────────────────
function drawGame() {
  const W = gc.width, H = gc.height;
  gctx.clearRect(0, 0, W, H);

  // Dark body-interior background
  const bg = gctx.createRadialGradient(W / 2, H * 0.44, H * 0.06, W / 2, H * 0.44, H * 0.62);
  bg.addColorStop(0, "#3d1a2e");
  bg.addColorStop(1, "#150810");
  gctx.fillStyle = bg;
  gctx.fillRect(0, 0, W, H);

  // Faint body outline
  gctx.save();
  gctx.strokeStyle = "rgba(255,200,200,0.13)";
  gctx.lineWidth = 3;
  gctx.beginPath();
  gctx.ellipse(W / 2, H * 0.47, W * 0.44, H * 0.45, 0, 0, Math.PI * 2);
  gctx.stroke();
  gctx.restore();

  drawExitPortal();
  gOrgans.forEach(drawOneOrgan);
  drawPlayer();

  // Label for last bumped organ (fades out)
  if (gHitTimer > 0 && gHitName) {
    gctx.save();
    gctx.globalAlpha = Math.min(1, gHitTimer / 20);
    gctx.font = "bold 15px sans-serif";
    gctx.fillStyle = "#ffd166";
    gctx.textAlign = "center";
    gctx.textBaseline = "bottom";
    gctx.fillText("⚠ " + gHitName + "!", gPlayer.x, gPlayer.y - gPlayer.r - 6);
    gctx.restore();
  }

  // Tiny guide text at the very bottom
  gctx.save();
  gctx.font = "12px sans-serif";
  gctx.fillStyle = "rgba(200,200,200,0.4)";
  gctx.textAlign = "center";
  gctx.fillText("▲ reach the EXIT ▲", W / 2, H - 7);
  gctx.restore();
}

function drawExitPortal() {
  const x = gExit.x, y = gExit.y, r = gExit.r;
  const pulse = 0.88 + 0.12 * Math.sin(gElapsed * 3.5);

  // Glow ring
  const g = gctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.9);
  g.addColorStop(0, "rgba(74,222,128,0.85)");
  g.addColorStop(1, "rgba(74,222,128,0)");
  gctx.fillStyle = g;
  gctx.beginPath();
  gctx.arc(x, y, r * 1.9 * pulse, 0, Math.PI * 2);
  gctx.fill();

  // Solid portal circle
  gctx.fillStyle = "#4ade80";
  gctx.beginPath();
  gctx.arc(x, y, r * pulse, 0, Math.PI * 2);
  gctx.fill();

  // Label
  gctx.font = "bold 13px sans-serif";
  gctx.fillStyle = "#003300";
  gctx.textAlign = "center";
  gctx.textBaseline = "middle";
  gctx.fillText("EXIT", x, y);
}

function drawOneOrgan(o) {
  gctx.save();

  // Inner glow / shadow
  gctx.shadowColor = o.dark;
  gctx.shadowBlur  = 16;

  // Gradient fill: lighter in the highlight corner, darker at edges
  const grad = gctx.createRadialGradient(
    o.x - o.rw * 0.28, o.y - o.rh * 0.28, 0,
    o.x, o.y, Math.max(o.rw, o.rh)
  );
  grad.addColorStop(0, lightenHex(o.color, 50));
  grad.addColorStop(1, o.dark);
  gctx.fillStyle = grad;
  gctx.beginPath();
  gctx.ellipse(o.x, o.y, o.rw, o.rh, 0, 0, Math.PI * 2);
  gctx.fill();

  // Organ name label
  gctx.shadowBlur = 0;
  const fs = Math.max(9, Math.min(o.rw * 0.38, 13));
  gctx.font = "bold " + fs + "px sans-serif";
  gctx.fillStyle = "rgba(255,255,255,0.92)";
  gctx.textAlign = "center";
  gctx.textBaseline = "middle";
  gctx.fillText(o.name, o.x, o.y);

  gctx.restore();
}

function drawPlayer() {
  const x = gPlayer.x, y = gPlayer.y, r = gPlayer.r;
  gctx.save();

  // Outer glow
  gctx.shadowColor = "#a8dadc";
  gctx.shadowBlur  = 14;

  // White blood cell — shiny white-to-blue sphere
  const g = gctx.createRadialGradient(x - r * 0.32, y - r * 0.32, 0, x, y, r);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.65, "#a8dadc");
  g.addColorStop(1, "#457b9d");
  gctx.fillStyle = g;
  gctx.beginPath();
  gctx.arc(x, y, r, 0, Math.PI * 2);
  gctx.fill();

  // Nucleus dot
  gctx.shadowBlur = 0;
  gctx.fillStyle = "#457b9d";
  gctx.beginPath();
  gctx.arc(x, y, r * 0.38, 0, Math.PI * 2);
  gctx.fill();

  gctx.restore();
}

// Lighten a hex color by adding `amount` to each R G B channel
function lightenHex(hex, amount) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (n >> 16)         + amount);
  const g = Math.min(255, ((n >> 8) & 0xff) + amount);
  const b = Math.min(255, (n & 0xff)        + amount);
  return "rgb(" + r + "," + g + "," + b + ")";
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONTROLS (registered once)
// ─────────────────────────────────────────────────────────────────────────────
function setupGameControls() {
  // Keyboard
  document.addEventListener("keydown", function(e) {
    gKeys[e.key] = true;
    if (gRunning && ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.key) !== -1) {
      e.preventDefault();   // stop arrow keys from scrolling the page during play
    }
  });
  document.addEventListener("keyup", function(e) { gKeys[e.key] = false; });

  // Mouse / touch on the canvas
  const canvas = document.getElementById("game-canvas");

  function canvasPos(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width  / rect.width),
      y: (clientY - rect.top)  * (canvas.height / rect.height),
    };
  }

  canvas.addEventListener("mousedown",  function(e) { if (gRunning) gTarget = canvasPos(e.clientX, e.clientY); });
  canvas.addEventListener("mousemove",  function(e) { if (gTarget) gTarget = canvasPos(e.clientX, e.clientY); });
  canvas.addEventListener("mouseup",    function()  { gTarget = null; });
  canvas.addEventListener("mouseleave", function()  { gTarget = null; });

  canvas.addEventListener("touchstart", function(e) {
    e.preventDefault();
    if (gRunning) gTarget = canvasPos(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
  canvas.addEventListener("touchmove", function(e) {
    e.preventDefault();
    gTarget = canvasPos(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
  canvas.addEventListener("touchend", function() { gTarget = null; });
}

// ─────────────────────────────────────────────────────────────────────────────
//  DIFFICULTY BUTTONS
// ─────────────────────────────────────────────────────────────────────────────
function setGameDifficulty(diff) {
  gDifficulty = diff;
  document.querySelectorAll(".diff-btn").forEach(function(b) {
    b.classList.toggle("active", b.dataset.diff === diff);
  });
  if (gc) startRound();
}

// ─────────────────────────────────────────────────────────────────────────────
//  TIMER DISPLAY & BEST TIMES
// ─────────────────────────────────────────────────────────────────────────────
function updateTimerEl() {
  const el = document.getElementById("game-timer");
  if (el) el.textContent = "⏱ " + gElapsed.toFixed(1) + "s";
}

function loadBestTimes() {
  ["easy", "medium", "hard"].forEach(function(d) {
    const v = localStorage.getItem("bestTime_" + d);
    gBest[d] = v ? parseFloat(v) : null;
  });
}

function saveBestTimes() {
  ["easy", "medium", "hard"].forEach(function(d) {
    if (gBest[d] !== null) localStorage.setItem("bestTime_" + d, gBest[d]);
  });
}
