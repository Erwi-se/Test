const tarotDescriptions = {
  0: "The Fool",
  1: "The Magician",
  2: "The High Priestess",
  3: "The Empress",
  4: "The Emperor",
  5: "The Hierophant",
  6: "The Lovers",
  7: "The Chariot", 
  8: "Strength",
  9: "The Hermit",
  10: "Wheel of Fortune",
  11: "Justice",
  12: "The Hanged Man",
  13: "Death",
  14: "Temperance",
  15: "The Devil",
  16: "The Tower",
  17: "The Star",
  18: "The Moon",
  19: "The Sun", 
  20: "Judgement",
  21: "The World"
}; 

function getCard() {
  const slider = document.getElementById("cardRange");
  const cardCount = slider.value;

  const array = [...Array(22).keys()];
  const result = [];

  const mainElement = document.querySelector('main.container');
  if (mainElement) {
    mainElement.innerHTML = '';
  }

  for (let i = 1; i <= cardCount; i++) {
    const random = Math.floor(Math.random() * (22 - i));
    result.push(array[random]);
    array[random] = array[22 - i];
  }

  const rowSize = cardCount % 2 === 0 ? 4 : 3;

  createCardElements(mainElement, rowSize, cardCount, result);
}

function createCardElements(mainElement, rowSize, cardCount, result) {
  let rowContainer = null;

  for (let i = 0; i < cardCount; i++) {
    if (i % rowSize === 0) {
      rowContainer = document.createElement('div');
      rowContainer.classList.add('row-container');
      mainElement.appendChild(rowContainer);
    }

    const cardElement = createCardElement(i, result[i]);
    rowContainer.appendChild(cardElement);
  }
}

function createCardElement(index, cardValue) {
  const cardElement = document.createElement('div');
  cardElement.classList.add('card');
  cardElement.id = `card-${index + 1}`;
  cardElement.style.animationDelay = `${0.5 - (1 / (index + 2))}s`;
  cardElement.onclick = function () {
    if (!this.classList.contains('flipped')) {
      this.classList.toggle('flipped');
    }
    getDescription(cardValue);
  };

  const frontFace = document.createElement('div');
  frontFace.classList.add('front');
  const frontImg = document.createElement('img');
  frontImg.src = "img/" + cardValue + "_tarot.png";
  frontImg.alt = `Tarot Card ${index + 1}`;
  frontFace.appendChild(frontImg);

  const deleteButton = createDeleteButton(cardElement);
  frontFace.appendChild(deleteButton);

  const draggableZone = createDraggableZone(cardElement);
  frontFace.appendChild(draggableZone);

  const backFace = document.createElement('img');
  backFace.src = "img/tarot_back.png";
  backFace.alt = `Unknown`;
  backFace.classList.add('back');

  cardElement.appendChild(frontFace);
  cardElement.appendChild(backFace);

  return cardElement;
}

function createDeleteButton(cardElement) {
  const deleteButton = document.createElement('div');
  deleteButton.classList.add('delete-button');
  deleteButton.onclick = function (event) {
    event.stopPropagation();

    cardElement.classList.add('deleting');

    cardElement.addEventListener('animationend', function handleAnimationEnd() {
      cardElement.remove();
      cardElement.removeEventListener('animationend', handleAnimationEnd);
    });
  };

  return deleteButton;
}

function createDraggableZone(cardElement) {
  const draggableZone = document.createElement('div');
  draggableZone.classList.add('draggable-zone');
  draggableZone.draggable = true;

  draggableZone.ondragstart = function(event) {
    event.dataTransfer.setData("text/plain", cardElement.id);
  };

  draggableZone.addEventListener('touchstart', touchstartHandler, {passive: true});
  draggableZone.addEventListener('touchmove', touchmoveHandler, {passive: true});
  draggableZone.addEventListener('touchend', touchendHandler, {passive: true});

  return draggableZone;
}

let touchstartX = 0;
let touchstartY = 0;

function touchstartHandler(event) {
  touchstartX = event.touches[0].clientX;
  touchstartY = event.touches[0].clientY;
}

function touchmoveHandler(event) {
  const touch = event.touches[0];
  const touchendX = touch.clientX;
  const touchendY = touch.clientY;

  const dx = touchendX - touchstartX;
  const dy = touchendY - touchstartY;

  const cardElement = event.target.closest('.card');
  if (cardElement) {
    cardElement.style.transform = `translate(${dx}px, ${dy}px)`;
  }
}

function touchendHandler(event) {
  const cardElement = event.target.closest('.card');
  if (cardElement) {
    cardElement.style.transform = '';
  }
}

function getDescription(cardIndex) {
  const description = tarotDescriptions[cardIndex];
  document.getElementById("description").innerHTML = description;
}

document.addEventListener("DOMContentLoaded", function () {
  const slider = document.getElementById("cardRange");

  if (slider) {
    slider.addEventListener("input", function () {
      document.getElementById("cardCount").textContent = this.value;
    });
  } else {
    console.error("Element with ID 'cardRange' not found.");
  }
});