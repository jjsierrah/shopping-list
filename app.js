// DOM Elements
const productForm = document.getElementById('add-product-form');
const shoppingListEl = document.getElementById('shopping-list');
const clearBtn = document.getElementById('clear-list');
const loadFavoritesBtn = document.getElementById('load-favorites');
const copyListBtn = document.getElementById('copy-list');
const categoryForm = document.getElementById('add-category-form');
const locationForm = document.getElementById('add-location-form');
const categoriesListEl = document.getElementById('categories-list');
const locationsListEl = document.getElementById('locations-list');
const favoritesListEl = document.getElementById('favorites-list');
const defaultsListEl = document.getElementById('defaults-list');
const categorySelect = document.getElementById('product-category-select');
const locationSelect = document.getElementById('product-location-select');
const openConfigBtn = document.getElementById('open-config-btn');
const openFavoritesBtn = document.getElementById('open-favorites-btn');
const openDefaultsBtn = document.getElementById('open-defaults-btn');
const closeConfigBtn = document.getElementById('close-config-btn');
const closeFavoritesBtn = document.getElementById('close-favorites-btn');
const closeDefaultsBtn = document.getElementById('close-defaults-btn');
const closeConfigModalBtn = document.getElementById('close-config-modal-btn');
const closeFavoritesModalBtn = document.getElementById('close-favorites-modal-btn');
const closeDefaultsModalBtn = document.getElementById('close-defaults-modal-btn');
const configModal = document.getElementById('config-modal');
const favoritesModal = document.getElementById('favorites-modal');
const defaultsModal = document.getElementById('defaults-modal');
const importFileInput = document.getElementById('import-file-input');

// Load data - TRES LISTAS SEPARADAS
let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];
let favoriteProducts = JSON.parse(localStorage.getItem('favoriteProducts')) || [];
let defaultProducts = JSON.parse(localStorage.getItem('defaultProducts')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [
  { id: Date.now(), name: 'Pescadería' },
  { id: Date.now() + 1, name: 'Frutería' },
  { id: Date.now() + 2, name: 'Carnicería' }
];
let locations = JSON.parse(localStorage.getItem('locations')) || [
  { id: Date.now() + 3, name: 'Supermercado' },
  { id: Date.now() + 4, name: 'Mercado' },
  { id: Date.now() + 5, name: 'Tienda especializada' }
];

// Undo stack por contexto
let undoStack = {
  shoppingList: null,
  favorites: null,
  defaults: null,
  categories: null,
  locations: null
};

// SVGs reutilizables
const TRASH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;
const SAVE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17,3H5C3.89,3 3,3.89 3,5V19C3,20.11 3.89,21 5,21H19C20.11,21 21,20.11 21,19V7L17,3M12,19C10.34,19 9,17.66 9,16C9,14.34 10.34,13 12,13C13.66,13 15,14.34 15,16C15,17.66 13.66,19 12,19M18,12H6V6H17V12Z"/></svg>`;

// >>> PALETA DE COLORES PARA CATEGORÍAS <<<
const CATEGORY_COLORS = [
  '#009688', // Teal
  '#673AB7', // Violeta oscuro
  '#FF0080', // Rosa
  '#FF9800', // Naranja
  '#795548', // Marrón
  '#2196F3', // Azul
  '#FF5722', // Naranja oscuro
  '#03A9F4', // Azul claro
  '#F44336', // Rojo
  '#4CAF50', // Verde
  '#FFC107', // Ámbar
  '#00BCD4', // Cian
  '#607D8B', // Azul grisáceo
  '#9C27B0', // Púrpura
  '#CDDC39', // Lima
  '#9E9E9E', // Gris
  '#FF4081', // Rosa brillante
];

// Función para generar ID único
function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000000);
}

// >>> FUNCION DE ORDENAMIENTO <<<
function sortProductsBy(products, type) {
  const indexMap = (type === 'category' ? categories : locations)
    .reduce((map, item, index) => {
      map[item.id] = index;
      return map;
    }, {});

  return [...products].sort((a, b) => {
    const idA = type === 'category' ? a.categoryId : a.locationId;
    const idB = type === 'category' ? b.categoryId : b.locationId;
    const indexA = idA !== null && idA !== undefined ? indexMap[idA] : Infinity;
    const indexB = idB !== null && idB !== undefined ? indexMap[idB] : Infinity;
    return indexA - indexB;
  });
}

