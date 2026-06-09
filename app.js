// app.js — this is the BRAIN of your app. It makes buttons DO things.
// In JavaScript, "//" starts a comment (a note the computer ignores).

// These two boxes remember the age you picked and your learning mode.
// "let" makes a box whose value can CHANGE later (unlike "const").
let currentAge = 10;        // a starting age until you pick one
let currentLevel = "";      // your learning mode (set by setAge below)


// buildAgePicker fills the dropdown with the choices 4, 5, 6 ... 60.
// We use a LOOP so we don't have to type 57 choices by hand!
function buildAgePicker() {
  const picker = document.getElementById("age-picker");

  // A "for" loop counts: start at 4, keep going while age <= 60, add 1 each time.
  for (let age = 4; age <= 60; age = age + 1) {
    const option = document.createElement("option");   // make one choice
    option.value = age;                                // its hidden value
    option.textContent = age + " years old";           // the words you see
    picker.appendChild(option);                        // add it to the dropdown
  }

  // If you picked an age before, the browser remembered it — use it again.
  const savedAge = localStorage.getItem("age");
  if (savedAge) {
    picker.value = savedAge;
  } else {
    picker.value = 10;       // a friendly default the first time
  }

  setAge();   // show the right mode message right away
}


// setAge runs whenever you pick an age. It saves it and picks your MODE.
function setAge() {
  const picker = document.getElementById("age-picker");
  currentAge = Number(picker.value);          // Number() turns text into a real number
  localStorage.setItem("age", currentAge);    // remember it for next time

  // Turn the age into a learning MODE using if / else.
  // (We keep this in currentLevel and use it later for easier/harder words.
  //  We do NOT show it on screen — it just works quietly in the background.)
  if (currentAge <= 7) {
    currentLevel = "Little Explorer";
  } else if (currentAge <= 11) {
    currentLevel = "Junior Scientist";
  } else if (currentAge <= 15) {
    currentLevel = "Bone Detective";
  } else {
    currentLevel = "Anatomy Expert";
  }
}

// currentScreenId remembers which screen we are on right now.
// screenHistory is a TRAIL of the screens we visited (like breadcrumbs 🍞),
// so the Back button knows where to return to.
let currentScreenId = "start-screen";
let screenHistory = [];

// setScreen just SWITCHES to a screen (hide all, show one). No history changes.
function setScreen(screenId) {
  const allScreens = document.querySelectorAll(".screen");
  allScreens.forEach(function (oneScreen) {
    oneScreen.classList.add("hidden");
  });
  document.getElementById(screenId).classList.remove("hidden");
  currentScreenId = screenId;
  updateNavButtons();
}

// showScreen goes FORWARD to a new screen and drops a breadcrumb so Back works.
function showScreen(screenId) {
  if (currentScreenId !== screenId) {
    screenHistory.push(currentScreenId);   // remember where we came from
  }
  setScreen(screenId);
}

// goBack walks back ONE step along the breadcrumb trail.
function goBack() {
  if (screenHistory.length > 0) {
    const previousScreen = screenHistory.pop();
    setScreen(previousScreen);
  }
}

// goHome jumps all the way back to the start and clears the trail.
function goHome() {
  screenHistory = [];
  setScreen("start-screen");
}

// Show or hide the Home and Back buttons depending on where we are.
function updateNavButtons() {
  const homeButton = document.getElementById("home-button");
  const backButton = document.getElementById("back-button");

  // Home shows on every screen except the very first one.
  if (currentScreenId === "start-screen") {
    homeButton.classList.add("hidden");
  } else {
    homeButton.classList.remove("hidden");
  }

  // Back shows only when there is somewhere to go back to.
  if (currentScreenId !== "start-screen" && screenHistory.length > 0) {
    backButton.classList.remove("hidden");
  } else {
    backButton.classList.add("hidden");
  }
}


