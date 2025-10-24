// DOM Elements
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

// Nuevos elementos
const openAddProductModalBtn = document.getElementById('open-add-product-modal');
const closeAddProductModalBtn = document.getElementById('close-add-product-modal-btn');
const addProductModal = document.getElementById('add-product-modal');
const addProductBtn = document.getElementById('add-product-btn');

// Load data
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

let undoStack = {
  shoppingList: null,
  favorites: null,
  defaults: null,
  categories: null,
  locations: null
};

const TRASH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;
const SAVE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17,3H5C3.89,3 3,3.89 3,5V19C3,20.11 3.89,21 5,21H19C20.11,21 21,20.11 21,19V7L17,3M12,19C10.34,19 9,17.66 9,16C9,14.34 10.34,13 12,13C13.66,13 15,14.34 15,16C15,17.66 13.66,19 12,19M18,12H6V6H17V12Z"/></svg>`;

function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000000);
}

function showAlert(message, isConfirm = false, onConfirm = null, type = 'info') {
  const colors = { info: '#2e7d32', warning: '#f57c00', error: '#d32f2f' };
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
    cancelBtn.addEventListener('click', () => document.body.removeChild(alertDiv));
    confirmBtn.addEventListener('click', () => { document.body.removeChild(alertDiv); if (onConfirm) onConfirm(); });
  } else {
    alertDiv.innerHTML = `
      <div class="alert-content">
        <h3 class="alert-title" style="color: ${titleColor};">${titleText}</h3>
        <p>${message}</p>
        <button class="alert-ok">OK</button>
      </div>
    `;
    const okBtn = alertDiv.querySelector('.alert-ok');
    okBtn.addEventListener('click', () => document.body.removeChild(alertDiv));
  }
  
  if (!isConfirm) {
    const closeOnEscape = (e) => { if (e.key === 'Escape') { document.body.removeChild(alertDiv); document.removeEventListener('keydown', closeOnEscape); } };
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
        <button type="button" class="save-category" data-id="${cat.id}">${SAVE_SVG}</button>
        <button type="button" class="delete-category" data-id="${cat.id}">${TRASH_SVG}</button>
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
        <button type="button" class="save-location" data-id="${loc.id}">${SAVE_SVG}</button>
        <button type="button" class="delete-location" data-id="${loc.id}">${TRASH_SVG}</button>
      </div>
    `;
    locationsListEl.appendChild(div);
    const option = document.createElement('option');
    option.value = loc.id;
    option.textContent = loc.name;
    locationSelect.appendChild(option);
  });
}

function renderProductItem(item) {
  const categoryName = categories.find(c => c.id === item.categoryId)?.name || 'Sin categoría';
  const locationName = locations.find(l => l.id === item.locationId)?.name || 'Sin ubicación';
  const isFavorite = favoriteProducts.some(p => p.name === item.name && p.categoryId === item.categoryId && p.locationId === item.locationId);
  const isDefault = defaultProducts.some(p => p.name === item.name && p.categoryId === item.categoryId && p.locationId === item.locationId);
  const li = document.createElement('li');
  li.dataset.id = item.id;
  li.draggable = true;
  li.innerHTML = `
    <div class="product-info">
      <h3>${item.name}${isFavorite ? ' ⭐' : ''}${isDefault ? ' 📌' : ''}</h3>
      <div class="category">${categoryName}</div>
      <div class="location">${locationName}</div>
    </div>
    <div class="actions">
      <input type="checkbox" class="bought" ${item.bought ? 'checked' : ''} data-id="${item.id}">
      <button type="button" class="delete-btn" data-id="${item.id}">${TRASH_SVG}</button>
    </div>
  `;
  return li;
}

function renderShoppingList() {
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
    const categoryName = categories.find(c => c.id === item.categoryId)?.name || 'Sin categoría';
    const locationName = locations.find(l => l.id === item.locationId)?.name || 'Sin ubicación';
    const div = document.createElement('div');
    div.className = 'favorite-item';
    div.dataset.id = item.id;
    div.draggable = true;
    div.innerHTML = `
      <div class="product-edit">
        <input type="text" value="${item.name}" data-id="${item.id}" class="product-name" />
        <div class="category-location-row">
          <select class="product-category" data-id="${item.id}">
            <option value="">-- Categoría --</option>
            ${categories.map(cat => `<option value="${cat.id}" ${cat.id === item.categoryId ? 'selected' : ''}>${cat.name}</option>`).join('')}
          </select>
          <select class="product-location" data-id="${item.id}">
            <option value="">-- Ubicación --</option>
            ${locations.map(loc => `<option value="${loc.id}" ${loc.id === item.locationId ? 'selected' : ''}>${loc.name}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="favorite-actions">
        <button type="button" class="add-to-list" data-id="${item.id}" data-type="favorite">➕ Añadir</button>
        <button type="button" class="save-favorite" data-id="${item.id}">${SAVE_SVG}</button>
        <button type="button" class="delete-favorite" data-id="${item.id}">${TRASH_SVG}</button>
      </div>
    `;
    favoritesListEl.appendChild(div);
  });
  initDragAndDrop(favoritesListEl, '.favorite-item', favoriteProducts, renderFavoritesList);
}

