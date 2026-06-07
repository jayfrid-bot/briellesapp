// skeleton3d.js — builds a REAL 3D cat skeleton you can SPIN, PAN, and ZOOM! 🦴
// This is an "advanced bonus" file. It uses a 3D helper called three.js.
// Don't worry if some of this looks tricky — it's okay to just enjoy that it works!

let scene3d, camera3d, renderer3d, controls3d;   // the main 3D pieces
let boneMeshes = [];        // every clickable bone shape goes in this list
let inited3d = false;       // have we built the 3D world yet?
let raycaster3d, pointerNDC;
let downX = 0, downY = 0;   // used to tell a real CLICK from a spin-DRAG

const BONE_COLOR = 0xf3efe0;   // cream/bone color

// Make a fresh bone-colored material (each bone gets its own so we can light it up).
function boneMaterial() {
  return new THREE.MeshStandardMaterial({ color: BONE_COLOR, roughness: 0.85, metalness: 0.05 });
}

// Remember a shape as a clickable bone, and attach its info (name, how to say it, facts).
function tagBone(mesh, info) {
  mesh.userData.bone = info;
  boneMeshes.push(mesh);
}

// Helper: make a bone (cylinder) that goes from point p1 to point p2.
function boneBetween(p1, p2, radius) {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const length = dir.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 10), boneMaterial());
  mesh.position.copy(p1).add(p2).multiplyScalar(0.5);         // middle point
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return mesh;
}

// Helper: make a round bone (sphere) at x,y,z.
function ballBone(x, y, z, r) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), boneMaterial());
  mesh.position.set(x, y, z);
  return mesh;
}

function V(x, y, z) { return new THREE.Vector3(x, y, z); }

// Build the whole cat skeleton out of shapes and return it as one group.
function buildCatSkeleton() {
  const cat = new THREE.Group();

  // The facts for each bone (same idea as the flat skeleton).
  const INFO = {
    skull:    { name: "Skull",    say: "SKULL",        easy: "The hard helmet that keeps the brain safe!", hard: "Protects the brain and shapes the face. Made of several bones fused together." },
    mandible: { name: "Mandible", say: "man-DUH-bull", easy: "The jaw bone — it helps the cat chew!", hard: "The lower jaw bone — the only skull bone that moves, used for biting and chewing." },
    spine:    { name: "Spine",    say: "SPYNE",        easy: "The bendy backbone made of little bumps!", hard: "A chain of small bones (vertebrae) that protects the spinal cord and lets the body bend." },
    ribs:     { name: "Ribs",     say: "RIBZ",         easy: "Curvy bones that guard the heart and lungs!", hard: "Curved bones forming the rib cage, protecting the heart and lungs." },
    scapula:  { name: "Scapula",  say: "SKAP-yoo-luh", easy: "The shoulder bone!", hard: "The shoulder blade — a flat bone connecting the front leg to the body." },
    humerus:  { name: "Humerus",  say: "HYOO-mer-us",  easy: "The upper front-leg bone, like our arm bone!", hard: "The upper bone of the front leg, similar to the human upper arm." },
    pelvis:   { name: "Pelvis",   say: "PEL-vis",      easy: "The hip bones!", hard: "The hip bone — it connects the spine to the back legs." },
    femur:    { name: "Femur",    say: "FEE-mur",      easy: "The big thigh bone — the biggest bone!", hard: "The thigh bone — the longest and strongest bone in the body." },
    tibia:    { name: "Tibia",    say: "TIB-ee-uh",    easy: "The shin bone in the lower leg!", hard: "The shin bone — the larger of the two lower-leg bones." },
    tail:     { name: "Tail",     say: "TAYL",         easy: "Bones in the tail that help the cat balance!", hard: "Caudal vertebrae — small tail bones that help with balance." }
  };

  // ---- SKULL ----
  const skull = ballBone(-3.0, 0.35, 0, 0.5); skull.scale.set(1.1, 1, 0.85);
  tagBone(skull, INFO.skull); cat.add(skull);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.4), boneMaterial());
  snout.position.set(-3.55, 0.22, 0); tagBone(snout, INFO.skull); cat.add(snout);

  // ---- MANDIBLE (jaw) ----
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.36), boneMaterial());
  jaw.position.set(-3.35, -0.02, 0); tagBone(jaw, INFO.mandible); cat.add(jaw);

  // ---- SPINE (backbone) ----
  for (let i = 0; i <= 13; i++) {
    const x = -2.6 + i * 0.4;
    const vert = ballBone(x, 0.55, 0, 0.17);
    tagBone(vert, INFO.spine); cat.add(vert);
  }

  // ---- RIBS (rings around the chest) ----
  for (let i = 0; i < 6; i++) {
    const x = -2.1 + i * 0.42;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.045, 10, 24), boneMaterial());
    ring.rotation.y = Math.PI / 2;       // turn the ring to face along the body
    ring.position.set(x, 0.0, 0);
    tagBone(ring, INFO.ribs); cat.add(ring);
  }

  // ---- SCAPULA, FRONT LEGS (both sides) ----
  [0.45, -0.45].forEach(function (z) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.07), boneMaterial());
    blade.position.set(-2.0, 0.3, z); blade.rotation.z = 0.3;
    tagBone(blade, INFO.scapula); cat.add(blade);

    const upper = boneBetween(V(-2.0, 0.1, z), V(-1.95, -0.9, z), 0.1);
    tagBone(upper, INFO.humerus); cat.add(upper);
    const lower = boneBetween(V(-1.95, -0.9, z), V(-1.9, -1.7, z), 0.08);
    tagBone(lower, INFO.humerus); cat.add(lower);
    const paw = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.22), boneMaterial());
    paw.position.set(-1.95, -1.75, z); tagBone(paw, INFO.humerus); cat.add(paw);
  });

  // ---- PELVIS (hips) ----
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.8), boneMaterial());
  pelvis.position.set(2.0, 0.35, 0); tagBone(pelvis, INFO.pelvis); cat.add(pelvis);

  // ---- BACK LEGS (both sides): FEMUR + TIBIA ----
  [0.4, -0.4].forEach(function (z) {
    const femur = boneBetween(V(2.0, 0.15, z), V(1.7, -0.9, z), 0.12);
    tagBone(femur, INFO.femur); cat.add(femur);
    const tibia = boneBetween(V(1.7, -0.9, z), V(1.95, -1.7, z), 0.09);
    tagBone(tibia, INFO.tibia); cat.add(tibia);
    const paw = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.22), boneMaterial());
    paw.position.set(1.95, -1.75, z); tagBone(paw, INFO.tibia); cat.add(paw);
  });

  // ---- TAIL ----
  for (let i = 0; i < 9; i++) {
    const x = 2.4 + i * 0.22;
    const y = 0.45 + i * 0.13;
    const bead = ballBone(x, y, 0, 0.15 - i * 0.01);
    tagBone(bead, INFO.tail); cat.add(bead);
  }

  return cat;
}