// openCategory runs when you click an animal-group card (like "Felines").
// It builds a button for every animal in that group, then shows the screen.
function openCategory(categoryId) {

  // 1) Find this group's info so we can show its name as the title.
  //    .find() looks through the list and grabs the FIRST match.
  const category = DATA.categories.find(function (c) {
    return c.id === categoryId;
  });
  document.getElementById("category-title").textContent =
    category.emoji + " " + category.name;

  // 2) Find ALL the animals that belong to this group.
  //    .filter() keeps only the items that pass the test.
  const animalsHere = DATA.animals.filter(function (animal) {
    return animal.category === categoryId;
  });

  // 3) Empty out the old buttons before adding new ones.
  const list = document.getElementById("animal-list");
  list.innerHTML = "";

  // 4) If this group has no animals yet, show a friendly message.
  if (animalsHere.length === 0) {
    list.innerHTML = "<p>No animals here yet — add some in data.js! 🐾</p>";
  } else {
    // Otherwise, make one card-button for EACH animal.
    animalsHere.forEach(function (animal) {
      const button = document.createElement("button");      // make a new button
      button.className = "category-button";                 // give it the card look

      // Choose the picture: a real PHOTO if the animal has one, else the emoji.
      let picture;
      if (animal.photo) {
        picture = '<img class="cat-pic" src="' + animal.photo + '" alt="' + animal.name + '">';
      } else {
        picture = '<span class="cat-pic">' + animal.emoji + '</span>';
      }

      button.innerHTML = picture + '<span class="cat-name">' + animal.name + '</span>';

      // When you click this animal, open its skeleton!
      button.onclick = function () {
        openAnimal(animal.id);
      };

      list.appendChild(button);                             // put it on the page
    });
  }

  // 5) Finally, switch to the animals screen.
  showScreen("category-screen");
}


// currentAnimal remembers which animal you are looking at right now.
let currentAnimal = null;

// openAnimal runs when you click an animal. It opens its skeleton.
function openAnimal(animalId) {
  // Find the animal in our data and remember it.
  currentAnimal = DATA.animals.find(function (a) {
    return a.id === animalId;
  });

  // Open the (accurate) flat skeleton with clickable dots.
  openFlatSkeleton();
}

// openFlatSkeleton shows the flat (2D picture) skeleton for the current animal.
function openFlatSkeleton() {
  const animal = currentAnimal;

  // Set the title and the skeleton picture.
  document.getElementById("skeleton-title").textContent =
    animal.emoji + " " + animal.name + " Skeleton";
  document.getElementById("skeleton-img").src = animal.skeleton;

  // Clear old dots, then add a dot for each bone.
  const dotsLayer = document.getElementById("dots-layer");
  dotsLayer.innerHTML = "";

  if (animal.parts) {
    animal.parts.forEach(function (part) {
      const dot = document.createElement("button");
      dot.className = "dot";
      dot.style.left = part.x + "%";    // place it across (left-right)
      dot.style.top = part.y + "%";     // place it down (up-down)
      dot.onclick = function () {
        showBone(part);                 // tap the dot -> show the popup
      };
      dotsLayer.appendChild(dot);
    });
  }

  // Show the "See it in 3D" button only if this animal HAS a 3D skeleton.
  const view3dButton = document.getElementById("view3d-button");
  if (animal.has3d) {
    view3dButton.classList.remove("hidden");
  } else {
    view3dButton.classList.add("hidden");
  }

  // Switch to the flat skeleton screen.
  showScreen("skeleton-screen");
}


// currentBone remembers which bone's popup is open (so we can say it out loud).
let currentBone = null;

// showBone fills the popup with the bone's info and shows it.
function showBone(part) {
  currentBone = part;
  document.getElementById("popup-name").textContent = part.name;
  document.getElementById("popup-say").textContent = "Say it: " + part.say;

  // Pick the EASY fact for young kids, the HARD fact for older kids.
  let fact = part.hard;
  if (currentAge <= 11) {
    fact = part.easy;
  }
  document.getElementById("popup-desc").textContent = fact;

  document.getElementById("popup").classList.remove("hidden");   // show it
}

// closePopup hides the popup.
function closePopup() {
  document.getElementById("popup").classList.add("hidden");
}

// speakBone uses the browser's built-in voice to SAY the bone's name out loud!
function speakBone() {
  if (currentBone) {
    const words = new SpeechSynthesisUtterance(currentBone.name);
    speechSynthesis.speak(words);
  }
}


// ===== This runs ONCE when the page first opens =====
buildAgePicker();   // fill the age dropdown and show the starting mode
