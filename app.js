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

// Función de alerta personalizada
function showAlert(message, options = {}) {
  const { type = 'info', isConfirm = false, onConfirm = null } = options;
  const titles = { error: 'Atención:', success: 'Información:', warning: 'Información:' };
  const colors = { error: '#d32f2f', success: '#2e7d32', warning: '#f57c00' };
  const titleText = titles[type] || 'Información:';
  const titleColor = colors[type] || '#2e7d32';

  const alertDiv = document.createElement('div');
  alertDiv.className = 'custom-alert';
  alertDiv.innerHTML = isConfirm ? `
    <div class="alert-content">
      <h3 class="alert-title" style="color: ${titleColor};">${titleText}</h3>
      <p>${message}</p>
      <div class="alert-buttons">
        <button class="alert-cancel">Cancelar</button>
        <button class="alert-confirm">Aceptar</button>
      </div>
    </div>
  ` : `
    <div class="alert-content">
      <h3 class="alert-title" style="color: ${titleColor};">${titleText}</h3>
      <p>${message}</p>
      <button class="alert-ok">OK</button>
    </div>
  `;

  const cancelBtn = alertDiv.querySelector('.alert-cancel');
  const confirmBtn = alertDiv.querySelector('.alert-confirm');
  const okBtn = alertDiv.querySelector('.alert-ok');

  if (cancelBtn) cancelBtn.addEventListener('click', () => document.body.removeChild(alertDiv));
  if (confirmBtn) confirmBtn.addEventListener('click', () => { document.body.removeChild(alertDiv); if (onConfirm) onConfirm(); });
  if (okBtn) okBtn.addEventListener('click', () => document.body.removeChild(alertDiv));

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
  const isFavorite = favoriteProducts.some(p => p.name === item.name && p.categoryId === item.categoryId && p.locationId === item.locationId);
  const isDefault = defaultProducts.some(p => p.name === item.name && p.categoryId === item.categoryId && p.locationId === item.locationId);
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
  initDragAndDrop(shoppingListEl, 'li', shoppingList, renderShoppingList);
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
  initDragAndDrop(favoritesListEl, '.favorite-item', favoriteProducts, renderFavoritesList);
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
  initDragAndDrop(defaultsListEl, '.default-item', defaultProducts, renderDefaultsList);
}

// Drag & Drop simple y confiable
function initDragAndDrop(container, itemSelector, dataArray, renderFn) {
  let dragSrcEl = null;

  const items = container.querySelectorAll(itemSelector);
  items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      dragSrcEl = item;
      e.dataTransfer.effectAllowed = 'move';
      item.classList.add('dragging');
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    item.addEventListener('dragenter', (e) => {
      e.preventDefault();
      item.classList.add('drag-over');
    });

    item.addEventListener('dragleave', () => {
      item.classList.remove('drag-over');
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      if (dragSrcEl !== item) {
        const srcIndex = Array.from(container.children).indexOf(dragSrcEl);
        const targetIndex = Array.from(container.children).indexOf(item);
        if (srcIndex !== -1 && targetIndex !== -1) {
          const [moved] = dataArray.splice(srcIndex, 1);
          dataArray.splice(targetIndex, 0, moved);
          renderFn();
        }
      }
    });

    item.addEventListener('dragend', () => {
      items.forEach(el => {
        el.classList.remove('dragging', 'drag-over');
      });
    });
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

// Event listeners para modales
if (openFavoritesBtn) {
  openFavoritesBtn.addEventListener('click', () => openModal(favoritesModal, renderFavoritesList));
}

if (openDefaultsBtn) {
  openDefaultsBtn.addEventListener('click', () => openModal(defaultsModal, renderDefaultsList));
}

if (openConfigBtn) {
  openConfigBtn.addEventListener('click', () => {
    openModal(configModal, () => {
      renderCategories();
      renderLocations();
      initDragAndDrop(categoriesListEl, '.category-item', categories, renderCategories);
      initDragAndDrop(locationsListEl, '.location-item', locations, renderLocations);
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
  if (btn) btn.addEventListener('click', () => closeModal(modal));
});

window.addEventListener('click', (e) => {
  if (e.target === configModal) closeModal(configModal);
  if (e.target === favoritesModal) closeModal(favoritesModal);
  if (e.target === defaultsModal) closeModal(defaultsModal);
});

// Añadir categoría
if (categoryForm) {
  categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('new-category');
    const name = input.value.trim();
    if (!name) return;
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
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
    if (locations.some(l => l.name.toLowerCase() === name.toLowerCase())) {
      showAlert('La ubicación ya existe.', { type: 'warning' });
      return;
    }
    locations.push({ id: Date.now(), name });
    renderLocations();
    saveData();
    input.value = '';
  });
  }

// Historial de deshacer
let undoStack = [];

// Crear botón de deshacer al inicio
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('undo-btn')) {
    const btn = document.createElement('button');
    btn.id = 'undo-btn';
    btn.className = 'undo-btn';
    btn.textContent = '↺ Deshacer';
    btn.style.display = 'none';
    document.body.appendChild(btn);
    btn.addEventListener('click', () => {
      if (undoStack.length > 0) {
        shoppingList = undoStack.pop();
        renderShoppingList();
        btn.style.display = 'none';
        showAlert('Producto restaurado.', { type: 'success' });
      }
    });
  }
});

