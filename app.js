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

// Función para generar ID único
function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000000);
}

// Función de alerta personalizada con niveles: error, success, warning
function showAlert(message, options = {}) {
  const {
    type = 'info',
    isConfirm = false,
    onConfirm = null
  } = options;

  const titles = {
    error: 'Atención:',
    success: 'Información:',
    warning: 'Información:'
  };

  const colors = {
    error: '#d32f2f',
    success: '#2e7d32',
    warning: '#f57c00'
  };

  const alertDiv = document.createElement('div');
  alertDiv.className = 'custom-alert';

  const titleText = titles[type] || 'Información:';
  const titleColor = colors[type] || '#2e7d32';

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
    div.innerHTML = `
      <input type="text" value="${cat.name}" data-id="${cat.id}" />
      <div class="category-actions">
        <button type="button" class="save-category" data-id="${cat.id}">💾</button>
        <button type="button" class="delete-category" data-id="${cat.id}">🗑️</button>
      </div>
    `;
    categoriesListEl.appendChild(div);

    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });
}

function renderLocations() {
  locationsListEl.innerHTML = '';
  locationSelect.innerHTML = '<option value="">-- Ubicación --</option>';
  
  locations.forEach(loc => {
    const div = document.createElement('div');
    div.className = 'location-item';
    div.dataset.id = loc.id;
    div.draggable = true;
    div.innerHTML = `
      <input type="text" value="${loc.name}" data-id="${loc.id}" />
      <div class="location-actions">
        <button type="button" class="save-location" data-id="${loc.id}">💾</button>
        <button type="button" class="delete-location" data-id="${loc.id}">🗑️</button>
      </div>
    `;
    locationsListEl.appendChild(div);

    const option = document.createElement('option');
    option.value = loc.id;
    option.textContent = loc.name;
    locationSelect.appendChild(option);
  });
}

function renderProductItem(item, index) {
  const categoryName = categories.find(c => c.id === item.categoryId)?.name || 'Sin categoría';
  const locationName = locations.find(l => l.id === item.locationId)?.name || 'Sin ubicación';
  
  const isFavorite = favoriteProducts.some(p => 
    p.name === item.name && p.categoryId === item.categoryId && p.locationId === item.locationId
  );
  const isDefault = defaultProducts.some(p => 
    p.name === item.name && p.categoryId === item.categoryId && p.locationId === item.locationId
  );
  
  const li = document.createElement('li');
  li.innerHTML = `
    <div class="product-info">
      <h3>${item.name}${isFavorite ? ' ⭐' : ''}${isDefault ? ' 📌' : ''}</h3>
      <div class="category">${categoryName}</div>
      <div class="location">${locationName}</div>
    </div>
    <div class="actions">
      <input type="checkbox" class="bought" ${item.bought ? 'checked' : ''} data-index="${index}">
      <button type="button" class="delete-btn" data-index="${index}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
      </button>
    </div>
  `;
  return li;
}

function renderShoppingList() {
  shoppingListEl.innerHTML = '';
  shoppingList.forEach((item, index) => {
    const li = renderProductItem(item, index);
    li.dataset.index = index;
    li.draggable = true;
    shoppingListEl.appendChild(li);
  });
  saveData();

  // Activar drag & drop en la lista principal
  setupDragAndDrop(shoppingListEl, 'li', shoppingList, renderShoppingList);
}

