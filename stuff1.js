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
  const slider = document.getElementById("cardRange");
  const cardCount = slider.value;

  // Create an array with indices 0 to 21
  let array = [...Array(22).keys()];
  let result = [];
  let id = [...Array(cardCount).keys()].map(i => i + 1);

  // Clear existing images
  const mainElement = document.querySelector('main.container');
  mainElement.innerHTML = '';

  // Generate random cards
  for (let i = 1; i <= cardCount; i++) {
    const random = Math.floor(Math.random() * (22 - i));
    result.push(array[random]);
    array[random] = array[22 - i];
  }

  // Determine the row size
  const rowSize = cardCount % 2 === 0 ? 4 : 3;

  // Create and append new card elements
  let rowContainer = null;
  for (let i = 0; i < cardCount; i++) {
    // Create a new row container every 'rowSize' cards
    if (i % rowSize === 0) {
      rowContainer = document.createElement('div');
      rowContainer.classList.add('row-container');
      mainElement.appendChild(rowContainer);
    }

    let cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.id = id[i];
    cardElement.style.animationDelay = `${0.5 - (1 / (i+2) ) }s`; // Add animation delay for chain effect
    cardElement.onclick = function() {
      if (!this.classList.contains('flipped')) {
        this.classList.toggle('flipped');
      }
      getDes(result[i]);
    };

    // Create front face div and append img to it
    let frontFace = document.createElement('div');
    frontFace.classList.add('front');
    let frontImg = document.createElement('img');
    frontImg.src = "img/" + result[i] + "_tarot.png";
    frontImg.alt = `Tarot Card ${i + 1}`;
    frontFace.appendChild(frontImg);
    
    // Create delete button for front face
    let deleteButton = document.createElement('div');
    deleteButton.classList.add('delete-button');    
    deleteButton.onclick = function(event) {
      event.stopPropagation(); // Prevent card flip
      cardElement.remove(); // Remove the card element
    };
    frontFace.appendChild(deleteButton);
    
    // Create back face of the card with a generic tarot back image
    let backFace = document.createElement('img');
    backFace.src = "img/tarot_back.png";
    backFace.alt = `Unknown`;
    backFace.classList.add('back');   
    
    // Append both faces to the card element
    cardElement.appendChild(frontFace); 
    cardElement.appendChild(backFace);

    // Append the card element to the current row container
    rowContainer.appendChild(cardElement);
  }

  console.log(result);
}

// Function to display the description of a tarot card
function getDes(cardIndex) {
  const description = tarotDescriptions[cardIndex];
  document.getElementById("description").innerHTML = description;
}

// Add an event listener to update the card count display
document.addEventListener("DOMContentLoaded", function() {
  const slider = document.getElementById("cardRange");

  if (slider) {
    slider.addEventListener("input", function() {
      document.getElementById("cardCount").textContent = this.value;
    });
  } else {
    console.error("Element with ID 'cardRange' not found.");
  }
});