// Mostrar botón de deshacer
function showUndoButton() {
  const btn = document.getElementById('undo-btn');
  if (btn) {
    btn.style.display = 'block';
    setTimeout(() => { if (btn.style.display !== 'none') btn.style.display = 'none'; }, 5000);
  }
}

// Listener de eliminación (único y global)
document.addEventListener('click', (e) => {
  // Deshacer
  if (e.target.id === 'undo-btn') return; // ya manejado

  // Eliminar producto
  if (e.target.classList.contains('delete-btn') && e.target.closest('#shopping-list')) {
    const index = e.target.dataset.index;
    if (index !== undefined) {
      undoStack.push([...shoppingList]);
      shoppingList.splice(index, 1);
      renderShoppingList();
      showUndoButton();
      return;
    }
  }

  // Toggle comprado
  if (e.target.classList.contains('bought') && e.target.closest('#shopping-list')) {
    const index = e.target.dataset.index;
    if (index !== undefined) {
      shoppingList[index].bought = e.target.checked;
      saveData();
      return;
    }
  }

  // Favoritos - Añadir
  if (e.target.classList.contains('add-to-list') && e.target.dataset.type === 'favorite') {
    const index = Number(e.target.dataset.index);
    if (index >= 0 && index < favoriteProducts.length) {
      const item = favoriteProducts[index];
      if (shoppingList.some(p => p.name === item.name)) {
        showAlert('Este producto ya está en la lista.', { type: 'warning' });
        return;
      }
      shoppingList.push({ ...item, id: generateId(), bought: false });
      renderShoppingList();
      showAlert('Producto añadido a la lista!', { type: 'success' });
    }
    return;
  }

  // Predeterminados - Añadir
  if (e.target.classList.contains('add-to-list') && e.target.dataset.type === 'default') {
    const index = Number(e.target.dataset.index);
    if (index >= 0 && index < defaultProducts.length) {
      const item = defaultProducts[index];
      if (shoppingList.some(p => p.name === item.name)) {
        showAlert('Este producto ya está en la lista.', { type: 'warning' });
        return;
      }
      shoppingList.push({ ...item, id: generateId(), bought: false });
      renderShoppingList();
      showAlert('Producto añadido a la lista!', { type: 'success' });
    }
    return;
  }

  // Guardar/eliminar en modales
  if (e.target.classList.contains('save-category')) {
    const id = Number(e.target.dataset.id);
    const input = e.target.closest('.category-item').querySelector('input');
    const name = input.value.trim();
    if (name) {
      const cat = categories.find(c => c.id === id);
      if (cat) { cat.name = name; renderCategories(); renderShoppingList(); renderFavoritesList(); renderDefaultsList(); saveData(); }
    }
  }

  if (e.target.classList.contains('delete-category')) {
    const id = Number(e.target.dataset.id);
    if ([...shoppingList, ...favoriteProducts, ...defaultProducts].some(p => p.categoryId === id)) {
      showAlert('No se puede eliminar: hay productos en esta categoría.', { type: 'warning' });
    } else {
      categories = categories.filter(c => c.id !== id);
      renderCategories(); renderShoppingList(); renderFavoritesList(); renderDefaultsList(); saveData();
    }
  }

  if (e.target.classList.contains('save-location')) {
    const id = Number(e.target.dataset.id);
    const input = e.target.closest('.location-item').querySelector('input');
    const name = input.value.trim();
    if (name) {
      const loc = locations.find(l => l.id === id);
      if (loc) { loc.name = name; renderLocations(); renderShoppingList(); renderFavoritesList(); renderDefaultsList(); saveData(); }
    }
  }

  if (e.target.classList.contains('delete-location')) {
    const id = Number(e.target.dataset.id);
    if ([...shoppingList, ...favoriteProducts, ...defaultProducts].some(p => p.locationId === id)) {
      showAlert('No se puede eliminar: hay productos en esta ubicación.', { type: 'warning' });
    } else {
      locations = locations.filter(l => l.id !== id);
      renderLocations(); renderShoppingList(); renderFavoritesList(); renderDefaultsList(); saveData();
    }
  }

  if (e.target.classList.contains('save-favorite')) {
    const index = Number(e.target.dataset.index);
    if (index >= 0 && index < favoriteProducts.length) {
      const input = e.target.closest('.favorite-item').querySelector('.product-name');
      const name = input.value.trim();
      if (name) { favoriteProducts[index].name = name; renderFavoritesList(); renderShoppingList(); saveData(); }
    }
  }

  if (e.target.classList.contains('delete-favorite')) {
    const index = Number(e.target.dataset.index);
    if (index >= 0 && index < favoriteProducts.length) {
      favoriteProducts.splice(index, 1);
      renderFavoritesList(); renderShoppingList(); saveData();
    }
  }

  if (e.target.classList.contains('save-default')) {
    const index = Number(e.target.dataset.index);
    if (index >= 0 && index < defaultProducts.length) {
      const input = e.target.closest('.default-item').querySelector('.product-name');
      const name = input.value.trim();
      if (name) { defaultProducts[index].name = name; renderDefaultsList(); renderShoppingList(); saveData(); }
    }
  }

  if (e.target.classList.contains('delete-default')) {
    const index = Number(e.target.dataset.index);
    if (index >= 0 && index < defaultProducts.length) {
      defaultProducts.splice(index, 1);
      renderDefaultsList(); renderShoppingList(); saveData();
    }
  }
});