function renderFavoritesList() {
  favoritesListEl.innerHTML = '';
  
  favoriteProducts.forEach((item, index) => {
    const categoryName = categories.find(c => c.id === item.categoryId)?.name || 'Sin categoría';
    const locationName = locations.find(l => l.id === item.locationId)?.name || 'Sin ubicación';
    
    const div = document.createElement('div');
    div.className = 'favorite-item';
    div.dataset.index = index;
    div.draggable = true;
    div.innerHTML = `
      <div class="product-edit">
        <input type="text" value="${item.name}" data-index="${index}" class="product-name" />
        <div class="category-location-row">
          <select class="product-category" data-index="${index}">
            <option value="">-- Categoría --</option>
            ${categories.map(cat => `<option value="${cat.id}" ${cat.id === item.categoryId ? 'selected' : ''}>${cat.name}</option>`).join('')}
          </select>
          <select class="product-location" data-index="${index}">
            <option value="">-- Ubicación --</option>
            ${locations.map(loc => `<option value="${loc.id}" ${loc.id === item.locationId ? 'selected' : ''}>${loc.name}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="favorite-actions">
        <button type="button" class="add-to-list" data-index="${index}" data-type="favorite">➕ Añadir</button>
        <button type="button" class="save-favorite" data-index="${index}">💾</button>
        <button type="button" class="delete-favorite" data-index="${index}">🗑️</button>
      </div>
    `;
    favoritesListEl.appendChild(div);
  });
}

function renderDefaultsList() {
  defaultsListEl.innerHTML = '';
  
  defaultProducts.forEach((item, index) => {
    const categoryName = categories.find(c => c.id === item.categoryId)?.name || 'Sin categoría';
    const locationName = locations.find(l => l.id === item.locationId)?.name || 'Sin ubicación';
    
    const div = document.createElement('div');
    div.className = 'default-item';
    div.dataset.index = index;
    div.draggable = true;
    div.innerHTML = `
      <div class="product-edit">
        <input type="text" value="${item.name}" data-index="${index}" class="product-name" />
        <div class="category-location-row">
          <select class="product-category" data-index="${index}">
            <option value="">-- Categoría --</option>
            ${categories.map(cat => `<option value="${cat.id}" ${cat.id === item.categoryId ? 'selected' : ''}>${cat.name}</option>`).join('')}
          </select>
          <select class="product-location" data-index="${index}">
            <option value="">-- Ubicación --</option>
            ${locations.map(loc => `<option value="${loc.id}" ${loc.id === item.locationId ? 'selected' : ''}>${loc.name}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="default-actions">
        <button type="button" class="add-to-list" data-index="${index}" data-type="default">➕ Añadir</button>
        <button type="button" class="save-default" data-index="${index}">💾</button>
        <button type="button" class="delete-default" data-index="${index}">🗑️</button>
      </div>
    `;
    defaultsListEl.appendChild(div);
  });
}

// Drag & Drop genérico mejorado (sin clonación, con limpieza explícita)
function setupDragAndDrop(listEl, itemSelector, arrayToUpdate, renderFn) {
  // Limpiar eventos anteriores
  const existingItems = listEl.querySelectorAll(itemSelector);
  existingItems.forEach(item => {
    item.removeEventListener('dragstart', handleDragStart);
    item.removeEventListener('dragover', handleDragOver);
    item.removeEventListener('dragenter', handleDragEnter);
    item.removeEventListener('dragleave', handleDragLeave);
    item.removeEventListener('drop', handleDrop);
    item.removeEventListener('dragend', handleDragEnd);
  });

  function handleDragStart(e) {
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
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

    const draggingEl = listEl.querySelector('.dragging');
    if (!draggingEl || draggingEl === this) return;

    const srcIndex = parseInt(draggingEl.dataset.index, 10);
    const targetIndex = parseInt(this.dataset.index, 10);

    if (isNaN(srcIndex) || isNaN(targetIndex)) return;

    const [movedItem] = arrayToUpdate.splice(srcIndex, 1);
    arrayToUpdate.splice(targetIndex, 0, movedItem);
    renderFn();
  }

  function handleDragEnd() {
    this.classList.remove('dragging');
    listEl.querySelectorAll(itemSelector).forEach(item => {
      item.classList.remove('drag-over');
    });
  }

  // Vincular nuevos eventos
  const items = listEl.querySelectorAll(itemSelector);
  items.forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('dragenter', handleDragEnter);
    item.addEventListener('dragleave', handleDragLeave);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('dragend', handleDragEnd);
  });
}

