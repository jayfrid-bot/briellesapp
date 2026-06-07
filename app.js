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