// Eventos para selects en modales
document.addEventListener('change', (e) => {
  const updateList = (list, index, prop, value) => {
    if (index >= 0 && index < list.length) {
      list[index][prop] = value ? Number(value) : null;
      saveData();
    }
  };

  if (e.target.classList.contains('product-category')) {
    const index = Number(e.target.dataset.index);
    const value = e.target.value;
    if (e.target.closest('.favorite-item')) {
      updateList(favoriteProducts, index, 'categoryId', value);
    } else if (e.target.closest('.default-item')) {
      updateList(defaultProducts, index, 'categoryId', value);
    }
  }

  if (e.target.classList.contains('product-location')) {
    const index = Number(e.target.dataset.index);
    const value = e.target.value;
    if (e.target.closest('.favorite-item')) {
      updateList(favoriteProducts, index, 'locationId', value);
    } else if (e.target.closest('.default-item')) {
      updateList(defaultProducts, index, 'locationId', value);
    }
  }
});

// Añadir producto
if (document.getElementById('add-product-btn')) {
  document.getElementById('add-product-btn').addEventListener('click', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('product-name');
    const name = nameInput.value.trim();
    if (!name) return nameInput.focus();

    if (shoppingList.some(p => p.name === name)) {
      showAlert('Este producto ya está en la lista.', { type: 'warning' });
      return;
    }

    const isFav = document.getElementById('product-favorite').checked;
    const isDef = document.getElementById('product-default').checked;
    const catId = categorySelect.value ? Number(categorySelect.value) : null;
    const locId = locationSelect.value ? Number(locationSelect.value) : null;

    const newItem = { id: generateId(), name, categoryId: catId, locationId: locId, bought: false };
    shoppingList.push(newItem);

    if (isFav && !favoriteProducts.some(p => p.name === name)) {
      favoriteProducts.push({ ...newItem, id: generateId() });
    } else if (!isFav) {
      favoriteProducts = favoriteProducts.filter(p => p.name !== name);
    }

    if (isDef && !defaultProducts.some(p => p.name === name)) {
      defaultProducts.push({ ...newItem, id: generateId() });
    } else if (!isDef) {
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
    const toAdd = favoriteProducts.filter(fav => !shoppingList.some(p => p.name === fav.name));
    if (toAdd.length === 0) {
      showAlert('Los favoritos ya están en la lista.', { type: 'warning' });
      return;
    }
    shoppingList.push(...toAdd.map(fav => ({ ...fav, id: generateId(), bought: false })));
    renderShoppingList();
    showAlert('Favoritos cargados correctamente.', { type: 'success' });
  });
}

