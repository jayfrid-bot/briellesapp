// anatomy.js — the recursive BODY EXPLORER. Shared by the flat AND 3D screens.
// It lets you dig deeper and deeper into the body (Head → Teeth → Canines → ...).
// Don't worry if it looks like a lot — it's the same few ideas repeated!

// anatomyPath is the TRAIL of parts from the top down to where we are right now.
// It always starts with a pretend "root" that holds the whole animal.
// Example after tapping Head then Teeth:  [Cat, Head, Teeth]
let anatomyPath = [];

// makeRoot wraps the animal so the very top behaves like any other part:
// it has an "image" (the whole-body skeleton) and "parts" (the body regions).
function makeRoot(animal) {
  return {
    name: animal.name,          // "Cat" — shows first in the breadcrumb
    isRoot: true,
    image: animal.skeleton,     // the whole-body picture
    parts: animal.parts         // the top-level regions (Head, Spine, ...)
  };
}

// Start exploring an animal from the very top.
function openAnatomy(animal) {
  anatomyPath = [ makeRoot(animal) ];   // reset the trail to just the root
  renderAnatomy();
}

// The part we are looking at right now = the LAST one in the trail.
function currentNode() {
  return anatomyPath[anatomyPath.length - 1];
}

// Go DEEPER into a part that has its own parts inside it.
function drillInto(node) {
  anatomyPath.push(node);
  renderAnatomy();
}

// Go UP one level (used by the Back button). Never climb past the root.
function anatomyUp() {
  if (anatomyPath.length > 1) {
    anatomyPath.pop();
    renderAnatomy();
  }
}

// Tapping a part — from EITHER a dot or a menu button — runs THIS one function.
// That is why the dots and the menu always agree: they both call pickChild.
function pickChild(child) {
  if (child.parts) {
    drillInto(child);            // it has parts inside → go deeper
    maybeFocus3d(child);         // (bonus) nudge the 3D camera toward it
  } else {
    showBone(child, currentNode());   // no parts → show the fact popup
  }
}

// renderAnatomy re-draws everything for the part we are currently on.
// It fills BOTH the flat screen and the 3D screen, so switching never shows old stuff.
function renderAnatomy() {
  if (anatomyPath.length === 0) return;   // nothing to show yet
  const node = currentNode();
  renderBreadcrumb();      // the trail at the top (Cat › Head › Teeth)
  renderDiagram(node);     // the picture + dots (flat screen only)
  renderMenu(node);        // the buttons for each child (both screens)
}

// The picture with clickable dots — only the FLAT screen has this.
function renderDiagram(node) {
  const diagram = document.getElementById("diagram");
  const img = document.getElementById("skeleton-img");
  const dotsLayer = document.getElementById("dots-layer");

  // Find a picture to show: this part's OWN picture, or the closest one
  // above it (so the skeleton stays on screen while you explore).
  let imageToShow = node.image;
  if (!imageToShow) {
    for (let i = anatomyPath.length - 1; i >= 0; i--) {
      if (anatomyPath[i].image) { imageToShow = anatomyPath[i].image; break; }
    }
  }

  // No picture anywhere → hide the diagram, show only the menu.
  if (!imageToShow) {
    diagram.classList.add("hidden");
    return;
  }

  img.src = imageToShow;
  diagram.classList.remove("hidden");

  // Put a dot on each child — but ONLY when we're showing THIS part's own
  // picture (a child's x/y belongs to its parent's picture). If we're only
  // borrowing an ancestor's picture as a backdrop, show no dots.
  dotsLayer.innerHTML = "";
  if (node.image) {
    (node.parts || []).forEach(function (child) {
      if (child.x == null || child.y == null) return;   // no position → no dot
      const dot = document.createElement("button");
      dot.className = "dot";
      dot.style.left = child.x + "%";
      dot.style.top = child.y + "%";
      dot.onclick = function () { pickChild(child); };   // same action as the menu
      dotsLayer.appendChild(dot);
    });
  }
}

// The button MENU of children — both screens get a copy.
function renderMenu(node) {
  ["anatomy-menu-flat", "anatomy-menu-3d"].forEach(function (menuId) {
    const menu = document.getElementById(menuId);
    if (!menu) return;
    menu.innerHTML = "";
    (node.parts || []).forEach(function (child) {
      const button = document.createElement("button");
      button.className = "category-button anatomy-button";   // reuse the card look
      button.innerHTML =
        '<span class="cat-name">' + child.name + '</span>' +
        (child.parts ? '<span class="drill-arrow">›</span>' : '');
      button.onclick = function () { pickChild(child); };
      menu.appendChild(button);
    });
  });
}

// The breadcrumb trail (Cat › Head › Teeth). Each chip jumps back to that level.
function renderBreadcrumb() {
  ["anatomy-crumb-flat", "anatomy-crumb-3d"].forEach(function (crumbId) {
    const bar = document.getElementById(crumbId);
    if (!bar) return;
    bar.innerHTML = "";
    anatomyPath.forEach(function (node, i) {
      const chip = document.createElement("button");
      chip.className = "crumb";
      chip.textContent = node.name;
      const depth = i;
      chip.onclick = function () {
        anatomyPath = anatomyPath.slice(0, depth + 1);   // jump back up to here
        renderAnatomy();
      };
      bar.appendChild(chip);
      if (i < anatomyPath.length - 1) {
        const sep = document.createElement("span");
        sep.className = "crumb-sep";
        sep.textContent = "›";
        bar.appendChild(sep);
      }
    });
  });
}

// (Bonus) If we're on the 3D screen, swing the camera toward this region.
// Does nothing if the part has no focus3d or the 3D isn't ready.
function maybeFocus3d(node) {
  if (currentScreenId === "skeleton3d-screen" && typeof focusCamera3d === "function") {
    focusCamera3d(node.focus3d);
  }
}
