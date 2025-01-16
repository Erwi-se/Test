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

function getCard() {
  const slider = document.getElementById("cardRange");
  const cardCount = slider.value;
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

  // Create and append new card elements
  for (let i = 0; i < cardCount; i++) {
    let cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.id = id[i];
    cardElement.onclick = function() {
      this.classList.toggle('flipped');
      getDes(result[i]);      
    };

    let frontFace = document.createElement('img');
    frontFace.src = "tarot_back.png";
    frontFace.alt = `Tarot Card ${i + 1}`;
    frontFace.classList.add('front');

    let backFace = document.createElement('img');
    backFace.src = result[i] + "_tarot.png";
    backFace.alt = `Tarot Card ${i + 1}`;
    backFace.classList.add('back');

    cardElement.appendChild(frontFace);
    cardElement.appendChild(backFace);
    mainElement.appendChild(cardElement);
  }

  console.log(result);
}

function getDes(cardIndex) {
  const description = tarotDescriptions[cardIndex];
  document.getElementById("description").innerHTML = description;
}

// Add an event listener to update the card count display
document.addEventListener("DOMContentLoaded", function() {
  const slider = document.getElementById("cardRange");

  if (slider) {  // Check if the element exists
    slider.addEventListener("input", function() {
      document.getElementById("cardCount").textContent = this.value;
    });
  } else {
    console.error("Element with ID 'cardRange' not found.");
  }
});