// Función de alerta personalizada mejorada
function showAlert(message, isConfirm = false, onConfirm = null, type = 'info') {
  const colors = {
    info: '#2e7d32',
    warning: '#f57c00',
    error: '#d32f2f'
  };
  const titleText = type === 'error' ? 'Atención:' : 'Información:';
  const titleColor = colors[type] || '#2e7d32';

  const alertDiv = document.createElement('div');
  alertDiv.className = 'custom-alert';
  
  if (isConfirm) {
    alertDiv.innerHTML = `
      <div class="alert-content">
        <h3 class="alert-title" style="color: ${titleColor};">${titleText}</h3>
        <p>${message}</p>
        <div class="alert-buttons">
          <button class="alert-cancel">Cancelar</button>
          <button class="alert-confirm">Aceptar</button>
        </div>
      </div>
    `;
    
    const cancelBtn = alertDiv.querySelector('.alert-cancel');
    const confirmBtn = alertDiv.querySelector('.alert-confirm');
    
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(alertDiv);
    });
    
    confirmBtn.addEventListener('click', () => {
      document.body.removeChild(alertDiv);
      if (onConfirm) onConfirm();
    });
  } else {
    alertDiv.innerHTML = `
      <div class="alert-content">
        <h3 class="alert-title" style="color: ${titleColor};">${titleText}</h3>
        <p>${message}</p>
        <button class="alert-ok">OK</button>
      </div>
    `;
    
    const okBtn = alertDiv.querySelector('.alert-ok');
    okBtn.addEventListener('click', () => {
      document.body.removeChild(alertDiv);
    });
  }
  
  if (!isConfirm) {
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(alertDiv);
        document.removeEventListener('keydown', closeOnEscape);
      }
    };
    document.addEventListener('keydown', closeOnEscape);
  }
  
  document.body.appendChild(alertDiv);
}

function saveData() {
  localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
  localStorage.setItem('favoriteProducts', JSON.stringify(favoriteProducts));
  localStorage.setItem('defaultProducts', JSON.stringify(defaultProducts));
  localStorage.setItem('categories', JSON.stringify(categories));
  localStorage.setItem('locations', JSON.stringify(locations));
}

function renderCategories() {
  categoriesListEl.innerHTML = '';
  categorySelect.innerHTML = '<option value="">-- Categoría --</option>';
  
  categories.forEach(cat => {
    const div = document.createElement('div');
    div.className = 'category-item';
    div.dataset.id = cat.id;
    div.draggable = true;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = cat.name;
    input.dataset.id = cat.id;
    
    const actions = document.createElement('div');
    actions.className = 'category-actions';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-category';
    saveBtn.innerHTML = SAVE_SVG;
    saveBtn.dataset.id = cat.id;
    saveBtn.onclick = () => {
      const newName = input.value.trim();
      if (newName) {
        cat.name = newName;
        renderCategories();
        renderShoppingList();
        renderFavoritesList();
        renderDefaultsList();
        saveData();
      }
    };
    actions.appendChild(saveBtn);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-category';
    deleteBtn.innerHTML = TRASH_SVG;
    deleteBtn.dataset.id = cat.id;
    deleteBtn.onclick = () => {
      undoStack.categories = JSON.parse(JSON.stringify(categories));
      categories = categories.filter(c => c.id !== cat.id);
      renderCategories();
      renderShoppingList();
      renderFavoritesList();
      renderDefaultsList();
      showModalUndoButton(configModal, 'categories');
    };
    actions.appendChild(deleteBtn);
    
    div.appendChild(input);
    div.appendChild(actions);
    categoriesListEl.appendChild(div);

    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });

  initDragAndDrop(categoriesListEl, '.category-item', categories, renderCategories);
}

function renderLocations() {
  locationsListEl.innerHTML = '';
  locationSelect.innerHTML = '<option value="">-- Ubicación --</option>';
  
  locations.forEach(loc => {
    const div = document.createElement('div');
    div.className = 'location-item';
    div.dataset.id = loc.id;
    div.draggable = true;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = loc.name;
    input.dataset.id = loc.id;
    
    const actions = document.createElement('div');
    actions.className = 'location-actions';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-location';
    saveBtn.innerHTML = SAVE_SVG;
    saveBtn.dataset.id = loc.id;
    saveBtn.onclick = () => {
      const newName = input.value.trim();
      if (newName) {
        loc.name = newName;
        renderLocations();
        renderShoppingList();
        renderFavoritesList();
        renderDefaultsList();
        saveData();
      }
    };
    actions.appendChild(saveBtn);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-location';
    deleteBtn.innerHTML = TRASH_SVG;
    deleteBtn.dataset.id = loc.id;
    deleteBtn.onclick = () => {
      undoStack.locations = JSON.parse(JSON.stringify(locations));
      locations = locations.filter(l => l.id !== loc.id);
      renderLocations();
      renderShoppingList();
      renderFavoritesList();
      renderDefaultsList();
      showModalUndoButton(configModal, 'locations');
    };
    actions.appendChild(deleteBtn);
    
    div.appendChild(input);
    div.appendChild(actions);
    locationsListEl.appendChild(div);

    const option = document.createElement('option');
    option.value = loc.id;
    option.textContent = loc.name;
    locationSelect.appendChild(option);
  });

  initDragAndDrop(locationsListEl, '.location-item', locations, renderLocations);
}

