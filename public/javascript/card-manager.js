const flashContainer = document.querySelector(".flash");
const allCards = document.querySelectorAll(".flash--card");
const nope = document.getElementById("nope");
const love = document.getElementById("love");

function initCards() {
  const newCards = document.querySelectorAll(".flash--card:not(.removed)");
  newCards.forEach((card, index) => {
    card.style.zIndex = allCards.length - index;
    card.style.transform = `scale(${1 - index / 51}) translateY(${
      -10 * index
    }px)`;
    // card.style.opacity = 1 - index / 10;
  });
  flashContainer.classList.add("loaded");

  // Play the first word
  const audio = new Audio(`sounds/sv/${newCards[0].id}.mp3`);
  audio.play();
}

initCards();

allCards.forEach(function (el) {
  const hammertime = new Hammer(el);

  hammertime.on("pan", function (event) {
    el.classList.add("moving");
    if (event.deltaX === 0) return;
    if (event.center.x === 0 && event.center.y === 0) return;

    flashContainer.classList.toggle("flash_love", event.deltaX > 0);
    flashContainer.classList.toggle("flash_nope", event.deltaX < 0);

    const xMulti = event.deltaX * 0.03;
    const yMulti = event.deltaY * 0.0125;
    const rotate = xMulti * yMulti;

    event.target.style.transform = `translate(${event.deltaX}px, ${event.deltaY}px) rotate(${rotate}deg)`;
  });

  hammertime.on("panend", function (event) {
    el.classList.remove("moving");
    flashContainer.classList.remove("flash_love");
    flashContainer.classList.remove("flash_nope");

    const moveOutWidth = document.body.clientWidth*1.5;
    const keep = Math.abs(event.deltaX) < 80 || Math.abs(event.velocityX) < 0.5;

    event.target.classList.toggle("removed", !keep);

    if (keep) {
      event.target.style.transform = "";
    } else {
      const endX = Math.max(
        Math.abs(event.velocityX) * moveOutWidth,
        moveOutWidth
      );
      const toX = event.deltaX > 0 ? endX : -endX;
      const endY = Math.abs(event.velocityY) * moveOutWidth;
      const toY = event.deltaY > 0 ? endY : -endY;
      const xMulti = event.deltaX * 0.03;
      const yMulti = event.deltaY * 0.0125;
      const rotate = xMulti * yMulti;

      event.target.style.transform = `translate(${toX}px, ${
        toY + event.deltaY
      }px) rotate(${rotate}deg)`;
      initCards();
      const form = document.getElementById("control-buttons");
      form.submit();
    }
  });
});

function createButtonListener(buttonName) {
  return function (event) {
    console.log("button pressed");
    const cards = document.querySelectorAll(".flash--card:not(.removed)");

    const hidden = document.getElementById("hidden-input-next");
    hidden.value = "";

    // When cards are out, we have to render the page again
    if (cards.length === 1) hidden.value = "render";

    const moveOutWidth = document.body.clientWidth * 1.5;
    if (!cards.length) return false;
    const card = cards[0];
    switch (buttonName) {
      case "love":
        card.classList.add("removed");
        card.style.transform = `translate(${moveOutWidth}px, -100px) rotate(-30deg)`;
        hidden.value += "pass";
        initCards();
        break;
      case "nope":
        card.classList.add("removed");
        card.style.transform = `translate(${-moveOutWidth}px, -100px) rotate(30deg)`;
        initCards();
        break;
      case "flip":
        const content = card.children[0];
        content.classList.toggle("is-flipped");
        // Play the first word
        let audio;
        if (content.classList.contains("is-flipped"))
          audio = new Audio(`sounds/en/${card.id}.mp3`);
        else audio = new Audio(`sounds/sv/${card.id}.mp3`);
        audio.play();
        event.preventDefault();
        break;
      default:
        break;
    }
  };
}

const nopeListener = createButtonListener("nope");
const flipListener = createButtonListener("flip");
const loveListener = createButtonListener("love");

nope.addEventListener("click", nopeListener);
flip.addEventListener("click", flipListener);
love.addEventListener("click", loveListener);