// Modal controls
function openModal(modal, renderFn, dragSetupFn) {
  modal.style.display = 'block';
  renderFn();
  if (dragSetupFn) {
    setTimeout(dragSetupFn, 100);
  }
}

function closeModal(modal) {
  modal.style.display = 'none';
}

// Event listeners para modales
if (openFavoritesBtn) {
  openFavoritesBtn.addEventListener('click', () => {
    openModal(favoritesModal, renderFavoritesList, () => {
      setupDragAndDrop(favoritesListEl, '.favorite-item', favoriteProducts, renderFavoritesList);
    });
  });
}

if (openDefaultsBtn) {
  openDefaultsBtn.addEventListener('click', () => {
    openModal(defaultsModal, renderDefaultsList, () => {
      setupDragAndDrop(defaultsListEl, '.default-item', defaultProducts, renderDefaultsList);
    });
  });
}

// Cerrar modales
const closeButtons = [
  {btn: closeConfigBtn, modal: configModal},
  {btn: closeFavoritesBtn, modal: favoritesModal},
  {btn: closeDefaultsBtn, modal: defaultsModal},
  {btn: closeConfigModalBtn, modal: configModal},
  {btn: closeFavoritesModalBtn, modal: favoritesModal},
  {btn: closeDefaultsModalBtn, modal: defaultsModal}
];

closeButtons.forEach(({btn, modal}) => {
  if (btn) {
    btn.addEventListener('click', () => closeModal(modal));
  }
});

window.addEventListener('click', (e) => {
  if (e.target === configModal) closeModal(configModal);
  if (e.target === favoritesModal) closeModal(favoritesModal);
  if (e.target === defaultsModal) closeModal(defaultsModal);
});

// Configuración modal
if (openConfigBtn) {
  openConfigBtn.addEventListener('click', () => {
    openModal(configModal, () => {
      renderCategories();
      renderLocations();
    }, () => {
      setupDragAndDrop(categoriesListEl, '.category-item', categories, renderCategories);
      setupDragAndDrop(locationsListEl, '.location-item', locations, renderLocations);
    });
  });
}

// Añadir categoría
if (categoryForm) {
  categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('new-category');
    const name = input.value.trim();
    
    if (!name) return;

    const exists = categories.some(c => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      showAlert('La categoría ya existe.', { type: 'warning' });
      return;
    }

    categories.push({ id: Date.now(), name });
    renderCategories();
    saveData();
    input.value = '';
  });
}

// Añadir ubicación
if (locationForm) {
  locationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('new-location');
    const name = input.value.trim();
    
    if (!name) return;

    const exists = locations.some(l => l.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      showAlert('La ubicación ya existe.', { type: 'warning' });
      return;
    }

    locations.push({ id: Date.now(), name });
    renderLocations();
    saveData();
    input.value = '';
  });
  }


           // Historial para deshacer
let undoStack = [];
let undoTimeout = null;

function showUndoButton() {
  const undoBtn = document.getElementById('undo-btn');
  if (undoBtn) {
    undoBtn.style.display = 'block';
    if (undoTimeout) clearTimeout(undoTimeout);
    undoTimeout = setTimeout(() => {
      undoBtn.style.display = 'none';
    }, 5000);
  }
}

function undoDelete() {
  if (undoStack.length === 0) return;
  const lastState = undoStack.pop();
  shoppingList = lastState;
  renderShoppingList();
  const undoBtn = document.getElementById('undo-btn');
  if (undoBtn) undoBtn.style.display = 'none';
  if (undoTimeout) clearTimeout(undoTimeout);
  showAlert('Producto restaurado.', { type: 'success' });
}

