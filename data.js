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

      // ===== THE BODY, AS A TREE YOU CAN EXPLORE =====
      // A "part" can hold its OWN parts inside it — so you can dig deeper and deeper!
      // The ONE rule:  has "parts" → you can go INSIDE it.   no "parts" → it's a fact popup.
      // Fields (only "name" is required):
      //   name  = the words on the button         say  = how to say it (the 🔊 button)
      //   x, y  = where its dot sits (PERCENT) on its PARENT's picture
      //   image = this part's OWN zoomed picture (optional)
      //   easy  = simple fact (ages 11 and under)  hard = detailed fact (ages 12+)
      //   fun   = an extra WOW fun-fact (optional)
      //   parts = the smaller parts inside it (this is what makes it a tree!)
      parts: [

        // ============================================================
        // REGION 1: HEAD  — fully built. THIS is the example to copy!
        // ============================================================
        {
          name: "Head", say: "HED", x: 14, y: 46,
          easy: "The skull and jaw — it protects the brain!",
          hard: "The head holds the skull, jaw, teeth, and the sockets for the eyes and nose.",
          // No "image" yet, so tapping Head shows a BUTTON MENU of its bones.
          // Later: draw a zoomed head picture, add  image: "images/felines/cat/head.svg",
          // then give each bone below an x/y to drop a dot on that picture.
          parts: [
            { name: "Cranium", say: "KRAY-nee-um",
              easy: "The dome that wraps around the brain like a helmet.",
              hard: "The braincase — several flat bones fused together to guard the brain.",
              fun: "A cat's cranium is rounder than a dog's!" },

            { name: "Mandible", say: "MAN-duh-bull",
              easy: "The lower jaw — it moves so the cat can chew.",
              hard: "The only movable bone of the skull; it hinges to bite and chew.",
              fun: "It's the strongest bone in the whole head." },

            // Teeth goes DEEPER — it has its own parts!
            { name: "Teeth", say: "TEETH",
              easy: "Cats have sharp teeth for catching and tearing food.",
              hard: "Cats have 30 adult teeth shaped for a meat-eating diet.",
              fun: "A kitten loses its baby teeth, just like you do!",
              parts: [
                { name: "Canines", say: "KAY-nynes",
                  easy: "The long pointy fangs for grabbing.",
                  hard: "Four long, dagger-like teeth used to grip and pierce prey.",
                  fun: "These are the 'vampire' teeth!" },
                { name: "Incisors", say: "in-SY-zers",
                  easy: "The tiny front teeth for nibbling.",
                  hard: "Small front teeth used for grooming and stripping meat off bone." },
                { name: "Molars", say: "MOH-lerz",
                  easy: "The back teeth that slice food up.",
                  hard: "Blade-like back teeth that shear meat like scissors." }
              ] },

            { name: "Nasal Bone", say: "NAY-zul bone",
              easy: "The little bone at the top of the nose.",
              hard: "A small bone forming the bridge of the nose, supporting smell organs.",
              fun: "A cat smells about 14 times better than you!" },

            { name: "Orbit", say: "OR-bit",
              easy: "The round eye socket that holds the eye.",
              hard: "The bony cup that protects and holds the eyeball.",
              fun: "Cat eyes face forward to help them judge distance when pouncing." },

            { name: "Zygomatic", say: "zy-go-MAT-ik",
              easy: "The cheekbone!",
              hard: "The cheekbone arch; chewing muscles pass underneath it.",
              fun: "You can feel your own zygomatic — it's your cheekbone too!" }
          ]
        },

        // ============================================================
        // REGIONS 2-7: main bones listed. Copy the Head pattern to go deeper!
        // ============================================================
        {
          name: "Spine", say: "SPYNE", x: 50, y: 28,
          easy: "The bendy backbone made of little bumps!",
          hard: "A chain of vertebrae that protects the spinal cord and lets the body bend.",
          parts: [
            { name: "Vertebrae", say: "VER-tuh-bray",
              easy: "The little bone bumps that link up the back.",
              hard: "Each small bone is a vertebra; together they form the flexible spine." }
          ]
        },

        {
          name: "Ribcage", say: "RIB-cayj", x: 43, y: 60,
          easy: "Curvy bones that guard the heart and lungs!",
          hard: "The rib cage shields the heart and lungs.",
          parts: [
            { name: "Ribs", say: "RIBZ",
              easy: "Curvy bones around the chest.",
              hard: "Cats usually have 13 pairs of ribs." }
          ]
        },

        {
          name: "Front Leg", say: "FRUNT leg", x: 35, y: 45,
          easy: "The arm and shoulder of the cat.",
          hard: "Includes the shoulder blade and the long leg bones up front.",
          parts: [
            { name: "Scapula", say: "SKAP-yoo-luh",
              easy: "The shoulder blade!",
              hard: "A flat bone connecting the front leg to the body." }
          ]
        },

        {
          name: "Back Leg", say: "BAK leg", x: 76, y: 57,
          easy: "The powerful jumping legs.",
          hard: "The hind limb — the cat's jumping engine.",
          parts: [
            { name: "Femur", say: "FEE-mur",
              easy: "The big thigh bone!",
              hard: "The longest, strongest bone in the body." },
            { name: "Tibia", say: "TIB-ee-uh",
              easy: "The shin bone.",
              hard: "The larger of the two lower-leg bones." }
          ]
        },

        {
          name: "Pelvis", say: "PEL-vis", x: 72, y: 41,
          easy: "The hip bones!",
          hard: "The hip bone; it links the spine to the back legs.",
          parts: [
            { name: "Hip Bone", say: "HIP bone",
              easy: "Connects the body to the back legs.",
              hard: "The pelvic girdle anchors the hind limbs to the spine." }
          ]
        },

        {
          name: "Tail", say: "TAYL", x: 86, y: 14,
          easy: "Bones in the tail that help the cat balance!",
          hard: "Caudal vertebrae that help with balance and communication.",
          parts: [
            { name: "Caudal Vertebrae", say: "KAW-dul VER-tuh-bray",
              easy: "The little tail bones.",
              hard: "20 or more small bones giving the tail its swishy flexibility." }
          ]
        }
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