function renderProductItem(item) {
  const category = categories.find(c => c.id === item.categoryId);
  const categoryName = category ? category.name : '';
  const locationName = item.locationId ? locations.find(l => l.id === item.locationId)?.name : '';
  
  const isFavorite = favoriteProducts.some(p => 
    p.name === item.name && p.categoryId === item.categoryId && p.locationId === item.locationId
  );
  const isDefault = defaultProducts.some(p => 
    p.name === item.name && p.categoryId === item.categoryId && p.locationId === item.locationId
  );
  
  const li = document.createElement('li');
  li.dataset.id = item.id;
  li.draggable = true;

  // >>> COLOR POR POSICIÓN EN LA LISTA DE CATEGORÍAS <<<
  if (category) {
    const index = categories.findIndex(c => c.id === category.id);
    const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
    li.style.borderLeft = `4px solid ${color}`;
  } else {
    li.style.borderLeft = '4px solid transparent';
  }

  const productInfo = document.createElement('div');
  productInfo.className = 'product-info';
  
  const title = document.createElement('h3');
  title.textContent = item.name + (isFavorite ? ' ⭐' : '') + (isDefault ? ' 📌' : '');
  productInfo.appendChild(title);
  
  if (categoryName) {
    const categoryEl = document.createElement('div');
    categoryEl.className = 'category';
    categoryEl.textContent = categoryName;
    productInfo.appendChild(categoryEl);
  }
  
  if (locationName) {
    const locationEl = document.createElement('div');
    locationEl.className = 'location';
    locationEl.textContent = locationName;
    productInfo.appendChild(locationEl);
  }
  
  const actions = document.createElement('div');
  actions.className = 'actions';
  
  const boughtCheckbox = document.createElement('input');
  boughtCheckbox.type = 'checkbox';
  boughtCheckbox.className = 'bought';
  boughtCheckbox.checked = item.bought;
  boughtCheckbox.dataset.id = item.id;
  actions.appendChild(boughtCheckbox);
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = TRASH_SVG;
  deleteBtn.onclick = () => {
    undoStack.shoppingList = JSON.parse(JSON.stringify(shoppingList));
    shoppingList = shoppingList.filter(p => p.id !== item.id);
    renderShoppingList();
    showUndoButton();
  };
  actions.appendChild(deleteBtn);
  
  li.appendChild(productInfo);
  li.appendChild(actions);
  return li;
}

function renderShoppingList() {
  // Guardar el estado actual de "bought" desde el DOM antes de destruirlo
  const currentStates = {};
  document.querySelectorAll('#shopping-list li input[type="checkbox"].bought').forEach(checkbox => {
    const id = Number(checkbox.dataset.id);
    if (!isNaN(id)) {
      currentStates[id] = checkbox.checked;
    }
  });

  // Sincronizar el estado con el modelo de datos
  shoppingList.forEach(item => {
    if (currentStates.hasOwnProperty(item.id)) {
      item.bought = currentStates[item.id];
    }
  });

  // Renderizar
  shoppingListEl.innerHTML = '';
  shoppingList.forEach(item => {
    const li = renderProductItem(item);
    shoppingListEl.appendChild(li);
  });
  saveData();
  initDragAndDrop(shoppingListEl, 'li', shoppingList, renderShoppingList);
                    }
function renderFavoritesList() {
  favoritesListEl.innerHTML = '';
  
  favoriteProducts.forEach(item => {
    const category = categories.find(c => c.id === item.categoryId);
    const categoryName = category ? category.name : '';
    const locationName = item.locationId ? locations.find(l => l.id === item.locationId)?.name : '';
    
    const div = document.createElement('div');
    div.className = 'favorite-item';
    div.dataset.id = item.id;
    div.draggable = true;

    // >>> BORDE POR CATEGORÍA <<<
    if (category) {
      const index = categories.findIndex(c => c.id === category.id);
      const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
      div.style.borderLeft = `4px solid ${color}`;
    } else {
      div.style.borderLeft = '4px solid transparent';
    }
    
    // Product edit
    const productEdit = document.createElement('div');
    productEdit.className = 'product-edit';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = item.name;
    nameInput.className = 'product-name';
    nameInput.dataset.id = item.id;
    productEdit.appendChild(nameInput);
    
    const row = document.createElement('div');
    row.className = 'category-location-row';
    
    const catSelect = document.createElement('select');
    catSelect.className = 'product-category';
    catSelect.dataset.id = item.id;
    const catDefaultOpt = document.createElement('option');
    catDefaultOpt.value = '';
    catDefaultOpt.textContent = '-- Categoría --';
    catSelect.appendChild(catDefaultOpt);
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      if (cat.id === item.categoryId) opt.selected = true;
      catSelect.appendChild(opt);
    });
    row.appendChild(catSelect);
    
    const locSelect = document.createElement('select');
    locSelect.className = 'product-location';
    locSelect.dataset.id = item.id;
    const locDefaultOpt = document.createElement('option');
    locDefaultOpt.value = '';
    locDefaultOpt.textContent = '-- Ubicación --';
    locSelect.appendChild(locDefaultOpt);
    locations.forEach(loc => {
      const opt = document.createElement('option');
      opt.value = loc.id;
      opt.textContent = loc.name;
      if (loc.id === item.locationId) opt.selected = true;
      locSelect.appendChild(opt);
    });
    row.appendChild(locSelect);
    
    productEdit.appendChild(row);
    div.appendChild(productEdit);
    
    // Actions
    const actions = document.createElement('div');
    actions.className = 'favorite-actions';
    
    const addBtn = document.createElement('button');
    addBtn.className = 'add-to-list';
    addBtn.textContent = '➕ Añadir';
    addBtn.dataset.id = item.id;
    addBtn.dataset.type = 'favorite';
    addBtn.onclick = () => {
      if (shoppingList.some(p => p.name === item.name)) {
        showAlert('Este producto ya está en la lista.', false, null, 'warning');
        return;
      }
      shoppingList.push({ ...item, id: generateId(), bought: false });
      renderShoppingList();
      showAlert('Producto añadido a la lista!', false, null, 'info');
    };
    actions.appendChild(addBtn);
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-favorite';
    saveBtn.innerHTML = SAVE_SVG;
    saveBtn.dataset.id = item.id;
    saveBtn.onclick = () => {
      const newName = nameInput.value.trim();
      if (newName) {
        item.name = newName;
        renderFavoritesList();
        renderShoppingList();
        saveData();
      }
    };
    actions.appendChild(saveBtn);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-favorite';
    deleteBtn.innerHTML = TRASH_SVG;
    deleteBtn.dataset.id = item.id;
    const itemId = item.id;
    deleteBtn.onclick = () => {
      undoStack.favorites = JSON.parse(JSON.stringify(favoriteProducts));
      favoriteProducts = favoriteProducts.filter(p => p.id !== itemId);
      renderFavoritesList();
      renderShoppingList();
      showModalUndoButton(favoritesModal, 'favorites');
    };
    actions.appendChild(deleteBtn);
    
    div.appendChild(actions);
    favoritesListEl.appendChild(div);
  });
  initDragAndDrop(favoritesListEl, '.favorite-item', favoriteProducts, renderFavoritesList);
}