function renderDefaultsList() {
  defaultsListEl.innerHTML = '';
  defaultProducts.forEach(item => {
    const categoryName = categories.find(c => c.id === item.categoryId)?.name || 'Sin categoría';
    const locationName = locations.find(l => l.id === item.locationId)?.name || 'Sin ubicación';
    const div = document.createElement('div');
    div.className = 'default-item';
    div.dataset.id = item.id;
    div.draggable = true;
    div.innerHTML = `
      <div class="product-edit">
        <input type="text" value="${item.name}" data-id="${item.id}" class="product-name" />
        <div class="category-location-row">
          <select class="product-category" data-id="${item.id}">
            <option value="">-- Categoría --</option>
            ${categories.map(cat => `<option value="${cat.id}" ${cat.id === item.categoryId ? 'selected' : ''}>${cat.name}</option>`).join('')}
          </select>
          <select class="product-location" data-id="${item.id}">
            <option value="">-- Ubicación --</option>
            ${locations.map(loc => `<option value="${loc.id}" ${loc.id === item.locationId ? 'selected' : ''}>${loc.name}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="default-actions">
        <button type="button" class="add-to-list" data-id="${item.id}" data-type="default">➕ Añadir</button>
        <button type="button" class="save-default" data-id="${item.id}">${SAVE_SVG}</button>
        <button type="button" class="delete-default" data-id="${item.id}">${TRASH_SVG}</button>
      </div>
    `;
    defaultsListEl.appendChild(div);
  });
  initDragAndDrop(defaultsListEl, '.default-item', defaultProducts, renderDefaultsList);
}

function initDragAndDrop(container, itemSelector, dataArray, renderFn) {
  const existingItems = container.querySelectorAll(itemSelector);
  existingItems.forEach(item => {
    item.removeEventListener('dragstart', handleDragStart);
    item.removeEventListener('dragover', handleDragOver);
    item.removeEventListener('dragenter', handleDragEnter);
    item.removeEventListener('dragleave', handleDragLeave);
    item.removeEventListener('drop', handleDrop);
    item.removeEventListener('dragend', handleDragEnd);
  });

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
    item.addEventListener('dragstart', handleDragStart, false);
    item.addEventListener('dragover', handleDragOver, false);
    item.addEventListener('dragenter', handleDragEnter, false);
    item.addEventListener('dragleave', handleDragLeave, false);
    item.addEventListener('drop', handleDrop, false);
    item.addEventListener('dragend', handleDragEnd, false);
  });
}

function openModal(modal, renderFn) {
  modal.style.display = 'block';
  renderFn();
}

function closeModal(modal) {
  modal.style.display = 'none';
}

if (openAddProductModalBtn) {
  openAddProductModalBtn.addEventListener('click', () => {
    addProductModal.style.display = 'block';
    document.getElementById('product-name').focus();
  });
}

if (closeAddProductModalBtn) {
  closeAddProductModalBtn.addEventListener('click', () => {
    addProductModal.style.display = 'none';
  });
}

if (openFavoritesBtn) {
  openFavoritesBtn.addEventListener('click', () => {
    openModal(favoritesModal, renderFavoritesList);
    setTimeout(() => initDragAndDrop(favoritesListEl, '.favorite-item', favoriteProducts, renderFavoritesList), 100);
  });
}

if (openDefaultsBtn) {
  openDefaultsBtn.addEventListener('click', () => {
    openModal(defaultsModal, renderDefaultsList);
    setTimeout(() => initDragAndDrop(defaultsListEl, '.default-item', defaultProducts, renderDefaultsList), 100);
  });
}

const closeButtons = [
  {btn: closeConfigBtn, modal: configModal},
  {btn: closeFavoritesBtn, modal: favoritesModal},
  {btn: closeDefaultsBtn, modal: defaultsModal},
  {btn: closeConfigModalBtn, modal: configModal},
  {btn: closeFavoritesModalBtn, modal: favoritesModal},
  {btn: closeDefaultsModalBtn, modal: defaultsModal}
];

closeButtons.forEach(({btn, modal}) => {
  if (btn) btn.addEventListener('click', () => closeModal(modal));
});

window.addEventListener('click', (e) => {
  if (e.target === addProductModal) addProductModal.style.display = 'none';
  if (e.target === configModal) closeModal(configModal);
  if (e.target === favoritesModal) closeModal(favoritesModal);
  if (e.target === defaultsModal) closeModal(defaultsModal);
  const helpModal = document.getElementById('help-modal');
  if (e.target === helpModal) helpModal.style.display = 'none';
});

if (openConfigBtn) {
  openConfigBtn.addEventListener('click', () => {
    openModal(configModal, () => {
      renderCategories();
      renderLocations();
    });
    setTimeout(() => {
      initDragAndDrop(categoriesListEl, '.category-item', categories, renderCategories);
      initDragAndDrop(locationsListEl, '.location-item', locations, renderLocations);
    }, 100);
  });
}

if (categoryForm) {
  categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('new-category');
    const name = input.value.trim();
    if (!name) return;
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      showAlert('La categoría ya existe.', false, null, 'warning');
      return;
    }
    categories.push({ id: Date.now(), name });
    renderCategories();
    saveData();
    input.value = '';
  });
}

if (locationForm) {
  locationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('new-location');
    const name = input.value.trim();
    if (!name) return;
    if (locations.some(l => l.name.toLowerCase() === name.toLowerCase())) {
      showAlert('La ubicación ya existe.', false, null, 'warning');
      return;
    }
    locations.push({ id: Date.now(), name });
    renderLocations();
    saveData();
    input.value = '';
  });
}
// Botón de deshacer (siempre presente)
(function() {
  let undoBtn = document.getElementById('undo-btn');
  if (!undoBtn) {
    undoBtn = document.createElement('button');
    undoBtn.id = 'undo-btn';
    undoBtn.className = 'undo-btn';
    undoBtn.textContent = '↺ Deshacer';
    undoBtn.style.display = 'none';
    document.body.appendChild(undoBtn);
  }
  undoBtn.addEventListener('click', () => {
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
      undoBtn.style.display = 'none';
      showAlert('Acción deshecha.', false, null, 'info');
    }
  });
})();

function showUndoButton() {
  const undoBtn = document.getElementById('undo-btn');
  if (undoBtn) {
    undoBtn.style.display = 'block';
    if (window.undoTimeout) clearTimeout(window.undoTimeout);
    window.undoTimeout = setTimeout(() => { undoBtn.style.display = 'none'; }, 5000);
  }
}

document.addEventListener('click', (e) => {
  let deleteBtn = e.target.closest('.delete-btn, .delete-favorite, .delete-default, .delete-category, .delete-location');
  if (!deleteBtn) return;
  const id = Number(deleteBtn.dataset.id);
  if (isNaN(id)) return;

  if (deleteBtn.classList.contains('delete-btn') && deleteBtn.closest('#shopping-list')) {
    undoStack.shoppingList = JSON.parse(JSON.stringify(shoppingList));
    shoppingList = shoppingList.filter(p => p.id !== id);
    renderShoppingList();
    showUndoButton();
    return;
  }

  if (deleteBtn.classList.contains('delete-favorite')) {
    undoStack.favorites = JSON.parse(JSON.stringify(favoriteProducts));
    favoriteProducts = favoriteProducts.filter(p => p.id !== id);
    renderFavoritesList();
    renderShoppingList();
    showUndoButton();
    return;
  }

  if (deleteBtn.classList.contains('delete-default')) {
    undoStack.defaults = JSON.parse(JSON.stringify(defaultProducts));
    defaultProducts = defaultProducts.filter(p => p.id !== id);
    renderDefaultsList();
    renderShoppingList();
    showUndoButton();
    return;
  }

  if (deleteBtn.classList.contains('delete-category')) {
    undoStack.categories = JSON.parse(JSON.stringify(categories));
    categories = categories.filter(c => c.id !== id);
    renderCategories();
    renderShoppingList();
    renderFavoritesList();
    renderDefaultsList();
    showUndoButton();
    return;
  }

  if (deleteBtn.classList.contains('delete-location')) {
    undoStack.locations = JSON.parse(JSON.stringify(locations));
    locations = locations.filter(l => l.id !== id);
    renderLocations();
    renderShoppingList();
    renderFavoritesList();
    renderDefaultsList();
    showUndoButton();
    return;
  }
});

document.addEventListener('click', function(e) {
  const target = e.target;
  if (
    target.closest('.delete-btn') ||
    target.closest('.delete-favorite') ||
    target.closest('.delete-default') ||
    target.closest('.delete-category') ||
    target.closest('.delete-location') ||
    target.id === 'undo-btn'
  ) return;

  if (target.classList.contains('add-to-list') && target.dataset.type === 'favorite') {
    const id = Number(target.dataset.id);
    const itemToAdd = favoriteProducts.find(p => p.id === id);
    if (itemToAdd && shoppingList.some(p => p.name === itemToAdd.name)) {
      showAlert('Este producto ya está en la lista.', false, null, 'warning');
      return;
    }
    if (itemToAdd) {
      shoppingList.push({ ...itemToAdd, id: generateId(), bought: false });
      renderShoppingList();
      showAlert('Producto añadido a la lista!', false, null, 'info');
    }
    return;
  }

  if (target.classList.contains('add-to-list') && target.dataset.type === 'default') {
    const id = Number(target.dataset.id);
    const itemToAdd = defaultProducts.find(p => p.id === id);
    if (itemToAdd && shoppingList.some(p => p.name === itemToAdd.name)) {
      showAlert('Este producto ya está en la lista.', false, null, 'warning');
      return;
    }
    if (itemToAdd) {
      shoppingList.push({ ...itemToAdd, id: generateId(), bought: false });
      renderShoppingList();
      showAlert('Producto añadido a la lista!', false, null, 'info');
    }
    return;
  }

  if (target.classList.contains('save-category')) {
    const id = Number(target.dataset.id);
    const input = target.closest('.category-item').querySelector('input');
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

  if (target.classList.contains('save-location')) {
    const id = Number(target.dataset.id);
    const input = target.closest('.location-item').querySelector('input');
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

  if (target.classList.contains('save-favorite')) {
    const id = Number(target.dataset.id);
    const input = target.closest('.favorite-item').querySelector('.product-name');
    const newName = input.value.trim();
    if (newName) {
      const item = favoriteProducts.find(p => p.id === id);
      if (item) {
        item.name = newName;
        renderFavoritesList();
        renderShoppingList();
        saveData();
      }
    }
  }

  if (target.classList.contains('save-default')) {
    const id = Number(target.dataset.id);
    const input = target.closest('.default-item').querySelector('.product-name');
    const newName = input.value.trim();
    if (newName) {
      const item = defaultProducts.find(p => p.id === id);
      if (item) {
        item.name = newName;
        renderDefaultsList();
        renderShoppingList();
        saveData();
      }
    }
  }
});

document.addEventListener('change', (e) => {
  const target = e.target;
  const id = Number(target.dataset.id);
  if (target.classList.contains('product-category')) {
    if (target.closest('.favorite-item')) {
      const item = favoriteProducts.find(p => p.id === id);
      if (item) { item.categoryId = target.value ? Number(target.value) : null; saveData(); }
    } else if (target.closest('.default-item')) {
      const item = defaultProducts.find(p => p.id === id);
      if (item) { item.categoryId = target.value ? Number(target.value) : null; saveData(); }
    }
  }
  if (target.classList.contains('product-location')) {
    if (target.closest('.favorite-item')) {
      const item = favoriteProducts.find(p => p.id === id);
      if (item) { item.locationId = target.value ? Number(target.value) : null; saveData(); }
    } else if (target.closest('.default-item')) {
      const item = defaultProducts.find(p => p.id === id);
      if (item) { item.locationId = target.value ? Number(target.value) : null; saveData(); }
    }
  }
});

if (addProductBtn) {
  addProductBtn.addEventListener('click', (e) => {
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
    addProductModal.style.display = 'none';
    document.getElementById('add-product-form').reset();
    document.getElementById('product-default').checked = true;
    showAlert('Producto añadido a la lista!', false, null, 'info');
  });
}

if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    showAlert('¿Seguro que quieres borrar la lista actual?', true, () => {
      shoppingList = [];
      renderShoppingList();
    }, 'error');
  });
}

if (loadFavoritesBtn) {
  loadFavoritesBtn.addEventListener('click', () => {
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
  });
}

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
        showAlert('Lista copiada al portapapeles!', false, null, 'info');
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
      showAlert('Lista copiada!', false, null, 'info');
    } else {
      showAlert('No se pudo copiar.', false, null, 'warning');
    }
  } catch (err) {
    showAlert('Tu navegador no permite copiar.', false, null, 'error');
  }
  document.body.removeChild(textArea);
}

const openHelpBtn = document.getElementById('open-help-btn');
const closeHelpBtn = document.getElementById('close-help-btn');
const closeHelpModalBtn = document.getElementById('close-help-modal-btn');
const helpModal = document.getElementById('help-modal');

if (openHelpBtn) openHelpBtn.addEventListener('click', () => helpModal.style.display = 'block');
[closeHelpBtn, closeHelpModalBtn].forEach(btn => {
  if (btn) btn.addEventListener('click', () => helpModal.style.display = 'none');
});

const style = document.createElement('style');
style.textContent = `
  .custom-alert {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(0,0,0,0.5); display: flex;
    justify-content: center; align-items: center; z-index: 10000;
  }
  .alert-content {
    background: white; padding: 20px; border-radius: 8px;
    text-align: center; min-width: 250px;
  }
  .alert-title {
    margin-bottom: 10px;
  }
  .alert-content p {
    margin-bottom: 15px;
  }
  .alert-buttons {
    display: flex; gap: 10px; justify-content: center;
  }
  .alert-ok, .alert-cancel, .alert-confirm {
    background-color: #4CAF50; color: white; border: none;
    padding: 8px 16px; border-radius: 4px; cursor: pointer;
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

renderCategories();
renderLocations();
renderShoppingList();
renderFavoritesList();
renderDefaultsList();
