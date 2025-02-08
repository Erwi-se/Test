function generateCard() {
  const slider = document.getElementById("slider");
  const cardCount = 5;

  const numbers = [...Array(22).keys()];
  
  for (let i = 0; i < cardCount; i++) {
    const randomIndex = i + Math.floor(Math.random() * (22 - i));
    [numbers[i], numbers[randomIndex]] = [numbers[randomIndex], numbers[i]];
  }
  return numbers.splice(0,cardCount);
}

function selectCard() {
  
  return 20;
}

// Always return arrays for uniform handling
function addCard() {
  const isRandomMode = document.getElementById('selection-mode-random').checked;
  const cards = isRandomMode ? generateCard() : [selectCard()];
  cards.forEach(card => {
    WindowManager.openWindow();
  });
}

function removeCard() {
}

// Use array for direct indexing and maintainability
const tarotDescriptions = [
  "The Fool", "The Magician", "The High Priestess", "The Empress",
  "The Emperor", "The Hierophant", "The Lovers", "The Chariot",
  "Strength", "The Hermit", "Wheel of Fortune", "Justice",
  "The Hanged Man", "Death", "Temperance", "The Devil",
  "The Tower", "The Star", "The Moon", "The Sun", 
  "Judgement", "The World"
];

const id = 0;

const categories = {
  tarotCard: {
    title: `${id}_tarot.png`,
    description: tarotDescriptions[id],
    image: `img/${id}_tarot.png`
  },
  popUp: {
    image: `img/${id}_popUp.png`
  }
};

// stuff1.js - Updated with state management
function openFullScreen() {
  document.documentElement.requestFullscreen();
};

function toggleStartMenu() {
  const x = document.getElementById("start-menu");
  x.style.display = x.style.display === "none" ? "block" : "none";
};

// ========== STATE MANAGEMENT SYSTEM ==========
const state = {
  windows: [],
  nextZIndex: 1,
  settings: {
    cardAmount: 4,
    selectionMode: 'random'
  },
  taskbarItems: new Map()
};

const createWindowState = (type) => ({
  id: Date.now(),
  type,
  position: { x: 10, y: 10 },
  size: { width: 400, height: 300 },
  minimized: false,
  maximized: false,
  zIndex: state.nextZIndex++,
});

