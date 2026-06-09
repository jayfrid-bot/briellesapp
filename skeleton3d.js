// skeleton3d.js — shows the 3D skeleton you can SPIN, PAN, and ZOOM! 🦴
// It can show a REAL downloaded 3D model (.glb), OR a simple shape-skeleton.
// Don't worry if some of this looks tricky — it's okay to just enjoy that it works!

let scene3d, camera3d, renderer3d, controls3d;   // the main 3D pieces
let inited3d = false;             // have we built the 3D world yet?
let currentModel = null;          // the skeleton currently on screen
let loadedModelId = null;         // which animal's real model is loaded
let boneMeshes = [];              // clickable bones (only for the shape-skeleton)
let raycaster3d, pointerNDC;
let downX = 0, downY = 0;         // used to tell a real CLICK from a spin-DRAG

const BONE_COLOR = 0xf3efe0;      // cream/bone color

function boneMaterial() {
  return new THREE.MeshStandardMaterial({ color: BONE_COLOR, roughness: 0.85, metalness: 0.05 });
}
function tagBone(mesh, info) { mesh.userData.bone = info; boneMeshes.push(mesh); }
function V(x, y, z) { return new THREE.Vector3(x, y, z); }

function boneBetween(p1, p2, radius) {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, dir.length(), 10), boneMaterial());
  mesh.position.copy(p1).add(p2).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return mesh;
}
function ballBone(x, y, z, r) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), boneMaterial());
  mesh.position.set(x, y, z);
  return mesh;
}

// ---- The simple SHAPE skeleton (used only if an animal has no real .glb model) ----
function buildCatSkeleton() {
  const cat = new THREE.Group();
  const INFO = {
    skull:    { name: "Skull",    say: "SKULL",        easy: "The hard helmet that keeps the brain safe!", hard: "Protects the brain and shapes the face." },
    spine:    { name: "Spine",    say: "SPYNE",        easy: "The bendy backbone!", hard: "A chain of vertebrae that protects the spinal cord." },
    ribs:     { name: "Ribs",     say: "RIBZ",         easy: "Bones that guard the heart and lungs!", hard: "Curved bones forming the rib cage." },
    femur:    { name: "Femur",    say: "FEE-mur",      easy: "The big thigh bone!", hard: "The longest, strongest bone in the body." },
    tail:     { name: "Tail",     say: "TAYL",         easy: "Tail bones that help balance!", hard: "Caudal vertebrae that help with balance." }
  };
  const skull = ballBone(-3.0, 0.35, 0, 0.5); skull.scale.set(1.1, 1, 0.85); tagBone(skull, INFO.skull); cat.add(skull);
  for (let i = 0; i <= 13; i++) { const v = ballBone(-2.6 + i * 0.4, 0.55, 0, 0.17); tagBone(v, INFO.spine); cat.add(v); }
  for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.045, 10, 24), boneMaterial()); r.rotation.y = Math.PI / 2; r.position.set(-2.1 + i * 0.42, 0, 0); tagBone(r, INFO.ribs); cat.add(r); }
  [0.4, -0.4].forEach(function (z) { const f = boneBetween(V(2.0, 0.15, z), V(1.7, -0.9, z), 0.12); tagBone(f, INFO.femur); cat.add(f); });
  for (let i = 0; i < 9; i++) { const b = ballBone(2.4 + i * 0.22, 0.45 + i * 0.13, 0, 0.15 - i * 0.01); tagBone(b, INFO.tail); cat.add(b); }
  return cat;
}

// Build the 3D world ONCE (the camera, the light, the controls).
function init3d() {
  const holder = document.getElementById("canvas3d-holder");
  scene3d = new THREE.Scene();
  scene3d.background = new THREE.Color(0x14342b);

  camera3d = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
  camera3d.position.set(0, 1.5, 9);

  renderer3d = new THREE.WebGLRenderer({ antialias: true });
  renderer3d.setPixelRatio(window.devicePixelRatio);
  holder.appendChild(renderer3d.domElement);

  scene3d.add(new THREE.AmbientLight(0xffffff, 0.85));
  const sun = new THREE.DirectionalLight(0xffffff, 0.8); sun.position.set(4, 6, 5); scene3d.add(sun);
  const fill = new THREE.DirectionalLight(0xffffff, 0.4); fill.position.set(-4, 2, -3); scene3d.add(fill);

  controls3d = new THREE.OrbitControls(camera3d, renderer3d.domElement);
  controls3d.enablePan = true;
  controls3d.enableZoom = true;
  controls3d.autoRotate = true;
  controls3d.autoRotateSpeed = 1.0;

  raycaster3d = new THREE.Raycaster();
  pointerNDC = new THREE.Vector2();
  renderer3d.domElement.addEventListener("pointerdown", function (e) { downX = e.clientX; downY = e.clientY; });
  renderer3d.domElement.addEventListener("pointerup", onBoneClick);

  window.addEventListener("resize", resize3d);
  inited3d = true;
  animate3d();
}

