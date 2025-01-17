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
  
  // Set initial state
  cardElement.dataset.state = CardState.INITIAL;
  cardElement.dataset.loading = "true"; // Add loading state
  
  // Create loading spinner
  const spinner = document.createElement('div');
  spinner.classList.add('loading-spinner');
  cardElement.appendChild(spinner);
  
  // Start drawing animation
  cardElement.style.animationDelay = `${index / (2*index+4)}s`;
  cardElement.dataset.state = CardState.DRAWING;
  
  cardElement.addEventListener('animationend', () => {
    cardElement.style.opacity = 1;
    cardElement.dataset.state = CardState.DRAWN;
  });
  
  // Handle card click for flipping
  cardElement.onclick = function() {
    if (this.dataset.state === CardState.DRAWN) {
      this.dataset.state = CardState.FLIPPING;
      this.style.transform = 'rotateY(180deg)';
      
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
      this.style.transform = 'rotateY(180deg) scale(1.05)';
    } else if (this.dataset.state === CardState.SELECTED) {
      this.dataset.state = CardState.FLIPPED;
      this.style.transform = 'rotateY(180deg)';
    }
  };

  const frontFace = createFrontFace();
  cardElement.appendChild(frontFace); 
  
  const frontImg = createFrontImg(index, cardValue);
  frontFace.appendChild(frontImg);

  const backFace = createBackFace();
  cardElement.appendChild(backFace);
  
  setupImageLoadHandlers(frontImg, cardElement);
  setupImageLoadHandlers(backFace, cardElement);
  
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
      card.style.transform = 'rotateY(180deg)';
    }
  });
}

// Helper functions to create individual parts of card elements
function createFrontFace() {
  const frontFace = document.createElement('div');
  frontFace.classList.add('front');
  
  return frontFace;
}

// Modify createFrontImg function
function createFrontImg(index, cardValue) {
  const frontImg = document.createElement('img');
  frontImg.loading = "lazy";
  
  // Create a new image object to preload
  const tempImg = new Image();
  tempImg.src = "img/" + cardValue + "_tarot.png";
  
  // Only set the actual image src after preloading
  tempImg.onload = () => {
    frontImg.src = tempImg.src;
  };
  
  tempImg.onerror = () => {
    console.error(`Failed to load image: ${tempImg.src}`);
    frontImg.dataset.error = "true";
  };
  
  frontImg.alt = `Tarot Card ${index + 1}`;
  frontImg.decoding = "async";
  
  return frontImg;
}

// Modify createBackFace function
function createBackFace() {
  const backFace = document.createElement('img');
  
  // Create a new image object to preload
  const tempImg = new Image();
  tempImg.src = "img/tarot_back.png";
  
  // Only set the actual image src after preloading
  tempImg.onload = () => {
    backFace.src = tempImg.src;
  };
  
  tempImg.onerror = () => {
    console.error(`Failed to load image: ${tempImg.src}`);
    backFace.dataset.error = "true";
  };
  
  backFace.alt = `Unknown`;
  backFace.classList.add('back');
  
  return backFace;
}

 
function createDeleteButton(cardElement) {
  const deleteButton = document.createElement('div');
  deleteButton.classList.add('delete-button');
  
  function handleDelete(e) {
    e.stopPropagation(); // Prevent card click
    
    // Force state to DELETING
    cardElement.dataset.state = CardState.DELETING;
    
    // Remove the card
    if (cardElement && cardElement.parentNode) {
      cardElement.parentNode.removeChild(cardElement);
    }
  }

  // Add the event listener
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

// Add this new function to handle image loading
function setupImageLoadHandlers(imgElement, cardElement) {
  imgElement.addEventListener('load', () => {
    cardElement.dataset.loading = "false";
  });

  imgElement.addEventListener('error', () => {
    cardElement.dataset.loading = "false";
    cardElement.dataset.error = "true";
    console.error(`Failed to load image: ${imgElement.src}`);
  });
}

// Update the preloadImages function
function preloadImages() {
  const loadingPromises = [];
  
  // Preload card backs
  loadingPromises.push(new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = "img/tarot_back.png";
  }));
    
  // Preload all tarot cards
  for (let i = 0; i < 22; i++) {
    loadingPromises.push(new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = `img/${i}_tarot.png`;
    }));
  }
  
  // Handle all preloads
  Promise.allSettled(loadingPromises).then(results => {
    const failedLoads = results.filter(result => result.status === 'rejected');
    if (failedLoads.length > 0) {
      console.warn(`Failed to preload ${failedLoads.length} images`);
    }
  });
}