// Listener de la lista principal (fuera de delegación global)
if (shoppingListEl) {
  shoppingListEl.addEventListener('click', (e) => {
    const index = e.target.dataset.index;
    if (index === undefined) return;

    if (e.target.classList.contains('bought')) {
      shoppingList[index].bought = e.target.checked;
      saveData();
    } else if (e.target.classList.contains('delete-btn')) {
      undoStack.push([...shoppingList]);
      shoppingList.splice(index, 1);
      renderShoppingList();
      showUndoButton();
    }
  });
}

// Delegación global de eventos (sin anidamiento)
document.addEventListener('click', function(e) {
  // Deshacer
  if (e.target.id === 'undo-btn') {
    undoDelete();
    return;
  }

  // Favoritos - Añadir
  if (e.target.classList.contains('add-to-list') && e.target.dataset.type === 'favorite') {
    const index = Number(e.target.dataset.index);
    if (index >= 0 && index < favoriteProducts.length) {
      const itemToAdd = favoriteProducts[index];
      if (shoppingList.some(item => item.name === itemToAdd.name)) {
        showAlert('Este producto ya está en la lista.', { type: 'warning' });
        return;
      }
      shoppingList.push({ ...itemToAdd, id: generateId(), bought: false });
      renderShoppingList();
      showAlert('Producto añadido a la lista!', { type: 'success' });
    }
    return;
  }

  // Predeterminados - Añadir
  if (e.target.classList.contains('add-to-list') && e.target.dataset.type === 'default') {
    const index = Number(e.target.dataset.index);
    if (index >= 0 && index < defaultProducts.length) {
      const itemToAdd = defaultProducts[index];
      if (shoppingList.some(item => item.name === itemToAdd.name)) {
        showAlert('Este producto ya está en la lista.', { type: 'warning' });
        return;
      }
      shoppingList.push({ ...itemToAdd, id: generateId(), bought: false });
      renderShoppingList();
      showAlert('Producto añadido a la lista!', { type: 'success' });
    }
    return;
  }

  // Guardar/eliminar en modales
  if (e.target.classList.contains('save-category')) {
    const id = Number(e.target.dataset.id);
    const input = e.target.closest('.category-item').querySelector('input');
    const newName = input.value.trim();
    if (newName) {
      const cat = categories.find(c => c.id === id);
      if (cat) {
        cat.name = newName;
        renderCategories();
        renderShoppingList();
        renderFavoritesList();
        renderDefaultsList();
        saveData();
      }
    }
  }

  if (e.target.classList.contains('delete-category')) {
    const id = Number(e.target.dataset.id);
    if ([...shoppingList, ...favoriteProducts, ...defaultProducts].some(p => p.categoryId === id)) {
      showAlert('No se puede eliminar: hay productos en esta categoría.', { type: 'warning' });
      return;
    }
    categories = categories.filter(c => c.id !== id);
    renderCategories();
    renderShoppingList();
    renderFavoritesList();
    renderDefaultsList();
    saveData();
  }

  if (e.target.classList.contains('save-location')) {
    const id = Number(e.target.dataset.id);
    const input = e.target.closest('.location-item').querySelector('input');
    const newName = input.value.trim();
    if (newName) {
      const loc = locations.find(l => l.id === id);
      if (loc) {
        loc.name = newName;
        renderLocations();
        renderShoppingList();
        renderFavoritesList();
        renderDefaultsList();
        saveData();
      }
    }
  }

  if (e.target.classList.contains('delete-location')) {
    const id = Number(e.target.dataset.id);
    if ([...shoppingList, ...favoriteProducts, ...defaultProducts].some(p => p.locationId === id)) {
      showAlert('No se puede eliminar: hay productos en esta ubicación.', { type: 'warning' });
      return;
    }
    locations = locations.filter(l => l.id !== id);
    renderLocations();
    renderShoppingList();
    renderFavoritesList();
    renderDefaultsList();
    saveData();
  }

  if (e.target.classList.contains('save-favorite')) {
    const index = Number(e.target.dataset.index);
    if (index >= 0 && index < favoriteProducts.length) {
      const input = e.target.closest('.favorite-item').querySelector('.product-name');
      const newName = input.value.trim();
      if (newName) {
        favoriteProducts[index].name = newName;
        renderFavoritesList();
        renderShoppingList();
        saveData();
      }
    }
  }

  if (e.target.classList.contains('delete-favorite')) {
    const index = Number(e.target.dataset.index);
    if (index >= 0 && index < favoriteProducts.length) {
      favoriteProducts.splice(index, 1);
      renderFavoritesList();
      renderShoppingList();
      saveData();
    }
  }

  if (e.target.classList.contains('save-default')) {
    const index = Number(e.target.dataset.index);
    if (index >= 0 && index < defaultProducts.length) {
      const input = e.target.closest('.default-item').querySelector('.product-name');
      const newName = input.value.trim();
      if (newName) {
        defaultProducts[index].name = newName;
        renderDefaultsList();
        renderShoppingList();
        saveData();
      }
    }
  }

  if (e.target.classList.contains('delete-default')) {
    const index = Number(e.target.dataset.index);
    if (index >= 0 && index < defaultProducts.length) {
      defaultProducts.splice(index, 1);
      renderDefaultsList();
      renderShoppingList();
      saveData();
    }
  }
});