// Build the whole 3D world (only ONCE).
function init3d() {
  const holder = document.getElementById("canvas3d-holder");

  scene3d = new THREE.Scene();
  scene3d.background = new THREE.Color(0x14342b);   // dark jungle green

  camera3d = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera3d.position.set(0, 1.5, 9);

  renderer3d = new THREE.WebGLRenderer({ antialias: true });
  renderer3d.setPixelRatio(window.devicePixelRatio);
  holder.appendChild(renderer3d.domElement);

  // Lights so the bones aren't flat black.
  scene3d.add(new THREE.AmbientLight(0xffffff, 0.7));
  const sun = new THREE.DirectionalLight(0xffffff, 0.8); sun.position.set(4, 6, 5);
  scene3d.add(sun);
  const fill = new THREE.DirectionalLight(0xffffff, 0.3); fill.position.set(-4, 2, -3);
  scene3d.add(fill);

  // OrbitControls let you DRAG to spin, SCROLL to zoom, RIGHT-DRAG to pan.
  controls3d = new THREE.OrbitControls(camera3d, renderer3d.domElement);
  controls3d.target.set(0, -0.2, 0);
  controls3d.enablePan = true;
  controls3d.enableZoom = true;
  controls3d.autoRotate = true;          // slowly spin on its own (looks alive!)
  controls3d.autoRotateSpeed = 1.0;

  scene3d.add(buildCatSkeleton());

  // Set up clicking on bones.
  raycaster3d = new THREE.Raycaster();
  pointerNDC = new THREE.Vector2();
  renderer3d.domElement.addEventListener("pointerdown", function (e) { downX = e.clientX; downY = e.clientY; });
  renderer3d.domElement.addEventListener("pointerup", onBoneClick);

  window.addEventListener("resize", resize3d);
  inited3d = true;
  animate3d();
}

// Figure out which bone you clicked (only if you clicked, not dragged).
function onBoneClick(e) {
  if (Math.abs(e.clientX - downX) > 6 || Math.abs(e.clientY - downY) > 6) return;  // was a spin, not a click
  const rect = renderer3d.domElement.getBoundingClientRect();
  pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster3d.setFromCamera(pointerNDC, camera3d);
  const hits = raycaster3d.intersectObjects(boneMeshes, false);
  if (hits.length > 0) {
    const info = hits[0].object.userData.bone;
    highlightBone(info.name);
    showBone(info);          // reuse the popup from app.js!
  }
}

// Light up every shape that is part of the clicked bone.
function highlightBone(name) {
  boneMeshes.forEach(function (mesh) {
    if (mesh.userData.bone.name === name) {
      mesh.material.emissive = new THREE.Color(0xffd166);   // glow yellow
    } else {
      mesh.material.emissive = new THREE.Color(0x000000);   // no glow
    }
  });
}

// Make the 3D picture fit its box.
function resize3d() {
  const holder = document.getElementById("canvas3d-holder");
  const w = holder.clientWidth || 500;
  const h = 440;
  renderer3d.setSize(w, h);
  camera3d.aspect = w / h;
  camera3d.updateProjectionMatrix();
}

// The render loop — draws the scene many times a second so it moves smoothly.
function animate3d() {
  requestAnimationFrame(animate3d);
  if (document.getElementById("skeleton3d-screen").classList.contains("hidden")) return;  // skip when not showing
  controls3d.update();
  renderer3d.render(scene3d, camera3d);
}

// open3DSkeleton is called from app.js when you open an animal that has 3D.
function open3DSkeleton(animal) {
  document.getElementById("skeleton3d-title").textContent = animal.emoji + " " + animal.name + " (3D)";
  showScreen("skeleton3d-screen");      // show it first so the box has a size
  if (!inited3d) {
    init3d();
  }
  resize3d();
}
