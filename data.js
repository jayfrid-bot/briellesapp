// data.js — ALL the information about your animals lives here.
// This is the file YOU will edit the most! Adding an animal = adding one line.

// "const DATA = { ... }" makes a labeled box called DATA that holds everything.
const DATA = {

  // ===== THE 6 ANIMAL GROUPS =====
  // [ ] is a LIST.  { } is one ITEM with labels inside.
  categories: [
    { id: "felines",    name: "Felines",    emoji: "🐱" },
    { id: "canines",    name: "Canines",    emoji: "🐶" },
    { id: "amphibians", name: "Amphibians", emoji: "🐸" },
    { id: "reptiles",   name: "Reptiles",   emoji: "🦎" },
    { id: "birds",      name: "Birds",      emoji: "🐦" },
    { id: "smallpets",  name: "Small Pets", emoji: "🐹" }
  ],

  // ===== THE ANIMALS =====
  // Each animal says which group ("category") it belongs to.
  // To add an animal: copy a line, paste it, and change the words!
  animals: [

    // ---- 10 FELINES (cats!) ----
    // To give any animal a real photo, add  photo: "images/animals/NAME.jpg"  to its line, like:
    // { id: "cat", category: "felines", name: "Cat", emoji: "🐱", photo: "images/animals/cat.jpg" },
    {
      id: "cat", category: "felines", name: "Cat", emoji: "🐱",
      photo: "images/animals/cat.jpg",

      // has3d: true  shows a "See it in 3D" button.
      has3d: true,
      // model3d = a REAL downloaded 3D skeleton file (.glb) that spins!
      model3d: "images/felines/cat/feline-skeleton.glb",

      // The REAL, accurate cat skeleton picture (from Wikimedia Commons).
      skeleton: "images/felines/cat/cat-skeleton-real.svg",

      // The clickable BONES. x and y are PERCENTS (0-100) telling the dot where to sit.
      // "say" = how to say it.  "easy" = simple fact (young kids).  "hard" = detailed fact.
      parts: [
        { name: "Skull",   say: "SKULL",          x: 14, y: 46,
          easy: "The hard helmet that keeps the brain safe!",
          hard: "Protects the brain and shapes the face. It is made of several bones fused together." },
        { name: "Mandible", say: "man-DUH-bull",  x: 13, y: 54,
          easy: "The jaw bone — it helps the cat chew!",
          hard: "The lower jaw bone. It is the only bone in the skull that moves, used for biting and chewing." },
        { name: "Spine",   say: "SPYNE",          x: 50, y: 28,
          easy: "The bendy backbone made of little bumps!",
          hard: "A chain of small bones called vertebrae. It protects the spinal cord and lets the body bend." },
        { name: "Ribs",    say: "RIBZ",           x: 43, y: 60,
          easy: "Curvy bones that guard the heart and lungs!",
          hard: "Curved bones that form the rib cage, protecting the heart and lungs." },
        { name: "Scapula", say: "SKAP-yoo-luh",   x: 35, y: 45,
          easy: "The shoulder bone!",
          hard: "The shoulder blade — a flat bone that connects the front leg to the body." },
        { name: "Pelvis",  say: "PEL-vis",        x: 72, y: 41,
          easy: "The hip bones!",
          hard: "The hip bone. It connects the spine to the back legs." },
        { name: "Femur",   say: "FEE-mur",        x: 76, y: 57,
          easy: "The big thigh bone — the biggest bone in the body!",
          hard: "The thigh bone. It is the longest and strongest bone in the body." },
        { name: "Tibia",   say: "TIB-ee-uh",      x: 73, y: 75,
          easy: "The shin bone in the lower leg!",
          hard: "The shin bone — the larger of the two bones in the lower leg." },
        { name: "Tail",    say: "TAYL",           x: 86, y: 14,
          easy: "Bones in the tail that help the cat balance!",
          hard: "Caudal vertebrae — small tail bones that help with balance and communication." }
      ]
    },
    { id: "lion",     category: "felines", name: "Lion",     emoji: "🦁", photo: "images/animals/lion.jpg" },
    { id: "tiger",    category: "felines", name: "Tiger",    emoji: "🐯" },
    { id: "leopard",  category: "felines", name: "Leopard",  emoji: "🐆" },
    { id: "cheetah",  category: "felines", name: "Cheetah",  emoji: "🐆" },
    { id: "jaguar",   category: "felines", name: "Jaguar",   emoji: "🐆" },
    { id: "cougar",   category: "felines", name: "Cougar",   emoji: "🐈" },
    { id: "lynx",     category: "felines", name: "Lynx",     emoji: "🐈" },
    { id: "bobcat",   category: "felines", name: "Bobcat",   emoji: "🐈" },
    { id: "panther",  category: "felines", name: "Panther",  emoji: "🐈‍⬛" }

    // ---- The other groups are empty for now. ----
    // ---- When you're ready, add animals here the same way, like: ----
    // { id: "dog", category: "canines", name: "Dog", emoji: "🐶" },

  ]
};