// Eventos para selects en modales
document.addEventListener('change', (e) => {
  // Favoritos
  if (e.target.classList.contains('product-category') && e.target.closest('.favorite-item')) {
    const index = Number(e.target.dataset.index);
    if (index >= 0 && index < favoriteProducts.length) {
      favoriteProducts[index].categoryId = e.target.value ? Number(e.target.value) : null;
      saveData();
    }
  }
  if (e.target.classList.contains('product-location') && e.target.closest('.favorite-item')) {
    const index = Number(e.target.dataset.index);
    if (index >= 0 && index < favoriteProducts.length) {
      favoriteProducts[index].locationId = e.target.value ? Number(e.target.value) : null;
      saveData();
    }
  }
  // Predeterminados
  if (e.target.classList.contains('product-category') && e.target.closest('.default-item')) {
    const index = Number(e.target.dataset.index);
    if (index >= 0 && index < defaultProducts.length) {
      defaultProducts[index].categoryId = e.target.value ? Number(e.target.value) : null;
      saveData();
    }
  }
  if (e.target.classList.contains('product-location') && e.target.closest('.default-item')) {
    const index = Number(e.target.dataset.index);
    if (index >= 0 && index < defaultProducts.length) {
      defaultProducts[index].locationId = e.target.value ? Number(e.target.value) : null;
      saveData();
    }
  }
});

// Añadir producto
const addProductBtn = document.getElementById('add-product-btn');
if (addProductBtn) {
  addProductBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('product-name');
    const name = nameInput.value.trim();
    if (!name) return nameInput.focus();

    if (shoppingList.some(item => item.name === name)) {
      showAlert('Este producto ya está en la lista.', { type: 'warning' });
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
    showAlert('Producto añadido a la lista!', { type: 'success' });
  });
}

// Botón de limpiar
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    showAlert('¿Seguro que quieres borrar la lista actual?', { 
      type: 'error', 
      isConfirm: true, 
      onConfirm: () => {
        shoppingList = [];
        renderShoppingList();
      } 
    });
  });
}

// Cargar Favoritos
if (loadFavoritesBtn) {
  loadFavoritesBtn.addEventListener('click', () => {
    if (shoppingList.length > 0) {
      showAlert('La lista ya contiene productos. No se puede cargar favoritos.', { type: 'warning' });
      return;
    }
    if (favoriteProducts.length === 0) {
      showAlert('No hay productos marcados como favoritos.', { type: 'warning' });
      return;
    }
    const favoritesToAdd = favoriteProducts.filter(fav => !shoppingList.some(item => item.name === fav.name));
    if (favoritesToAdd.length === 0) {
      showAlert('Los favoritos ya están en la lista.', { type: 'warning' });
      return;
    }
    shoppingList.push(...favoritesToAdd.map(fav => ({ ...fav, id: generateId(), bought: false })));
    renderShoppingList();
    showAlert('Favoritos cargados correctamente.', { type: 'success' });
  });
}