function renderDefaultsList() {
  defaultsListEl.innerHTML = '';
  
  defaultProducts.forEach(item => {
    const category = categories.find(c => c.id === item.categoryId);
    const categoryName = category ? category.name : '';
    const locationName = item.locationId ? locations.find(l => l.id === item.locationId)?.name : '';
    
    const div = document.createElement('div');
    div.className = 'default-item';
    div.dataset.id = item.id;
    div.draggable = true;

    // >>> BORDE POR CATEGORÍA <<<
    if (category) {
      const index = categories.findIndex(c => c.id === category.id);
      const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
      div.style.borderLeft = `4px solid ${color}`;
    } else {
      div.style.borderLeft = '4px solid transparent';
    }
    
    // Product edit
    const productEdit = document.createElement('div');
    productEdit.className = 'product-edit';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = item.name;
    nameInput.className = 'product-name';
    nameInput.dataset.id = item.id;
    productEdit.appendChild(nameInput);
    
    const row = document.createElement('div');
    row.className = 'category-location-row';
    
    const catSelect = document.createElement('select');
    catSelect.className = 'product-category';
    catSelect.dataset.id = item.id;
    const catDefaultOpt = document.createElement('option');
    catDefaultOpt.value = '';
    catDefaultOpt.textContent = '-- Categoría --';
    catSelect.appendChild(catDefaultOpt);
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      if (cat.id === item.categoryId) opt.selected = true;
      catSelect.appendChild(opt);
    });
    row.appendChild(catSelect);
    
    const locSelect = document.createElement('select');
    locSelect.className = 'product-location';
    locSelect.dataset.id = item.id;
    const locDefaultOpt = document.createElement('option');
    locDefaultOpt.value = '';
    locDefaultOpt.textContent = '-- Ubicación --';
    locSelect.appendChild(locDefaultOpt);
    locations.forEach(loc => {
      const opt = document.createElement('option');
      opt.value = loc.id;
      opt.textContent = loc.name;
      if (loc.id === item.locationId) opt.selected = true;
      locSelect.appendChild(opt);
    });
    row.appendChild(locSelect);
    
    productEdit.appendChild(row);
    div.appendChild(productEdit);
    
    // Actions
    const actions = document.createElement('div');
    actions.className = 'default-actions';
    
    const addBtn = document.createElement('button');
    addBtn.className = 'add-to-list';
    addBtn.textContent = '➕ Añadir';
    addBtn.dataset.id = item.id;
    addBtn.dataset.type = 'default';
    addBtn.onclick = () => {
      if (shoppingList.some(p => p.name === item.name)) {
        showAlert('Este producto ya está en la lista.', false, null, 'warning');
        return;
      }
      shoppingList.push({ ...item, id: generateId(), bought: false });
      renderShoppingList();
      showAlert('Producto añadido a la lista!', false, null, 'info');
    };
    actions.appendChild(addBtn);
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-default';
    saveBtn.innerHTML = SAVE_SVG;
    saveBtn.dataset.id = item.id;
    saveBtn.onclick = () => {
      const newName = nameInput.value.trim();
      if (newName) {
        item.name = newName;
        renderDefaultsList();
        renderShoppingList();
        saveData();
      }
    };
    actions.appendChild(saveBtn);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-default';
    deleteBtn.innerHTML = TRASH_SVG;
    deleteBtn.dataset.id = item.id;
    const itemId = item.id; // Capturar ID como valor primitivo
    deleteBtn.onclick = () => {
      undoStack.defaults = JSON.parse(JSON.stringify(defaultProducts));
      defaultProducts = defaultProducts.filter(p => p.id !== itemId);
      renderDefaultsList();
      renderShoppingList();
      showModalUndoButton(defaultsModal, 'defaults');
    };
    actions.appendChild(deleteBtn);
    
    div.appendChild(actions);
    defaultsListEl.appendChild(div);
  });
  initDragAndDrop(defaultsListEl, '.default-item', defaultProducts, renderDefaultsList);
}

