document.addEventListener('DOMContentLoaded', preloadImages);

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

const CardState = {
  INITIAL: 'initial',
  DRAWING: 'drawing',
  DRAWN: 'drawn',
  FLIPPING: 'flipping',
  FLIPPED: 'flipped',
  SELECTED: 'selected',
  DRAGGING: 'dragging',
  DELETING: 'deleting'
}; 

let lastDrawTime = 0;
const RATE_LIMIT_COOLDOWN = 1000;

// Main function to generate random tarot cards
function randomGenerateCard() {
  const slider = document.getElementById("cardRange");
  const cardCount = slider.value;

  const array = [...Array(22).keys()];
  const result = [];
  
  const currentTime = Date.now();
  const timeElapsed = currentTime - lastDrawTime;
  
  if (timeElapsed < RATE_LIMIT_COOLDOWN) {
    return; // Don't proceed with card generation if within cooldown
  }

  // Update last draw time
  lastDrawTime = currentTime;

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
  
  // Set initial state
  cardElement.dataset.state = CardState.INITIAL;
  
  // Start drawing animation
  cardElement.style.animationDelay = `${index / (2*index+4)}s`;
  cardElement.dataset.state = CardState.DRAWING;
  
  cardElement.addEventListener('animationend', () => {
    cardElement.style.opacity = 1;
    cardElement.dataset.state = CardState.DRAWN;
    cardElement.style.animationDelay = '';
  });
  
  // Handle card click for flipping
  cardElement.onclick = function() {
    if (this.dataset.state === CardState.DRAWN) {
      this.dataset.state = CardState.FLIPPING;
      deselectAllCards(this);
      
      // After flip animation completes
      this.addEventListener('transitionend', () => {
        if (this.dataset.state === CardState.FLIPPING) {
          this.dataset.state = CardState.FLIPPED;
        }
      }, { once: true });
    getDescription(cardValue);
    
    }
    // Handle selection - moved inside the main click handler
    else if (this.dataset.state === CardState.FLIPPED) {
      deselectAllCards(this); // Deselect all other cards
      this.dataset.state = CardState.SELECTED;
      getDescription(cardValue);    
    } else if (this.dataset.state === CardState.SELECTED) {
      this.dataset.state = CardState.FLIPPED;
    }
  };

  const frontFace = createFrontFace();
  cardElement.appendChild(frontFace); 
  
  const frontImg = createFrontImg(index, cardValue);
  frontFace.appendChild(frontImg);

  const backFace = createBackFace();
  cardElement.appendChild(backFace);
  
  const deleteButton = createDeleteButton(cardElement);
  frontFace.appendChild(deleteButton);

  const draggableZone = createDraggableZone(cardElement);
  frontFace.appendChild(draggableZone);

  return cardElement;
}

// Add this function to handle deselecting all other cards
function deselectAllCards(exceptCard) {
  const selectedCards = document.querySelectorAll(`.card[data-state="${CardState.SELECTED}"]`);
  selectedCards.forEach(card => {
    if (card !== exceptCard) {
      card.dataset.state = CardState.FLIPPED;
    }
  });
}

// Helper functions to create individual parts of card elements
function createFrontFace() {
  const frontFace = document.createElement('div');
  frontFace.classList.add('front');
  
  return frontFace;
}

function createFrontImg(index, cardValue) {
  const frontImg = document.createElement('img');
  frontImg.loading = "lazy"; // Add lazy loading  
  frontImg.src = "img/" + cardValue + "_tarot.png";
  frontImg.alt = `Tarot Card ${index + 1}`;
  frontImg.decoding = "async"; // Add async decoding
  
  return frontImg;
}

function createBackFace() {
  const backFace = document.createElement('img');
  backFace.src = "img/tarot_back.png";
  backFace.alt = `Unknown`;
  backFace.classList.add('back');
  
  return backFace;
}

 
function createDeleteButton(cardElement) {
  const deleteButton = document.createElement('div');
  deleteButton.classList.add('delete-button');
  
  function handleDelete(e) {
    e.stopPropagation(); // Prevent card click
    
    // Set state to DELETING
    cardElement.dataset.state = CardState.DELETING;
    
    // Add animation end listener to remove card after animation completes
    cardElement.addEventListener('animationend', () => {
      
        cardElement.remove();
        
        // Update the layout if needed
        updateLayout();
      
    }, { once: true });
  }
  
  deleteButton.addEventListener('click', handleDelete);
  
  return deleteButton;
}

function createDraggableZone(cardElement) {
  const draggableZone = document.createElement('div');
  draggableZone.classList.add('draggable-zone');
  
  // Dragging state handling
  draggableZone.addEventListener('mousedown', (e) => {
    if ([CardState.FLIPPED, CardState.SELECTED].includes(cardElement.dataset.state)) {
      cardElement.dataset.state = CardState.DRAGGING;
      cardElement.style.cursor = 'grabbing';
      cardElement.style.zIndex = '1000';
    }
  });
  
  document.addEventListener('mouseup', () => {
    if (cardElement.dataset.state === CardState.DRAGGING) {
      cardElement.dataset.state = CardState.FLIPPED;
      cardElement.style.cursor = '';
      cardElement.style.zIndex = '';
    }
  }); 
  
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

// Call this when the page loads 
function preloadImages() {
  // Preload card backs
  new Image().src = "img/tarot_back.png";
    
  // Preload all tarot cards
  for (let i = 0; i < 22; i++) {
    new Image().src = `img/${i}_tarot.png`;
   }
}