// Copiar lista
if (copyListBtn) {
  copyListBtn.addEventListener('click', () => {
    const pendingItems = shoppingList.filter(item => !item.bought);
    if (pendingItems.length === 0) {
      showAlert(pendingItems.length === 0 && shoppingList.length > 0 
        ? 'No hay productos pendientes en la lista.' 
        : 'La lista está vacía.', { type: 'warning' });
      return;
    }
    const listText = pendingItems.map((item, index) => {
      const cat = categories.find(c => c.id === item.categoryId)?.name || 'Sin categoría';
      const loc = locations.find(l => l.id === item.locationId)?.name || 'Sin ubicación';
      const isFav = favoriteProducts.some(p => p.name === item.name && p.categoryId === item.categoryId && p.locationId === item.locationId);
      const isDef = defaultProducts.some(p => p.name === item.name && p.categoryId === item.categoryId && p.locationId === item.locationId);
      const prefix = isFav ? '⭐ ' : isDef ? '📌 ' : '';
      return `${index + 1}. ${prefix}${item.name} [${cat} - ${loc}]`;
    }).join('\n');

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(listText).then(() => {
        showAlert('Lista copiada al portapapeles!', { type: 'success' });
      }).catch(() => fallbackCopyTextToClipboard(listText));
    } else {
      fallbackCopyTextToClipboard(listText);
    }
  });
}

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.cssText = 'position:fixed; left:-9999px; top:-9999px;';
  document.body.appendChild(textArea);
  textArea.select();
  try {
    if (document.execCommand('copy')) {
      showAlert('Lista copiada!', { type: 'success' });
    } else {
      showAlert('No se pudo copiar.', { type: 'warning' });
    }
  } catch (err) {
    showAlert('Tu navegador no permite copiar.', { type: 'error' });
  }
  document.body.removeChild(textArea);
}

// Modal de Ayuda
const openHelpBtn = document.getElementById('open-help-btn');
const closeHelpBtn = document.getElementById('close-help-btn');
const closeHelpModalBtn = document.getElementById('close-help-modal-btn');
const helpModal = document.getElementById('help-modal');

if (openHelpBtn) openHelpBtn.addEventListener('click', () => helpModal.style.display = 'block');
[closeHelpBtn, closeHelpModalBtn].forEach(btn => {
  if (btn) btn.addEventListener('click', () => helpModal.style.display = 'none');
});
window.addEventListener('click', (e) => {
  if (e.target === helpModal) helpModal.style.display = 'none';
});

// Crear botón de deshacer al inicio
(function() {
  if (!document.getElementById('undo-btn')) {
    const undoBtn = document.createElement('button');
    undoBtn.id = 'undo-btn';
    undoBtn.className = 'undo-btn';
    undoBtn.textContent = '↺ Deshacer';
    undoBtn.style.display = 'none';
    document.body.appendChild(undoBtn);
    undoBtn.addEventListener('click', undoDelete);
  }
})();

// Estilos para alertas
const style = document.createElement('style');
style.textContent = `
  .custom-alert {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  }
  .alert-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    min-width: 250px;
  }
  .alert-title {
    margin-bottom: 10px;
  }
  .alert-content p {
    margin-bottom: 15px;
  }
  .alert-buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  .alert-ok, .alert-cancel, .alert-confirm {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
  .alert-cancel {
    background-color: #6c757d;
  }
  .alert-ok:hover, .alert-confirm:hover {
    background-color: #388E3C;
  }
  .alert-cancel:hover {
    background-color: #5a6268;
  }
`;
document.head.appendChild(style);

// Inicializar
renderCategories();
renderLocations();
renderShoppingList();
renderFavoritesList();
renderDefaultsList();     