// Drag & Drop robusto (sin clonación)
function initDragAndDrop(container, itemSelector, dataArray, renderFn) {
  let dragSrcEl = null;

  function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    this.classList.add('dragging');
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
  }

  function handleDragLeave() {
    this.classList.remove('drag-over');
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (dragSrcEl !== this) {
      const srcIndex = Array.from(container.children).indexOf(dragSrcEl);
      const targetIndex = Array.from(container.children).indexOf(this);

      if (srcIndex !== -1 && targetIndex !== -1) {
        const [movedItem] = dataArray.splice(srcIndex, 1);
        dataArray.splice(targetIndex, 0, movedItem);
        renderFn();
      }
    }
    
    this.classList.remove('drag-over');
  }

  function handleDragEnd() {
    this.classList.remove('dragging');
    container.querySelectorAll(itemSelector).forEach(item => {
      item.classList.remove('drag-over');
    });
  }

  const items = container.querySelectorAll(itemSelector);
  items.forEach(item => {
    item.removeEventListener('dragstart', handleDragStart);
    item.removeEventListener('dragover', handleDragOver);
    item.removeEventListener('dragenter', handleDragEnter);
    item.removeEventListener('dragleave', handleDragLeave);
    item.removeEventListener('drop', handleDrop);
    item.removeEventListener('dragend', handleDragEnd);

    item.addEventListener('dragstart', handleDragStart, false);
    item.addEventListener('dragover', handleDragOver, false);
    item.addEventListener('dragenter', handleDragEnter, false);
    item.addEventListener('dragleave', handleDragLeave, false);
    item.addEventListener('drop', handleDrop, false);
    item.addEventListener('dragend', handleDragEnd, false);
  });
}

// Modal controls
function openModal(modal, renderFn) {
  modal.style.display = 'block';
  renderFn();
}

function closeModal(modal) {
  modal.style.display = 'none';
}

// Cerrar modales
const modalCloseTriggers = [
  {btn: 'close-add-product-modal-btn', modal: 'add-product-modal'},
  {btn: 'close-config-btn', modal: 'config-modal'},
  {btn: 'close-favorites-btn', modal: 'favorites-modal'},
  {btn: 'close-defaults-btn', modal: 'defaults-modal'},
  {btn: 'close-config-modal-btn', modal: 'config-modal'},
  {btn: 'close-favorites-modal-btn', modal: 'favorites-modal'},
  {btn: 'close-defaults-modal-btn', modal: 'defaults-modal'},
  {btn: 'close-help-btn', modal: 'help-modal'},
  {btn: 'close-help-modal-btn', modal: 'help-modal'}
];

modalCloseTriggers.forEach(({btn, modal}) => {
  const button = document.getElementById(btn);
  const modalEl = document.getElementById(modal);
  if (button) button.addEventListener('click', () => closeModal(modalEl));
});

// Cerrar al hacer clic fuera
['add-product-modal', 'config-modal', 'favorites-modal', 'defaults-modal', 'help-modal'].forEach(id => {
  const modal = document.getElementById(id);
  if (modal) {
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }
});

if (openFavoritesBtn) openFavoritesBtn.addEventListener('click', () => openModal(favoritesModal, renderFavoritesList));
if (openDefaultsBtn) openDefaultsBtn.addEventListener('click', () => openModal(defaultsModal, renderDefaultsList));
if (openConfigBtn) openConfigBtn.addEventListener('click', () => openModal(configModal, () => { renderCategories(); renderLocations(); }));

// >>> LISTENERS DE ORDENAMIENTO <<<
document.getElementById('sort-favorites-by-category')?.addEventListener('click', () => {
  favoriteProducts = sortProductsBy(favoriteProducts, 'category');
  renderFavoritesList();
  showAlert('Favoritos ordenados por categoría.', false, null, 'info');
});

document.getElementById('sort-favorites-by-location')?.addEventListener('click', () => {
  favoriteProducts = sortProductsBy(favoriteProducts, 'location');
  renderFavoritesList();
  showAlert('Favoritos ordenados por ubicación.', false, null, 'info');
});

