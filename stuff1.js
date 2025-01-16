// Mapping of card indices to descriptions
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

// Function to generate and display random tarot cards
function getCard() {
  console.log("getCard called");
  const slider = document.getElementById("cardRange");
  const cardCount = slider.value;
  console.log(`cardCount: ${cardCount}`);

  // Create an array with indices 0 to 21
  const array = [...Array(22).keys()];
  const result = [];

  // Clear existing images
  const mainElement = document.querySelector('main.container');
  if (mainElement) {
    mainElement.innerHTML = '';
  }
  console.log("Cleared existing images");

  // Generate random cards
  for (let i = 1; i <= cardCount; i++) {
    const random = Math.floor(Math.random() * (22 - i));
    result.push(array[random]);
    array[random] = array[22 - i];
  }
  console.log(`Generated random cards: ${result}`);

  // Determine the row size
  const rowSize = cardCount % 2 === 0 ? 4 : 3;
  console.log(`rowSize: ${rowSize}`);

  // Create and append new card elements
  createCardElements(mainElement, rowSize, cardCount, result);
}

// Function to create and append new card elements
function createCardElements(mainElement, rowSize, cardCount, result) {
  let rowContainer = null;
  console.log("Creating card elements");

  for (let i = 0; i < cardCount; i++) {
    // Create a new row container every 'rowSize' cards
    if (i % rowSize === 0) {
      rowContainer = document.createElement('div');
      rowContainer.classList.add('row-container');
      mainElement.appendChild(rowContainer);
      console.log("Created new row container");
    }

    const cardElement = createCardElement(i, result[i]);
    rowContainer.appendChild(cardElement);
    console.log(`Appended card element with id: ${cardElement.id}`);
  }
}

// Function to create a single card element
function createCardElement(index, cardValue) {
  const cardElement = document.createElement('div');
  cardElement.classList.add('card');
  cardElement.id = `card-${index + 1}`; // Use a unique ID for each card
  cardElement.style.animationDelay = `${0.5 - (1 / (index + 2))}s`; // Add animation delay for chain effect
  cardElement.onclick = function () {
    if (!this.classList.contains('flipped')) {
      this.classList.toggle('flipped');
    }
    getDescription(cardValue);
  };

  // Create front face div and append img to it
  const frontFace = document.createElement('div');
  frontFace.classList.add('front');
  const frontImg = document.createElement('img');
  frontImg.src = "img/" + cardValue + "_tarot.png";
  frontImg.alt = `Tarot Card ${index + 1}`;
  frontFace.appendChild(frontImg);

  // Create delete button for front face
  const deleteButton = createDeleteButton(cardElement);
  frontFace.appendChild(deleteButton);

  // Create back face of the card with a generic tarot back image
  const backFace = document.createElement('img');
  backFace.src = "img/tarot_back.png";
  backFace.alt = `Unknown`;
  backFace.classList.add('back');

  // Append both faces to the card element
  cardElement.appendChild(frontFace);
  cardElement.appendChild(backFace);

  console.log(`Created card element with id: ${cardElement.id}`);
  return cardElement;
}

// Function to create a delete button
function createDeleteButton(cardElement) {
  const deleteButton = document.createElement('div');
  deleteButton.classList.add('delete-button');
  deleteButton.onclick = function (event) {
    event.stopPropagation(); // Prevent card flip

    console.log(`Delete button clicked for cardElement with id: ${cardElement.id}`);
    // Add the deleting class to the card element
    cardElement.classList.add('deleting');
    console.log(`Added deleting class to cardElement with id: ${cardElement.id}`);

    // Remove the card element after the animation completes
    cardElement.addEventListener('animationend', function () {
      console.log(`Animation ended for cardElement with id: ${cardElement.id}`);
      cardElement.remove();
    }, { once: true });
  };

  return deleteButton;
}

// Function to display the description of a tarot card
function getDescription(cardIndex) {
  const description = tarotDescriptions[cardIndex];
  document.getElementById("description").innerHTML = description;
  console.log(`Description displayed for cardIndex: ${cardIndex}`);
}

// Add an event listener to update the card count display
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