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
    { id: "cat",      category: "felines", name: "Cat",      emoji: "🐱", photo: "images/animals/cat.jpg" },
    { id: "lion",     category: "felines", name: "Lion",     emoji: "🦁" },
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