document.getElementById('sort-defaults-by-category')?.addEventListener('click', () => {
  defaultProducts = sortProductsBy(defaultProducts, 'category');
  renderDefaultsList();
  showAlert('Predeterminados ordenados por categoría.', false, null, 'info');
});

document.getElementById('sort-defaults-by-location')?.addEventListener('click', () => {
  defaultProducts = sortProductsBy(defaultProducts, 'location');
  renderDefaultsList();
  showAlert('Predeterminados ordenados por ubicación.', false, null, 'info');
});

// Añadir categoría
if (categoryForm) categoryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('new-category');
  const name = input.value.trim();
  if (!name) return;
  if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    showAlert('La categoría ya existe.', false, null, 'warning');
    return;
  }
  categories.push({ id: generateId(), name });
  renderCategories();
  saveData();
  input.value = '';
});

// Añadir ubicación
if (locationForm) locationForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('new-location');
  const name = input.value.trim();
  if (!name) return;
  if (locations.some(l => l.name.toLowerCase() === name.toLowerCase())) {
    showAlert('La ubicación ya existe.', false, null, 'warning');
    return;
  }
  locations.push({ id: generateId(), name });
  renderLocations();
  saveData();
  input.value = '';
});

// Botón de deshacer global
(function() {
  if (!document.getElementById('undo-btn')) {
    const undoBtn = document.createElement('button');
    undoBtn.id = 'undo-btn';
    undoBtn.className = 'undo-btn';
    undoBtn.textContent = '↺ Deshacer';
    undoBtn.style.display = 'none';
    document.body.appendChild(undoBtn);
  }
})();

function showUndoButton() {
  const undoBtn = document.getElementById('undo-btn');
  if (undoBtn) {
    undoBtn.style.display = 'block';
    if (window.undoTimeout) clearTimeout(window.undoTimeout);
    window.undoTimeout = setTimeout(() => undoBtn.style.display = 'none', 5000);
  }
}

function showModalUndoButton(modal, context) {
  const existing = modal.querySelector('.modal-undo-btn');
  if (existing) existing.remove();

  const btn = document.createElement('button');
  btn.className = 'modal-undo-btn';
  btn.textContent = '↺ Deshacer eliminación';
  btn.onclick = () => {
    if (undoStack[context]) {
      if (context === 'shoppingList') shoppingList = JSON.parse(JSON.stringify(undoStack[context]));
      else if (context === 'favorites') favoriteProducts = JSON.parse(JSON.stringify(undoStack[context]));
      else if (context === 'defaults') defaultProducts = JSON.parse(JSON.stringify(undoStack[context]));
      else if (context === 'categories') categories = JSON.parse(JSON.stringify(undoStack[context]));
      else if (context === 'locations') locations = JSON.parse(JSON.stringify(undoStack[context]));
      
      undoStack[context] = null;
      renderShoppingList();
      renderFavoritesList();
      renderDefaultsList();
      renderCategories();
      renderLocations();
      btn.remove();
      showAlert('Acción deshecha.', false, null, 'info');
    }
  };
  modal.querySelector('.modal-content').appendChild(btn);
  setTimeout(() => { if (btn.parentNode) btn.remove(); undoStack[context] = null; }, 5000);
}
// >>> RESTO DE EVENTOS (sin tocar eliminación ni deshacer) <<<
document.addEventListener('click', (e) => {
  const target = e.target;

  if (target.id === 'undo-btn') {
    let restored = false;
    for (const key of ['shoppingList', 'favorites', 'defaults', 'categories', 'locations']) {
      if (undoStack[key]) {
        if (key === 'shoppingList') shoppingList = JSON.parse(JSON.stringify(undoStack[key]));
        else if (key === 'favorites') favoriteProducts = JSON.parse(JSON.stringify(undoStack[key]));
        else if (key === 'defaults') defaultProducts = JSON.parse(JSON.stringify(undoStack[key]));
        else if (key === 'categories') categories = JSON.parse(JSON.stringify(undoStack[key]));
        else if (key === 'locations') locations = JSON.parse(JSON.stringify(undoStack[key]));
        undoStack[key] = null;
        restored = true;
        break;
      }
    }
    if (restored) {
      renderShoppingList();
      renderFavoritesList();
      renderDefaultsList();
      renderCategories();
      renderLocations();
      document.getElementById('undo-btn').style.display = 'none';
      showAlert('Acción deshecha.', false, null, 'info');
    }
    return;
  }

  if (target.id === 'add-product-btn') {
    e.preventDefault();
    const nameInput = document.getElementById('product-name');
    const name = nameInput.value.trim();
    if (!name) return nameInput.focus();
    if (shoppingList.some(item => item.name === name)) {
      showAlert('Este producto ya está en la lista.', false, null, 'warning');
      return;
    }

    const favorite = document.getElementById('product-favorite').checked;
    const isDefault = document.getElementById('product-default').checked;
    const categoryId = categorySelect.value ? Number(categorySelect.value) : null;
    const locationId = locationSelect.value ? Number(locationSelect.value) : null;

    const newItem = { id: generateId(), name, categoryId, locationId, bought: false };
    shoppingList.push(newItem);

    if (favorite && !favoriteProducts.some(p => p.name === name)) {
      favoriteProducts.push({...newItem, id: generateId()});
    } else if (!favorite) {
      favoriteProducts = favoriteProducts.filter(p => p.name !== name);
    }

    if (isDefault && !defaultProducts.some(p => p.name === name)) {
      defaultProducts.push({...newItem, id: generateId()});
    } else if (!isDefault) {
      defaultProducts = defaultProducts.filter(p => p.name !== name);
    }

    renderShoppingList();
    renderFavoritesList();
    renderDefaultsList();
    document.getElementById('add-product-form').reset();
    document.getElementById('product-default').checked = true;
    document.getElementById('add-product-modal').style.display = 'none';
    showAlert('Producto añadido a la lista!', false, null, 'info');
  }
});