// Show the right skeleton for this animal (a real model if it has one).
function showContentFor(animal) {
  // If this animal's real model is already loaded, do nothing.
  if (animal.model3d && loadedModelId === animal.id && currentModel) return;

  // Remove whatever was showing before.
  if (currentModel) { scene3d.remove(currentModel); currentModel = null; }
  boneMeshes = [];
  loadedModelId = null;

  if (animal.model3d) {
    loadRealModel(animal);                 // load the downloaded .glb file
    updateHint(false);                     // bones aren't clickable on a real model
  } else {
    currentModel = buildCatSkeleton();     // fall back to the shape skeleton
    scene3d.add(currentModel);
    updateHint(true);                      // shape bones ARE clickable
  }
}

// Load a real 3D model file (.glb) and fit it nicely on screen.
function loadRealModel(animal) {
  showLoading(true);
  const loader = new THREE.GLTFLoader();
  loader.load(animal.model3d, function (gltf) {
    const model = gltf.scene;

    // Center the model and scale it so it fits on screen.
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    const wrapper = new THREE.Group();
    wrapper.add(model);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    wrapper.scale.setScalar(7 / maxDim);
    wrapper.rotation.y = Math.PI / 2;     // turn it side-on so you see the whole cat

    currentModel = wrapper;
    loadedModelId = animal.id;
    scene3d.add(wrapper);

    controls3d.target.set(0, 0, 0);
    camera3d.position.set(0, 1.5, 8);
    controls3d.update();
    showLoading(false);
  }, undefined, function (err) {
    // This usually happens when the page was opened by double-clicking the file.
    // 3D models only load through a web address (like the GitHub Pages link).
    show3dMessage("📡 The 3D model needs the web link!<br><br>Open the GitHub Pages version, " +
                  "or use the 📄 Flat view (it works everywhere).");
    console.error("Could not load the 3D model:", err);
  });
}

// Show or hide the "Loading…" message.
function showLoading(isLoading) {
  const el = document.getElementById("loading3d");
  el.innerHTML = "Loading 3D… 🦴";
  if (isLoading) { el.classList.remove("hidden"); } else { el.classList.add("hidden"); }
}

// Show a message inside the 3D box (used when the model can't load).
function show3dMessage(html) {
  const el = document.getElementById("loading3d");
  el.innerHTML = html;
  el.classList.remove("hidden");
}

// Change the help text depending on whether bones are clickable.
function updateHint(clickable) {
  const hint = document.getElementById("hint3d");
  if (clickable) {
    hint.textContent = "🖱️ Drag to spin • scroll to zoom • tap a bone for its name!";
  } else {
    hint.textContent = "🖱️ Drag to spin • scroll to zoom • right-drag to move it around";
  }
}

// Figure out which bone you clicked (only works on the shape-skeleton).
function onBoneClick(e) {
  if (Math.abs(e.clientX - downX) > 6 || Math.abs(e.clientY - downY) > 6) return;
  if (boneMeshes.length === 0) return;     // a real model has no clickable bones
  const rect = renderer3d.domElement.getBoundingClientRect();
  pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster3d.setFromCamera(pointerNDC, camera3d);
  const hits = raycaster3d.intersectObjects(boneMeshes, false);
  if (hits.length > 0) { showBone(hits[0].object.userData.bone); }
}

function resize3d() {
  const holder = document.getElementById("canvas3d-holder");
  const w = holder.clientWidth || 500;
  const h = 440;
  renderer3d.setSize(w, h);
  camera3d.aspect = w / h;
  camera3d.updateProjectionMatrix();
}

function animate3d() {
  requestAnimationFrame(animate3d);
  if (document.getElementById("skeleton3d-screen").classList.contains("hidden")) return;
  controls3d.update();
  renderer3d.render(scene3d, camera3d);
}

// open3DSkeleton is called from app.js when you tap "See it in 3D".
function open3DSkeleton(animal) {
  document.getElementById("skeleton3d-title").textContent = animal.emoji + " " + animal.name + " (3D)";
  showScreen("skeleton3d-screen");     // show it first so the box has a size
  if (!inited3d) { init3d(); }
  showContentFor(animal);
  resize3d();
  renderAnatomy();   // draw the SAME explorer menu/breadcrumb here (keeps your place)
}

// (Bonus) Swing the camera toward a saved angle for a region.
// focus = { theta, phi, zoom }. Does nothing if focus is missing.
function focusCamera3d(focus) {
  if (!focus || !controls3d) return;
  controls3d.autoRotate = false;           // stop spinning so you can study it
  const r = focus.zoom || 7;
  const t = focus.theta || 0;
  const p = focus.phi || (Math.PI / 2);
  // turn the angles into an x,y,z spot around the model's center
  camera3d.position.set(
    r * Math.sin(p) * Math.sin(t),
    r * Math.cos(p),
    r * Math.sin(p) * Math.cos(t)
  );
  controls3d.target.set(0, 0, 0);
  controls3d.update();
}
