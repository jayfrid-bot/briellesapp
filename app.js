// app.js — this is the BRAIN of your app. It makes buttons DO things.
// In JavaScript, "//" starts a comment (a note the computer ignores).

// This is a FUNCTION. A function is a set of steps with a name,
// so you can run all the steps just by saying its name.
// This one is called showScreen. You give it the name of a screen to show.
function showScreen(screenId) {

  // STEP 1: Find ALL the screens and HIDE every single one.
  // (querySelectorAll grabs everything with class "screen".)
  const allScreens = document.querySelectorAll(".screen");
  allScreens.forEach(function (oneScreen) {
    oneScreen.classList.add("hidden");      // add "hidden" = make it disappear
  });

  // STEP 2: Now SHOW just the one screen we asked for.
  // (getElementById finds the screen by its id, then we remove "hidden".)
  document.getElementById(screenId).classList.remove("hidden");

  // STEP 3: Show the Home button on every screen EXCEPT the start screen.
  const homeButton = document.getElementById("home-button");
  if (screenId === "start-screen") {
    homeButton.classList.add("hidden");     // on the start page, hide Home
  } else {
    homeButton.classList.remove("hidden");  // everywhere else, show Home
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
      button.innerHTML =
        '<span class="cat-pic">' + animal.emoji + '</span>' +
        '<span class="cat-name">' + animal.name + '</span>';
      // (Next level: clicking this will open the animal's skeleton!)
      list.appendChild(button);                             // put it on the page
    });
  }

  // 5) Finally, switch to the animals screen.
  showScreen("category-screen");
}