// Eventos para selects en modales
document.addEventListener('change', (e) => {
  const target = e.target;
  const id = Number(target.dataset.id);

  if (target.classList.contains('product-category')) {
    const item = target.closest('.favorite-item') ? 
      favoriteProducts.find(p => p.id === id) : 
      defaultProducts.find(p => p.id === id);
    if (item) { item.categoryId = target.value ? Number(target.value) : null; saveData(); }
  }

  if (target.classList.contains('product-location')) {
    const item = target.closest('.favorite-item') ? 
      favoriteProducts.find(p => p.id === id) : 
      defaultProducts.find(p => p.id === id);
    if (item) { item.locationId = target.value ? Number(target.value) : null; saveData(); }
  }
});

// Copiar al portapapeles (solo lista actual)
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.cssText = 'position:fixed; left:-9999px; top:-9999px;';
  document.body.appendChild(textArea);
  textArea.select();
  try {
    if (document.execCommand('copy')) {
      showAlert('Lista copiada!', false, null, 'info');
    } else {
      showAlert('No se pudo copiar.', false, null, 'warning');
    }
  } catch (err) {
    showAlert('Tu navegador no permite copiar.', false, null, 'error');
  }
  document.body.removeChild(textArea);
}

// >>> EXPORTAR A JSON <<<
function downloadJsonAsFile(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// >>> IMPORTAR DESDE JSON <<<
function importDataFromJson(data) {
  try {
    // Validar estructura
    if (typeof data !== 'object' || data === null) {
      throw new Error('Formato inválido');
    }

    // Restaurar listas
    if (Array.isArray(data.shoppingList)) shoppingList = data.shoppingList;
    if (Array.isArray(data.favoriteProducts)) favoriteProducts = data.favoriteProducts;
    if (Array.isArray(data.defaultProducts)) defaultProducts = data.defaultProducts;
    if (Array.isArray(data.categories)) categories = data.categories;
    if (Array.isArray(data.locations)) locations = data.locations;

    // Guardar y renderizar
    saveData();
    renderCategories();
    renderLocations();
    renderShoppingList();
    renderFavoritesList();
    renderDefaultsList();
    
    showAlert('✅ Datos importados correctamente.', false, null, 'info');
  } catch (err) {
    console.error('Error al importar JSON:', err);
    showAlert('❌ Error: archivo no válido o corrupto.', false, null, 'error');
  }
}

// Manejar selección de archivo JSON
if (importFileInput) {
  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        importDataFromJson(data);
      } catch (err) {
        showAlert('❌ Error: archivo JSON no válido.', false, null, 'error');
      }
      importFileInput.value = ''; // Reset
    };
    reader.onerror = () => {
      showAlert('Error al leer el archivo.', false, null, 'error');
    };
    reader.readAsText(file, 'utf-8');
  });
}

// >>> MANEJADOR DEL MENÚ HAMBURGUESA <<<
const hamburgerBtn = document.getElementById('hamburger-btn');
const hamburgerMenu = document.getElementById('hamburger-menu');

