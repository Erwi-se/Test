// Tarot card descriptions
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

// Main function to generate random tarot cards
function randomGenerateCard() {
  const slider = document.getElementById("cardRange");
  const cardCount = slider.value;

  const array = [...Array(22).keys()];
  const result = [];

  const mainElement = document.querySelector('main.container');
  mainElement.innerHTML = '';

  for (let i = 1; i <= cardCount; i++) {
    const random = Math.floor(Math.random() * (22 - i));
    result.push(array[random]);
    array[random] = array[22 - i];
  }
  
  const rowSize = cardCount % 2 === 0 ? 4 : 3;
  creatRowContainer(mainElement, rowSize, cardCount, result);
}

// Functions to create row container
function creatRowContainer(mainElement, rowSize, cardCount, result) {
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

// Functions to create card element
function createCardElement(index, cardValue) {
  const cardElement = document.createElement('div');
  cardElement.classList.add('card');
  cardElement.id = `card-${index + 1}`;
  cardElement.style.animationDelay = `${index / (2*index+4)}s`;
  cardElement.onclick = function () {
    if (!this.classList.contains('flipped')) {
      this.classList.toggle('flipped');
    }
    getDescription(cardValue);
  };

  const frontFace = createFrontFace();
  cardElement.appendChild(frontFace); 
  
  const frontImg = createFrontImg(index, cardValue);
  frontFace.appendChild(frontImg);

  const backFace = createBackFace();
  cardElement.appendChild(backFace);
  
  const deleteButton = createDeleteButton();
  frontFace.appendChild(deleteButton);

  const draggableZone = createDraggableZone();
  frontFace.appendChild(draggableZone);   

  return cardElement;
}

// Helper functions to create individual parts of card elements
function createFrontFace() {
  const frontFace = document.createElement('div');
  frontFace.classList.add('front');
  
  return frontFace;
}

function createFrontImg(index, cardValue) {
  const frontImg = document.createElement('img');
  frontImg.src = "img/" + cardValue + "_tarot.png";
  frontImg.alt = `Tarot Card ${index + 1}`;
  
  return frontImg;
}

function createBackFace() {
  const backFace = document.createElement('img');
  backFace.src = "img/tarot_back.png";
  backFace.alt = `Unknown`;
  backFace.classList.add('back');
  
  return backFace;
}

function createDeleteButton() {
  const deleteButton = document.createElement('div');
  deleteButton.classList.add('delete-button');
  
  return deleteButton;
}

function createDraggableZone() {
  const draggableZone = document.createElement('div');
  draggableZone.classList.add('draggable-zone');
  
  return draggableZone; 
}

// Function to get the description of a card
function getDescription(cardIndex) {
  const description = tarotDescriptions[cardIndex];
  document.getElementById("description").innerHTML = description;
}

// Event listener for the card range slider
const slider = document.getElementById('cardRange');
slider.addEventListener("input", function () {
  document.getElementById("cardCount").textContent = this.value;
});