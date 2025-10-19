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
  
  // Re-vincular drag & drop después de renderizar
  if (configModal.style.display === 'block') {
    setTimeout(setupCategoryDragAndDrop, 100);
  }
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
  
  // Re-vincular drag & drop después de renderizar
  if (configModal.style.display === 'block') {
    setTimeout(setupLocationDragAndDrop, 100);
  }
}

function renderProductItem(item, index) {
  const categoryName = categories.find(c => c.id === item.categoryId)?.name || 'Sin categoría';
  const locationName = locations.find(l => l.id === item.locationId)?.name || 'Sin ubicación';
  
  // Verificar si el producto está en favoritos o predeterminados
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
      <button type="button" class="delete-btn" data-index="${index}">🗑️</button>
    </div>
  `;
  return li;
}

function renderShoppingList() {
  shoppingListEl.innerHTML = '';
  shoppingList.forEach((item, index) => {
    const li = renderProductItem(item, index);
    shoppingListEl.appendChild(li);
  });
  saveData();
}

function renderFavoritesList() {
  favoritesListEl.innerHTML = '';
  
  favoriteProducts.forEach((item) => {
    const categoryName = categories.find(c => c.id === item.categoryId)?.name || 'Sin categoría';
    const locationName = locations.find(l => l.id === item.locationId)?.name || 'Sin ubicación';
    
    const div = document.createElement('div');
    div.className = 'favorite-item';
    div.dataset.id = item.id;
    div.innerHTML = `
      <div class="product-edit">
        <input type="text" value="${item.name}" data-id="${item.id}" class="product-name" />
        <select class="product-category" data-id="${item.id}">
          <option value="">-- Categoría --</option>
          ${categories.map(cat => `<option value="${cat.id}" ${cat.id === item.categoryId ? 'selected' : ''}>${cat.name}</option>`).join('')}
        </select>
        <select class="product-location" data-id="${item.id}">
          <option value="">-- Ubicación --</option>
          ${locations.map(loc => `<option value="${loc.id}" ${loc.id === item.locationId ? 'selected' : ''}>${loc.name}</option>`).join('')}
        </select>
      </div>
      <div class="favorite-actions">
        <button type="button" class="add-to-list" data-id="${item.id}">➕ Añadir</button>
        <button type="button" class="save-favorite" data-id="${item.id}">💾</button>
        <button type="button" class="delete-favorite" data-id="${item.id}">🗑️</button>
      </div>
    `;
    favoritesListEl.appendChild(div);
  });
}

function renderDefaultsList() {
  defaultsListEl.innerHTML = '';
  
  defaultProducts.forEach((item) => {
    const categoryName = categories.find(c => c.id === item.categoryId)?.name || 'Sin categoría';
    const locationName = locations.find(l => l.id === item.locationId)?.name || 'Sin ubicación';
    
    const div = document.createElement('div');
    div.className = 'default-item';
    div.dataset.id = item.id;
    div.innerHTML = `
      <div class="product-edit">
        <input type="text" value="${item.name}" data-id="${item.id}" class="product-name" />
        <select class="product-category" data-id="${item.id}">
          <option value="">-- Categoría --</option>
          ${categories.map(cat => `<option value="${cat.id}" ${cat.id === item.categoryId ? 'selected' : ''}>${cat.name}</option>`).join('')}
        </select>
        <select class="product-location" data-id="${item.id}">
          <option value="">-- Ubicación --</option>
          ${locations.map(loc => `<option value="${loc.id}" ${loc.id === item.locationId ? 'selected' : ''}>${loc.name}</option>`).join('')}
        </select>
      </div>
      <div class="default-actions">
        <button type="button" class="add-to-list" data-id="${item.id}">➕ Añadir</button>
        <button type="button" class="save-default" data-id="${item.id}">💾</button>
        <button type="button" class="delete-default" data-id="${item.id}">🗑️</button>
      </div>
    `;
    defaultsListEl.appendChild(div);
  });
}

// Drag & Drop para categorías y ubicaciones
function setupCategoryDragAndDrop() {
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
      const srcId = Number(dragSrcEl.dataset.id);
      const targetId = Number(this.dataset.id);

      const srcIndex = categories.findIndex(c => c.id === srcId);
      const targetIndex = categories.findIndex(c => c.id === targetId);

      if (srcIndex !== -1 && targetIndex !== -1) {
        const [movedItem] = categories.splice(srcIndex, 1);
        categories.splice(targetIndex, 0, movedItem);
        renderCategories();
        renderShoppingList();
        saveData();
      }
    }
    
    this.classList.remove('drag-over');
  }

  function handleDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.category-item').forEach(item => {
      item.classList.remove('drag-over');
    });
  }

  const items = document.querySelectorAll('.category-item');
  items.forEach(item => {
    item.addEventListener('dragstart', handleDragStart, false);
    item.addEventListener('dragover', handleDragOver, false);
    item.addEventListener('dragenter', handleDragEnter, false);
    item.addEventListener('dragleave', handleDragLeave, false);
    item.addEventListener('drop', handleDrop, false);
    item.addEventListener('dragend', handleDragEnd, false);
  });
}

function setupLocationDragAndDrop() {
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
      const srcId = Number(dragSrcEl.dataset.id);
      const targetId = Number(this.dataset.id);

      const srcIndex = locations.findIndex(l => l.id === srcId);
      const targetIndex = locations.findIndex(l => l.id === targetId);

      if (srcIndex !== -1 && targetIndex !== -1) {
        const [movedItem] = locations.splice(srcIndex, 1);
        locations.splice(targetIndex, 0, movedItem);
        renderLocations();
        renderShoppingList();
        saveData();
      }
    }
    
    this.classList.remove('drag-over');
  }

  function handleDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.location-item').forEach(item => {
      item.classList.remove('drag-over');
    });
  }

  const items = document.querySelectorAll('.location-item');
  items.forEach(item => {
    item.addEventListener('dragstart', handleDragStart, false);
    item.addEventListener('dragover', handleDragOver, false);
    item.addEventListener('dragenter', handleDragEnter, false);
    item.addEventListener('dragleave', handleDragLeave, false);
    item.addEventListener('drop', handleDrop, false);
    item.addEventListener('dragend', handleDragEnd, false);
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
    openModal(favoritesModal, renderFavoritesList, null);
  });
}

if (openDefaultsBtn) {
  openDefaultsBtn.addEventListener('click', () => {
    openModal(defaultsModal, renderDefaultsList, null);
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
      setupCategoryDragAndDrop();
      setupLocationDragAndDrop();
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
      alert('La categoría ya existe.');
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
      alert('La ubicación ya existe.');
      return;
    }

    locations.push({ id: Date.now(), name });
    renderLocations();
    saveData();
    input.value = '';
  });
}

// DELEGACIÓN DE EVENTOS CORREGIDA
document.addEventListener('click', (e) => {
  // Categorías
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
    const hasProducts = [...shoppingList, ...favoriteProducts, ...defaultProducts].some(p => p.categoryId === id);
    if (hasProducts) {
      alert('No se puede eliminar: hay productos en esta categoría.');
      return;
    }
    categories = categories.filter(c => c.id !== id);
    renderCategories();
    renderShoppingList();
    renderFavoritesList();
    renderDefaultsList();
    saveData();
  }
  
  // Ubicaciones
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
    const hasProducts = [...shoppingList, ...favoriteProducts, ...defaultProducts].some(p => p.locationId === id);
    if (hasProducts) {
      alert('No se puede eliminar: hay productos en esta ubicación.');
      return;
    }
    locations = locations.filter(l => l.id !== id);
    renderLocations();
    renderShoppingList();
    renderFavoritesList();
    renderDefaultsList();
    saveData();
  }
  
  // Favoritos - Guardar nombre
  if (e.target.classList.contains('save-favorite')) {
    const id = Number(e.target.dataset.id);
    const item = favoriteProducts.find(p => p.id === id);
    if (item) {
      const input = e.target.closest('.favorite-item').querySelector('.product-name');
      const newName = input.value.trim();
      if (newName) {
        item.name = newName;
        renderFavoritesList();
        renderShoppingList();
        saveData();
      }
    }
  }
  
  // Favoritos - Eliminar
  if (e.target.classList.contains('delete-favorite')) {
    const id = Number(e.target.dataset.id);
    favoriteProducts = favoriteProducts.filter(p => p.id !== id);
    renderFavoritesList();
    renderShoppingList();
    saveData();
  }
  
  // Favoritos - Añadir a lista
  if (e.target.classList.contains('add-to-list')) {
    const id = Number(e.target.dataset.id);
    const itemToAdd = favoriteProducts.find(p => p.id === id);
    if (itemToAdd) {
      // Añadir SIEMPRE (sin verificar duplicados complejos)
      const newItem = { ...itemToAdd, id: generateId(), bought: false };
      shoppingList.push(newItem);
      renderShoppingList();
      alert('Producto añadido a la lista!');
    }
  }
  
  // Predeterminados - Guardar nombre
  if (e.target.classList.contains('save-default')) {
    const id = Number(e.target.dataset.id);
    const item = defaultProducts.find(p => p.id === id);
    if (item) {
      const input = e.target.closest('.default-item').querySelector('.product-name');
      const newName = input.value.trim();
      if (newName) {
        item.name = newName;
        renderDefaultsList();
        renderShoppingList();
        saveData();
      }
    }
  }
  
  // Predeterminados - Eliminar
  if (e.target.classList.contains('delete-default')) {
    const id = Number(e.target.dataset.id);
    defaultProducts = defaultProducts.filter(p => p.id !== id);
    renderDefaultsList();
    renderShoppingList();
    saveData();
  }
  
  // Predeterminados - Añadir a lista
  if (e.target.classList.contains('add-to-list')) {
    const id = Number(e.target.dataset.id);
    const itemToAdd = defaultProducts.find(p => p.id === id);
    if (itemToAdd) {
      // Añadir SIEMPRE (sin verificar duplicados complejos)
      const newItem = { ...itemToAdd, id: generateId(), bought: false };
      shoppingList.push(newItem);
      renderShoppingList();
      alert('Producto añadido a la lista!');
    }
  }
});

// Eventos para selects en modales
document.addEventListener('change', (e) => {
  // Favoritos
  if (e.target.classList.contains('product-category') && e.target.closest('.favorite-item')) {
    const id = Number(e.target.dataset.id);
    const item = favoriteProducts.find(p => p.id === id);
    if (item) {
      item.categoryId = e.target.value ? Number(e.target.value) : null;
      saveData();
    }
  }
  
  if (e.target.classList.contains('product-location') && e.target.closest('.favorite-item')) {
    const id = Number(e.target.dataset.id);
    const item = favoriteProducts.find(p => p.id === id);
    if (item) {
      item.locationId = e.target.value ? Number(e.target.value) : null;
      saveData();
    }
  }
  
  // Predeterminados
  if (e.target.classList.contains('product-category') && e.target.closest('.default-item')) {
    const id = Number(e.target.dataset.id);
    const item = defaultProducts.find(p => p.id === id);
    if (item) {
      item.categoryId = e.target.value ? Number(e.target.value) : null;
      saveData();
    }
  }
  
  if (e.target.classList.contains('product-location') && e.target.closest('.default-item')) {
    const id = Number(e.target.dataset.id);
    const item = defaultProducts.find(p => p.id === id);
    if (item) {
      item.locationId = e.target.value ? Number(e.target.value) : null;
      saveData();
    }
  }
});

// Añadir producto
const addProductBtn = document.getElementById('add-product-btn');

if (addProductBtn) {
  addProductBtn.addEventListener('click', () => {
    const nameInput = document.getElementById('product-name');
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      return;
    }
    
    const favorite = document.getElementById('product-favorite').checked;
    const isDefault = document.getElementById('product-default').checked;
    const categoryId = categorySelect.value ? Number(categorySelect.value) : null;
    const locationId = locationSelect.value ? Number(locationSelect.value) : null;

    const newItem = { 
      id: generateId(), 
      name, 
      categoryId, 
      locationId, 
      bought: false 
    };
    
    shoppingList.push(newItem);
    
    const productKey = `${name}-${categoryId || ''}-${locationId || ''}`;
    
    if (favorite) {
      const exists = favoriteProducts.some(p => {
        const key = `${p.name}-${p.categoryId || ''}-${p.locationId || ''}`;
        return key === productKey;
      });
      if (!exists) {
        favoriteProducts.push({...newItem, id: generateId()});
      }
    } else {
      favoriteProducts = favoriteProducts.filter(p => {
        const key = `${p.name}-${p.categoryId || ''}-${p.locationId || ''}`;
        return key !== productKey;
      });
    }
    
    if (isDefault) {
      const exists = defaultProducts.some(p => {
        const key = `${p.name}-${p.categoryId || ''}-${p.locationId || ''}`;
        return key === productKey;
      });
      if (!exists) {
        defaultProducts.push({...newItem, id: generateId()});
      }
    } else {
      defaultProducts = defaultProducts.filter(p => {
        const key = `${p.name}-${p.categoryId || ''}-${p.locationId || ''}`;
        return key !== productKey;
      });
    }
    
    renderShoppingList();
    renderFavoritesList();
    renderDefaultsList();
    
    document.getElementById('add-product-form').reset();
    document.getElementById('product-default').checked = true;
  });
}

// Toggle comprado o eliminar
if (shoppingListEl) {
  shoppingListEl.addEventListener('click', (e) => {
    const index = e.target.dataset.index;
    if (index === undefined) return;

    if (e.target.classList.contains('bought')) {
      shoppingList[index].bought = e.target.checked;
      saveData();
    } else if (e.target.classList.contains('delete-btn')) {
      shoppingList.splice(index, 1);
      renderShoppingList();
    }
  });
}

// Botón de limpiar
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    if (confirm('¿Seguro que quieres borrar la lista actual?')) {
      shoppingList = [];
      renderShoppingList();
    }
  });
}

// Cargar Favoritos
if (loadFavoritesBtn) {
  loadFavoritesBtn.addEventListener('click', () => {
    if (favoriteProducts.length === 0) {
      alert('No hay productos marcados como favoritos.');
      return;
    }
    
    const newItems = favoriteProducts.map(fav => ({ ...fav, id: generateId(), bought: false }));
    shoppingList.push(...newItems);
    renderShoppingList();
  });
}

// Copiar lista al portapapeles
if (copyListBtn) {
  copyListBtn.addEventListener('click', () => {
    if (shoppingList.length === 0) {
      alert('La lista está vacía.');
      return;
    }
    
    const pendingItems = shoppingList.filter(item => !item.bought);
    if (pendingItems.length === 0) {
      alert('No hay productos pendientes en la lista.');
      return;
    }
    
    const listText = pendingItems.map((item, index) => {
      const categoryName = categories.find(c => c.id === item.categoryId)?.name || 'Sin categoría';
      const locationName = locations.find(l => l.id === item.locationId)?.name || 'Sin ubicación';
      
      const isFavorite = favoriteProducts.some(p => 
        p.name === item.name && p.categoryId === item.categoryId && p.locationId === item.locationId
      );
      const isDefault = defaultProducts.some(p => 
        p.name === item.name && p.categoryId === item.categoryId && p.locationId === item.locationId
      );
      
      const prefix = isFavorite ? '⭐ ' : isDefault ? '📌 ' : '';
      return `${index + 1}. ${prefix}${item.name} [${categoryName} - ${locationName}]`;
    }).join('\n');
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(listText).then(() => {
        alert('Lista copiada al portapapeles!');
      }).catch(() => {
        fallbackCopyTextToClipboard(listText);
      });
    } else {
      fallbackCopyTextToClipboard(listText);
    }
  });
}

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  textArea.style.top = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    const msg = successful ? 'Lista copiada al portapapeles!' : 'Error al copiar.';
    alert(msg);
  } catch (err) {
    alert('Tu navegador no permite copiar al portapapeles.');
  }
  
  document.body.removeChild(textArea);
}

// Inicializar
renderCategories();
renderLocations();
renderShoppingList();
renderFavoritesList();
renderDefaultsList();