if (hamburgerBtn && hamburgerMenu) {
  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hamburgerMenu.classList.toggle('show');
  });

  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!hamburgerMenu.contains(e.target) && e.target !== hamburgerBtn) {
      hamburgerMenu.classList.remove('show');
    }
  });

  // Asignar acciones a los botones del menú
  hamburgerMenu.addEventListener('click', (e) => {
    if (e.target.classList.contains('menu-action')) {
      const action = e.target.dataset.action;
      hamburgerMenu.classList.remove('show');

      switch (action) {
        case 'add-product':
          document.getElementById('add-product-modal').style.display = 'block';
          break;
        case 'sort-list':
          // Crear mapas de índice
          const categoryIndexMap = categories.reduce((map, item, index) => {
            map[item.id] = index;
            return map;
          }, {});
          const locationIndexMap = locations.reduce((map, item, index) => {
            map[item.id] = index;
            return map;
          }, {});

          shoppingList.sort((a, b) => {
            const catA = a.categoryId !== undefined && a.categoryId !== null ? categoryIndexMap[a.categoryId] : Infinity;
            const catB = b.categoryId !== undefined && b.categoryId !== null ? categoryIndexMap[b.categoryId] : Infinity;
            if (catA !== catB) return catA - catB;
            
            const locA = a.locationId !== undefined && a.locationId !== null ? locationIndexMap[a.locationId] : Infinity;
            const locB = b.locationId !== undefined && b.locationId !== null ? locationIndexMap[b.locationId] : Infinity;
            return locA - locB;
          });
          renderShoppingList();
          showAlert('✅ Lista ordenada por categoría y ubicación.', false, null, 'info');
          break;
        case 'copy-list':
          const pendingItems = shoppingList.filter(item => !item.bought);
          if (pendingItems.length === 0) {
            showAlert(pendingItems.length === 0 && shoppingList.length > 0 
              ? 'No hay productos pendientes en la lista.' 
              : 'La lista está vacía.', false, null, 'warning');
          } else {
            const listText = pendingItems.map((item, index) => {
              const cat = categories.find(c => c.id === item.categoryId)?.name || '';
              const loc = locations.find(l => l.id === item.locationId)?.name || '';
              const isFav = favoriteProducts.some(p => p.name === item.name && p.categoryId === item.categoryId && p.locationId === item.locationId);
              const isDef = defaultProducts.some(p => p.name === item.name && p.categoryId === item.categoryId && p.locationId === item.locationId);
              const prefix = isFav ? '⭐ ' : isDef ? '📌 ' : '';
              const catLoc = cat && loc ? `[${cat} - ${loc}]` : cat ? `[${cat}]` : loc ? `[${loc}]` : '';
              return `${index + 1}. ${prefix}${item.name} ${catLoc}`.trim();
            }).join('\n');
            if (navigator.clipboard && window.isSecureContext) {
              navigator.clipboard.writeText(listText).then(() => {
                showAlert('Lista copiada!', false, null, 'info');
              }).catch(() => fallbackCopyTextToClipboard(listText));
            } else {
              fallbackCopyTextToClipboard(listText);
            }
          }
          break;
        case 'clear-list':
          showAlert('¿Seguro que quieres borrar la lista actual?', true, () => {
            shoppingList = [];
            renderShoppingList();
          }, 'error');
          break;
        case 'open-favorites':
          openModal(favoritesModal, renderFavoritesList);
          break;
        case 'load-favorites':
          if (shoppingList.length > 0) {
            showAlert('La lista ya contiene productos. No se puede cargar favoritos.', false, null, 'warning');
            return;
          }
          if (favoriteProducts.length === 0) {
            showAlert('No hay productos marcados como favoritos.', false, null, 'warning');
            return;
          }
          const favoritesToAdd = favoriteProducts.filter(fav => !shoppingList.some(item => item.name === fav.name));
          if (favoritesToAdd.length === 0) {
            showAlert('Los favoritos ya están en la lista.', false, null, 'warning');
            return;
          }
          shoppingList.push(...favoritesToAdd.map(fav => ({ ...fav, id: generateId(), bought: false })));
          renderShoppingList();
          showAlert('Favoritos cargados correctamente.', false, null, 'info');
          break;
        case 'open-defaults':
          openModal(defaultsModal, renderDefaultsList);
          break;
        case 'export-json':
          const exportData = {
            shoppingList,
            favoriteProducts,
            defaultProducts,
            categories,
            locations,
            exportedAt: new Date().toISOString(),
            version: '1.0'
          };
          const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
          downloadJsonAsFile(exportData, `jj-shopping-list-backup-${timestamp}.json`);
          showAlert('✅ Copia de seguridad en JSON creada.', false, null, 'info');
          break;
        case 'import-json':
          importFileInput.click();
          break;
        case 'open-config':
          openModal(configModal, () => {
            renderCategories();
            renderLocations();
          });
          break;
        case 'open-help':
          document.getElementById('help-modal').style.display = 'block';
          break;
      }
    }
  });

  // Cerrar con el botón ×
  const closeHamburgerBtn = document.getElementById('close-hamburger-menu');
  if (closeHamburgerBtn) {
    closeHamburgerBtn.addEventListener('click', () => {
      hamburgerMenu.classList.remove('show');
    });
  }
}

// Estilos para alertas
const style = document.createElement('style');
style.textContent = `
  .custom-alert { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 10000; }
  .alert-content { background: white; padding: 20px; border-radius: 8px; text-align: center; min-width: 250px; }
  .alert-title { margin-bottom: 10px; }
  .alert-content p { margin-bottom: 15px; }
  .alert-buttons { display: flex; gap: 10px; justify-content: center; }
  .alert-ok, .alert-cancel, .alert-confirm { background-color: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
  .alert-cancel { background-color: #6c757d; }
  .alert-ok:hover, .alert-confirm:hover { background-color: #388E3C; }
  .alert-cancel:hover { background-color: #5a6268; }
`;
document.head.appendChild(style);

// Inicializar
renderCategories();
renderLocations();
renderShoppingList();
renderFavoritesList();
renderDefaultsList();

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('✅ SW registrado:', reg))
      .catch(err => console.error('❌ Error en SW:', err));
  });
}