// Copiar lista
if (copyListBtn) {
  copyListBtn.addEventListener('click', () => {
    const pending = shoppingList.filter(p => !p.bought);
    if (pending.length === 0) {
      showAlert(shoppingList.length > 0 ? 'No hay productos pendientes.' : 'La lista está vacía.', { type: 'warning' });
      return;
    }
    const text = pending.map((p, i) => {
      const cat = categories.find(c => c.id === p.categoryId)?.name || 'Sin categoría';
      const loc = locations.find(l => l.id === p.locationId)?.name || 'Sin ubicación';
      const isFav = favoriteProducts.some(f => f.name === p.name && f.categoryId === p.categoryId && f.locationId === p.locationId);
      const isDef = defaultProducts.some(d => d.name === p.name && d.categoryId === p.categoryId && d.locationId === p.locationId);
      const prefix = isFav ? '⭐ ' : isDef ? '📌 ' : '';
      return `${i + 1}. ${prefix}${p.name} [${cat} - ${loc}]`;
    }).join('\n');

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showAlert('Lista copiada al portapapeles!', { type: 'success' });
      }).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  });
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed; left:-9999px; top:-9999px;';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy') ? 
      showAlert('Lista copiada!', { type: 'success' }) :
      showAlert('No se pudo copiar.', { type: 'warning' });
  } catch (err) {
    showAlert('Tu navegador no permite copiar.', { type: 'error' });
  }
  document.body.removeChild(ta);
}

// Modal de Ayuda
const helpBtn = document.getElementById('open-help-btn');
const helpModal = document.getElementById('help-modal');
if (helpBtn) helpBtn.addEventListener('click', () => helpModal.style.display = 'block');
['close-help-btn', 'close-help-modal-btn'].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) btn.addEventListener('click', () => helpModal.style.display = 'none');
});
window.addEventListener('click', (e) => {
  if (e.target === helpModal) helpModal.style.display = 'none';
});

// Estilos para alertas
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
  .alert-title { margin-bottom: 10px; }
  .alert-content p { margin-bottom: 15px; }
  .alert-buttons { display: flex; gap: 10px; justify-content: center; }
  .alert-ok, .alert-cancel, .alert-confirm {
    background-color: #4CAF50; color: white; border: none;
    padding: 8px 16px; border-radius: 4px; cursor: pointer;
  }
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