const WindowManager = {
  // Add cache for window templates and DOM elements
  templateCache: null,
  domCache: new Map(),
  
  // Initialize template cache once
  initTemplates() {
    if (!this.templateCache) {
      this.templateCache = {
        window: document.getElementById('window-template').content,
        taskbarItem: document.getElementById('taskbar-item-template').content
      };
    }
  },
  
  openWindow(type) {
    // Check if a window of this type is already open.
    const existingWindow = state.windows.find(win => win.type === type);
    if (existingWindow) {
      // If found, bring it to the front and return the existing instance.
      this.bringToFront(existingWindow.id);
      return existingWindow;
    }
  
    // Otherwise, create a new window.
    const newWindow = createWindowState(type);
    state.windows.push(newWindow);
    this.render();
    return newWindow;
  }, 

  closeWindow(id) {
    state.windows = state.windows.filter(window => window.id !== id);
    state.taskbarItems.delete(id);
    this.render();
  },

  minimizeWindow(id) {
    const window = state.windows.find(w => w.id === id);
    if (window) window.minimized = !window.minimized;
    this.render();
  },

  maximizeWindow(id) {
    const window = state.windows.find(w => w.id === id);
    if (window) {
      window.maximized = !window.maximized;

      if (window.maximized) {
        // Store original state before maximizing
        window.originalSize = { ...window.size };
        window.originalPosition = { ...window.position };
      
        // Set new dimensions and position
        window.size = {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight
        };
        window.position = { x: 0, y: 0 }; // Top-left corner
      } else {
        // Restore original state
        if (window.originalSize) {
          window.size = { ...window.originalSize };
        }
        if (window.originalPosition) {
          window.position = { ...window.originalPosition };
        }
      }
    }
    this.render();
  },

  bringToFront(id) {
    const window = state.windows.find(w => w.id === id);
    if (window) {
      window.zIndex = state.nextZIndex++;
      window.minimized = false;
    }
    this.render();
  },

  updatePosition(id, x, y) {
    const window = state.windows.find(w => w.id === id);
    if (window && !window.maximized) {
      window.position = { x, y };
    }
  },

  updateSize(id, width, height) {
    const window = state.windows.find(w => w.id === id);
    if (window && !window.maximized) {
      window.size = { width, height };
    }
  },

  
  // Modified createWindowElement with caching
  createWindowElement(window) {
    this.initTemplates();
    
    // Clone from cached template
    const clone = this.templateCache.window.cloneNode(true);
    const windowEl = clone.querySelector('.window');
    windowEl.dataset.windowId = window.id;
    const contentArea = windowEl.querySelector('.window__content'); // Add this line

    // Add content based on window type
    switch(window.type) {
      case 'tarotCard':
        contentArea.innerHTML = `
          <h2 class="setting-panel__heading">Settings</h2>
          <div class="setting-group">
            <label class="setting-group__label">Card Amount:<span>4</span></label><br>
            <input type="range" min="1" max="6" value="4" 
            class="setting__slider" id="card-amount-slider">
          </div>
          <div class="setting-group">
            <p class="setting-group__label">Selection Mode:</p>
            <div class="radio-option">
              <input type="radio" name="selection-mode" 
              id="selection-mode-manual" class="radio__input">
              <label for="selection-mode-manual" class="radio__label">Manual</label>
            </div>
            <div class="radio-option">
              <input type="radio" name="selection-mode" 
              id="selection-mode-random" class="radio__input" checked>
              <label for="selection-mode-random" class="radio__label">Random</label>
            </div>
          </div>
          <button onclick="addCard()">Get card</button>
        `;
      break;

      case 'popUp':
        contentArea.innerHTML = `
          <label>Switcher</label>
          <input type="range" min="0" max="1">
        `;
      break;      

      default:
        contentArea.textContent = `${window.type} content`;
    }
  
    // Initial setup
    this.updateWindowElement(window, windowEl);
    
    // Add controls
    this.addWindowControls(window, windowEl);
    
    return windowEl;
  },
  
  // In updateWindowElement method
  updateWindowElement(window, element) {
    element.style.left = `${window.position.x}px`;
    element.style.top = `${window.position.y}px`;
    element.style.width = `${window.size.width}px`;
    element.style.height = `${window.size.height}px`;
    element.style.zIndex = window.zIndex;
    element.style.display = window.minimized ? 'none' : 'block';
  },
  
  addWindowControls(window, element) {
    const controls = {
      minimize: element.querySelector('.window__control--minimize'),
      maximize: element.querySelector('.window__control--maximize'),
      close: element.querySelector('.window__control--close'),
      titleBar: element.querySelector('.window__title-bar')
    };

    // Event listeners for controls
    controls.minimize.onclick = () => this.minimizeWindow(window.id);
    controls.maximize.onclick = () => this.maximizeWindow(window.id);
    controls.close.onclick = () => this.closeWindow(window.id);
    
    // Drag state variables
    let isDragging = false;
    let offset = { x: 0, y: 0 };
    let mousemoveHandler, touchmoveHandler, endDragHandler;

    const startDrag = (clientX, clientY) => {
      isDragging = true;
      offset = {
        x: clientX - window.position.x,
        y: clientY - window.position.y
      };

      // Define handlers
      mousemoveHandler = (e) => {
        if (!isDragging || window.maximized) return;
        this.updatePosition(window.id, e.clientX - offset.x, e.clientY - offset.y);
        this.updateWindowElement(window, element);
      };

      touchmoveHandler = (e) => {
        if (!isDragging || window.maximized) return;
        const touch = e.touches[0];
        this.updatePosition(window.id, touch.clientX - offset.x, touch.clientY - offset.y);
        this.updateWindowElement(window, element);
      };

      endDragHandler = () => {
        isDragging = false;
        document.removeEventListener('mousemove', mousemoveHandler);
        document.removeEventListener('touchmove', touchmoveHandler);
        document.removeEventListener('mouseup', endDragHandler);
        document.removeEventListener('touchend', endDragHandler);
      };

      // Add event listeners
      document.addEventListener('mousemove', mousemoveHandler);
      document.addEventListener('touchmove', touchmoveHandler);
      document.addEventListener('mouseup', endDragHandler);
      document.addEventListener('touchend', endDragHandler);
    };

    // Mouse events
    controls.titleBar.onmousedown = (e) => {
      if (e.target.closest('.window__control')) return;
      startDrag(e.clientX, e.clientY);
      this.bringToFront(window.id);
    };

    // Touch events
    controls.titleBar.addEventListener('touchstart', (e) => {
      if (e.target.closest('.window__control')) return;
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
      this.bringToFront(window.id); 
      e.preventDefault();
    });
  },
  
  // Optimized render method
  render() {
    this.initTemplates();
    const container = document.getElementById('desktop-area');
    const taskbarContainer = document.getElementById('open-apps');
    const existingIds = new Set(state.windows.map(w => w.id));

    // Cleanup removed windows
    this.domCache.forEach((el, id) => {
      if (!existingIds.has(id)) {
        el.windowEl.remove();
        el.taskbarEl?.remove();
        this.domCache.delete(id);
      }
    });

    // Create/update windows
    state.windows.forEach(window => {
      let cached = this.domCache.get(window.id);
      
      if (!cached) {
        // Create new window
        const windowEl = this.createWindowElement(window);
        const taskbarEl = this.createTaskbarItem(window);
        
        cached = { windowEl, taskbarEl };
        this.domCache.set(window.id, cached);
        
        container.appendChild(windowEl);
        taskbarContainer.appendChild(taskbarEl);
      } else {
        // Update existing elements
        this.updateWindowElement(window, cached.windowEl);
        this.updateTaskbarItem(window, cached.taskbarEl);
      }
      
      // Sync visibility
      cached.windowEl.style.display = window.minimized ? 'none' : 'block';
    });
  },

  // Taskbar item management
  createTaskbarItem(window) {
    const clone = this.templateCache.taskbarItem.cloneNode(true);
    const taskbarItem = clone.querySelector('.taskbar__item');
    this.updateTaskbarItem(window, taskbarItem);
    
    taskbarItem.onclick = () => {
      if (window.minimized) this.minimizeWindow(window.id);
      this.bringToFront(window.id);
    };
    
    return taskbarItem;
  },
  
  updateTaskbarItem(window, element) {
    element.dataset.windowId = window.id;
  
    const imgEl = element.querySelector('.taskbar__item-icon');
    const newSrc = `img/${window.type}_icon.png`;
    if (imgEl.getAttribute('src') !== newSrc) {
      imgEl.src = newSrc; // Only update if it's different
    }

    const labelEl = element.querySelector('.taskbar__item-label');
    const newLabel = window.type.charAt(0).toUpperCase() + window.type.slice(1);
    if (labelEl.textContent !== newLabel) {
      labelEl.textContent = newLabel;
    }
  }
  
};

// ========== EVENT LISTENERS ==========
document.querySelectorAll('[data-action]').forEach(shortcut => {
  shortcut.addEventListener('click', (e) => {
    const action = e.currentTarget.dataset.action;
    WindowManager.openWindow(action);
  });
});

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
  const el = document.getElementById('clock-display');
  let prev = '';
      
  const update = () => {
    const date = new Date();
    const time = date.toTimeString().substring(0, 5);
    el.textContent = time;
        
    const msToNextMinute = 60000 - (date.getSeconds() * 1000 + date.getMilliseconds());
    setTimeout(update, msToNextMinute);
  };
      
  update();
});
