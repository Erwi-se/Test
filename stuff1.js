// ========== WINDOW REGISTRY ==========
const WindowRegistry = new Map()
  .set('tarotCard', {
    title: 'Tarot Card Settings',
    icon: 'img/tarotCard_icon.png',
    content: () => `
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
    `
  })
  .set('popUp', {
    title: 'Pop-up Settings',
    icon: 'img/popUp_icon.png',
    content: () => `
      <label>Switcher</label>
      <input type="range" min="0" max="1">
    `
  })
  .set('about', {
    title: 'About',
    icon: 'img/popUp_icon.png',
    content: () => `
      <label>Switcher</label>
      <input type="range" min="0" max="1">
    `
  }); 

// ========== STATE MANAGEMENT SYSTEM ==========
const state = {
  windows: [],
  nextZIndex: 1,
  settings: {
    cardAmount: 4,
    selectionMode: 'random'
  }
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

// ========== OPTIMIZED WINDOW MANAGER ==========
const WindowManager = {
  templates: {
    window: document.getElementById('window-template').content,
    taskbarItem: document.getElementById('taskbar-item-template').content
  },
  domCache: new Map(),

  openWindow(type) {
    const existingWindow = state.windows.find(win => win.type === type);
    if (existingWindow) return this.bringToFront(existingWindow.id);

    const newWindow = createWindowState(type);
    state.windows.push(newWindow);
    this.render();
    return newWindow;
  },

  closeWindow(id) {
    state.windows = state.windows.filter(window => window.id !== id);
    this.render();
  },

  minimizeWindow(id) {
    const window = state.windows.find(w => w.id === id);
    if (window) window.minimized = !window.minimized;
    this.render();
  },

  maximizeWindow(id) {
    const window = state.windows.find(w => w.id === id);
    if (!window) return;

    window.maximized = !window.maximized;
    if (window.maximized) {
      window.originalSize = { ...window.size };
      window.originalPosition = { ...window.position };
      window.size = {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
      };
      window.position = { x: 0, y: 0 };
    } else {
      window.size = window.originalSize || window.size;
      window.position = window.originalPosition || window.position;
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
    if (window && !window.maximized) window.position = { x, y };
  },

  createWindowElement(window) {
    const config = WindowRegistry.get(window.type);
    if (!config) return null;

    const clone = this.templates.window.cloneNode(true);
    const windowEl = clone.querySelector('.window');
    windowEl.dataset.windowId = window.id;

    const contentArea = windowEl.querySelector('.window__content');
    contentArea.innerHTML = config.content();

    windowEl.querySelector('.window__title').textContent = config.title;
    this.updateWindowElement(window, windowEl);
    this.setupWindowControls(window, windowEl);

    return windowEl;
  },

  setupWindowControls(window, element) {
  const controls = element.querySelector('.window__controls');
  
  // Handle control clicks
  const handleControlClick = (e) => {
    const control = e.target.closest('[class*="window__control--"]');
    if (!control) return;

    const action = control.className.split('--')[1];
    if (action) {
      e.stopPropagation();
      e.preventDefault();
      this[`${action}Window`](window.id);
    }
  };

  // Prevent control interactions from triggering drag
  controls.addEventListener('mousedown', (e) => {
    if (e.target.closest('[class*="window__control--"]')) {
      e.stopPropagation();
      e.preventDefault();
    }
  });

  controls.addEventListener('touchstart', (e) => {
    if (e.target.closest('[class*="window__control--"]')) {
      e.stopPropagation();
      e.preventDefault();
    }
  });

  // Click handler for desktop and mobile
  controls.addEventListener('click', handleControlClick);
  controls.addEventListener('touchend', handleControlClick);

  // Existing drag setup
  this.setupDraggableWindow(window, element);
}, 

  setupDraggableWindow(window, element) {
    const titleBar = element.querySelector('.window__title-bar');
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    const getViewportConstraints = () => ({
      maxX: document.documentElement.clientWidth - window.size.width,
      maxY: document.documentElement.clientHeight - window.size.height,
      minX: 0,
      minY: 0
    });

    const startDrag = (clientX, clientY) => {
  // Handle maximized window case
  if (window.maximized) {
    this.maximizeWindow(window.id); // Toggle off maximized state
    this.render(); // Force immediate DOM update

    // Calculate new position to center the title bar under the mouse
    const titleBarHeight = titleBar.offsetHeight;
    const originalWidth = window.size.width;
    const originalHeight = window.size.height;

    // New coordinates to center the window under the cursor
    const newX = clientX - originalWidth / 2;
    const newY = clientY - titleBarHeight / 2;

    // Apply viewport constraints
    const constraints = {
      maxX: document.documentElement.clientWidth - originalWidth,
      maxY: document.documentElement.clientHeight - originalHeight,
      minX: 0,
      minY: 0
    };

    window.position.x = Math.max(constraints.minX, Math.min(newX, constraints.maxX));
    window.position.y = Math.max(constraints.minY, Math.min(newY, constraints.maxY));

    // Update the element's transform and original position
    element.style.transform = `translate(${window.position.x}px, ${window.position.y}px)`;
    window.originalPosition = { ...window.position };
  }

  // Get actual position from element transform
  const transform = element.style.transform.match(/translate\(([^)]+)\)/);
  const [currentX, currentY] = transform 
    ? transform[1].split(',').map(parseFloat)
    : [window.position.x, window.position.y];

  offset = {
    x: clientX - currentX,
    y: clientY - currentY
  };
  
  isDragging = true;
  this.bringToFront(window.id);
};

    const drag = (clientX, clientY) => {
      if (!isDragging) return;

      // Calculate new position with boundary constraints
      const constraints = getViewportConstraints();
      let newX = clientX - offset.x;
      let newY = clientY - offset.y;

      // Apply boundary constraints
      newX = Math.max(constraints.minX, Math.min(newX, constraints.maxX));
      newY = Math.max(constraints.minY, Math.min(newY, constraints.maxY));

      // Update both state and DOM immediately
      window.position.x = newX;
      window.position.y = newY;
      element.style.transform = `translate(${newX}px, ${newY}px)`;
    };

    const endDrag = () => {
      isDragging = false;
      // Final position update to ensure state consistency
      this.updatePosition(window.id, window.position.x, window.position.y);
    };

    // Mouse events
    titleBar.addEventListener('mousedown', (e) => {
      startDrag(e.clientX, e.clientY);
      document.addEventListener('mousemove', (e) => drag(e.clientX, e.clientY));
      document.addEventListener('mouseup', endDrag);
    });

    // Touch events
    titleBar.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
      document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        drag(touch.clientX, touch.clientY);
      });
      document.addEventListener('touchend', endDrag);
    });
  },

  createTaskbarItem(window) {
    const config = WindowRegistry.get(window.type);
    if (!config) return null;

    const clone = this.templates.taskbarItem.cloneNode(true);
    const taskbarItem = clone.querySelector('.taskbar__item');
    taskbarItem.dataset.windowId = window.id;

    const img = taskbarItem.querySelector('img');
    img.src = config.icon;

    taskbarItem.querySelector('.taskbar__item-label').textContent = config.title;
    taskbarItem.addEventListener('click', () => this.toggleWindow(window.id));

    return taskbarItem;
  },

  toggleWindow(id) {
    const window = state.windows.find(w => w.id === id);
    if (window) {
      window.minimized ? this.minimizeWindow(id) : this.bringToFront(id);
    }
  },

  render() {
    const container = document.getElementById('desktop-area');
    const taskbarContainer = document.getElementById('open-apps');
    const existingIds = new Set(state.windows.map(w => w.id));

    // Cleanup removed windows
    this.domCache.forEach((el, id) => {
      if (!existingIds.has(id)) {
        el.windowEl?.remove();
        el.taskbarEl?.remove();
        this.domCache.delete(id);
      }
    });

    // Create/update windows
    state.windows.forEach(window => {
      let cached = this.domCache.get(window.id);
      
      if (!cached) {
        const windowEl = this.createWindowElement(window);
        const taskbarEl = this.createTaskbarItem(window);
        
        cached = { windowEl, taskbarEl };
        this.domCache.set(window.id, cached);
        
        container.appendChild(windowEl);
        taskbarContainer.appendChild(taskbarEl);
      }

      this.updateWindowElement(window, cached.windowEl);
      cached.windowEl.style.display = window.minimized ? 'none' : 'block';
    });
  },

  updateWindowElement(window, element) {
    if (!element) return;
    
    element.style.transform = `translate(${window.position.x}px, ${window.position.y}px)`;
    element.style.width = `${window.size.width}px`;
    element.style.height = `${window.size.height}px`;
    element.style.zIndex = window.zIndex;
  }
};

// ========== EVENT DELEGATION ==========
document.getElementById('desktop-area').addEventListener('click', (e) => {
  const target = e.target;
  if (target.closest('.window__control')) return;

  const windowEl = target.closest('.window');
  if (windowEl) {
    const id = parseInt(windowEl.dataset.windowId);
    WindowManager.bringToFront(id);
  }
});

document.querySelectorAll('[data-action]').forEach(shortcut => {
  shortcut.addEventListener('click', (e) => {
    WindowManager.openWindow(e.currentTarget.dataset.action);
  });
});