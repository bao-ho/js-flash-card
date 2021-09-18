const flashContainer = document.querySelector(".flash");
const allCards = document.querySelectorAll(".flash--card");
const nope = document.getElementById("nope");
const love = document.getElementById("love");
const flip = document.getElementById("flip");
const sound = document.getElementById("sound");
const moveOutWidth = document.body.clientWidth * 1.5;

let audio;
audio = new Audio("sounds/announcement/sound-on.mp3");

$(() => {
  const $form = $("#control-buttons");

  $form.on("submit", handlePass);

  function handlePass(e) {
    e.preventDefault();
    const options = {
      method: $form.attr("method"),
      url: $form.attr("action"),
      data: $form.serialize(),
    };
    $.ajax(options).done((response) => {
      console.log(response);
    });
  }
});

$(function () {
  setTimeout(function () {
    $("#auto-hide").fadeOut(1500);
  }, 3000);
});

function playSound(card) {
  const content = card.children[0];
  // Play the word, only if sound is not muted
  if (!document.getElementById("sound").classList.contains("muted")) {
    if (content.classList.contains("is-flipped")) {
      const fileName =
        card.children[0].children[1].children[0].innerHTML + ".mp3";
      audio.src = `sounds/en/${fileName}`;
    } else {
      const fileName =
        card.children[0].children[0].children[1].innerHTML + ".mp3";
      audio.src = `sounds/sv/${fileName}`;
    }
    audio.play();
  }
}

function initCards() {
  const newCards = document.querySelectorAll(".flash--card:not(.removed)");
  if (newCards.length > 0) {
    newCards.forEach((card, index) => {
      card.style.zIndex = allCards.length - index;
      card.style.transform = `scale(${1 - index / 51}) translateY(${
        -10 * index
      }px)`;
    });
    flashContainer.classList.add("loaded");

    playSound(newCards[0]);
  }
}

initCards();

function animateCardsAndSubmitResult(card, transform, result) {
  const cards = document.querySelectorAll(".flash--card:not(.removed)");

  // We need a way to pass result of the current word to backend
  // We use hidden text inputs in the form, backend will get them in req.body
  const hiddenNext = document.getElementById("hidden-input-next");
  hiddenNext.value = "";

  // When cards are out, we have to render the page again
  if (cards.length === 1) hiddenNext.value = "render";
  hiddenNext.value += result;

  const hiddenWordIndex = document.getElementById("hidden-input-word-index");
  hiddenWordIndex.value = card.children[0].children[0].children[2].innerHTML;

  card.style.transform = transform;
  card.classList.add("removed");
  card.style.zIndex = 0;
  initCards();
  // Wait for the CSS animation before submit
  setTimeout(() => {
    const form = document.getElementById("control-buttons");
    const $ajaxForm = $("#control-buttons");
    if (cards.length === 1) {
      form.submit();
    } else {
      $ajaxForm.submit();
    }
  }, 500);
}

allCards.forEach(function (el) {
  const front = el.children[0].children[0];
  const back = el.children[0].children[1];
  [front, back].forEach((sideElement) => {
    const hammertime = new Hammer(sideElement);
    hammertime.on("pan", function (event) {
      const card = event.target.parentElement.parentElement;
      card.classList.add("moving");
      if (event.deltaX === 0) return;
      if (event.center.x === 0 && event.center.y === 0) return;

      flashContainer.classList.toggle("flash_love", event.deltaX > 0);
      flashContainer.classList.toggle("flash_nope", event.deltaX < 0);

      const xMulti = event.deltaX * 0.03;
      const yMulti = event.deltaY * 0.0125;
      const rotate = xMulti * yMulti;

      // event.target.style.transform = `translate(${event.deltaX}px, ${event.deltaY}px) rotate(${rotate}deg)`;
      card.style.transform = `translate(${event.deltaX}px, ${event.deltaY}px) rotate(${rotate}deg)`;
      // el.children[0].style.transform = `translate(${event.deltaX}px, ${event.deltaY}px) rotate(${rotate}deg)`;
    });

    hammertime.on("panend", function (event) {
      const card = event.target.parentElement.parentElement;
      card.classList.remove("moving");
      flashContainer.classList.remove("flash_love");
      flashContainer.classList.remove("flash_nope");
      const keep =
        Math.abs(event.deltaX) < 80 || Math.abs(event.velocityX) < 0.5;

      if (keep) {
        card.style.transform = "";
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

        const transform = `translate(${toX}px, ${
          toY + event.deltaY
        }px) rotate(${rotate}deg)`;

        const result = toX > 0 ? "pass" : "";
        animateCardsAndSubmitResult(card, transform, result);
      }
    });

    hammertime.on("tap", function (event) {
      flip.click();
    });
  });
});

function createButtonListener(buttonName) {
  return function (event) {
    // Default is submitting form.
    // We will submit form by javascrip and jQuery instead
    event.preventDefault();
    const cards = document.querySelectorAll(".flash--card:not(.removed)");
    if (!cards.length) return false;
    const card = cards[0];
    let transform;
    switch (buttonName) {
      case "love":
        transform = `translate(${moveOutWidth}px, -100px) rotate(-30deg)`;
        animateCardsAndSubmitResult(card, transform, "pass");
        break;
      case "nope":
        transform = `translate(${-moveOutWidth}px, -100px) rotate(30deg)`;
        animateCardsAndSubmitResult(card, transform, "");
        break;
      case "flip":
        const content = card.children[0];
        content.classList.toggle("is-flipped");
        playSound(card);
        break;
      case "sound":
        const sound = document.getElementById("sound");
        sound.classList.toggle("muted");
        playSound(card);
        break;
      default:
        break;
    }
  };
}

nope.addEventListener("click", createButtonListener("nope"));
flip.addEventListener("click", createButtonListener("flip"));
love.addEventListener("click", createButtonListener("love"));
sound.addEventListener("click", createButtonListener("sound"));

document.addEventListener("keyup", (e) => {
  switch (e.code) {
    case "ArrowRight":
      love.click();
      break;
    case "ArrowLeft":
      nope.click();
      break;
    case "ArrowUp":
      flip.click();
      break;
    case "ArrowDown":
      sound.click();
      break;
    default:
      break;
  }
});
