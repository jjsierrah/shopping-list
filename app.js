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
  // Verificar si el producto está en las listas persistentes
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
  
  favoriteProducts.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'favorite-item';
    div.dataset.index = idx;
    div.draggable = true;
    div.innerHTML = `
      <input type="text" value="${item.name}" data-index="${idx}" />
      <div class="favorite-actions">
        <button type="button" class="save-favorite" data-index="${idx}">💾</button>
        <button type="button" class="delete-favorite" data-index="${idx}">🗑️</button>
      </div>
    `;
    favoritesListEl.appendChild(div);
  });
}

function renderDefaultsList() {
  defaultsListEl.innerHTML = '';
  
  defaultProducts.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'default-item';
    div.dataset.index = idx;
    div.draggable = true;
    div.innerHTML = `
      <input type="text" value="${item.name}" data-index="${idx}" />
      <div class="default-actions">
        <button type="button" class="save-default" data-index="${idx}">💾</button>
        <button type="button" class="delete-default" data-index="${idx}">🗑️</button>
      </div>
    `;
    defaultsListEl.appendChild(div);
  });
}

// Drag & Drop corregido - ahora se reconfigura correctamente
function setupDragAndDrop(listEl, itemClass, getItemFromElement, updateArray) {
  // Primero, eliminar eventos anteriores si existen
  const existingItems = listEl.querySelectorAll(itemClass);
  existingItems.forEach(item => {
    item.removeEventListener('dragstart', handleDragStart);
    item.removeEventListener('dragover', handleDragOver);
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
    
    const draggingOverEl = this;
    const draggingEl = dragSrcEl;
    
    if (draggingOverEl !== draggingEl) {
      const rect = draggingOverEl.getBoundingClientRect();
      const nextSibling = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
      
      draggingOverEl.parentNode.insertBefore(
        draggingEl,
        nextSibling ? draggingOverEl.nextSibling : draggingOverEl
      );
    }
  }

  function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    
    if (dragSrcEl) {
      dragSrcEl.classList.remove('dragging');
      
      const newOrder = Array.from(listEl.children).map(el => getItemFromElement(el));
      updateArray(newOrder.filter(Boolean));
      
      saveData();
      // Re-renderizar y reconfigurar drag & drop
      if (listEl === categoriesListEl) {
        renderCategories();
        renderShoppingList();
        setTimeout(() => setupCategoryDragAndDrop(), 100);
      } else if (listEl === locationsListEl) {
        renderLocations();
        renderShoppingList();
        setTimeout(() => setupLocationDragAndDrop(), 100);
      } else if (listEl === favoritesListEl) {
        renderFavoritesList();
        setTimeout(() => setupFavoritesDragAndDrop(), 100);
      } else if (listEl === defaultsListEl) {
        renderDefaultsList();
        setTimeout(() => setupDefaultsDragAndDrop(), 100);
      }
    }
  }

  function handleDragEnd() {
    this.classList.remove('dragging');
  }

  const elements = listEl.querySelectorAll(itemClass);
  elements.forEach(item => {
    item.addEventListener('dragstart', handleDragStart, false);
    item.addEventListener('dragover', handleDragOver, false);
    item.addEventListener('drop', handleDrop, false);
    item.addEventListener('dragend', handleDragEnd, false);
  });
}

function setupCategoryDragAndDrop() {
  setupDragAndDrop(
    categoriesListEl, 
    '.category-item',
    (el) => categories.find(cat => cat.id === Number(el.dataset.id)),
    (newCategories) => { categories = newCategories; }
  );
}

function setupLocationDragAndDrop() {
  setupDragAndDrop(
    locationsListEl, 
    '.location-item',
    (el) => locations.find(loc => loc.id === Number(el.dataset.id)),
    (newLocations) => { locations = newLocations; }
  );
}

function setupFavoritesDragAndDrop() {
  setupDragAndDrop(
    favoritesListEl, 
    '.favorite-item',
    (el) => favoriteProducts[Number(el.dataset.index)],
    (newFavorites) => { favoriteProducts = newFavorites; }
  );
}

function setupDefaultsDragAndDrop() {
  setupDragAndDrop(
    defaultsListEl, 
    '.default-item',
    (el) => defaultProducts[Number(el.dataset.index)],
    (newDefaults) => { defaultProducts = newDefaults; }
  );
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
    openModal(favoritesModal, renderFavoritesList, setupFavoritesDragAndDrop);
  });
}

if (openDefaultsBtn) {
  openDefaultsBtn.addEventListener('click', () => {
    openModal(defaultsModal, renderDefaultsList, setupDefaultsDragAndDrop);
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

// DELEGACIÓN DE EVENTOS - Solución definitiva para botones de guardar
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
        saveData();
        // Reconfigurar drag & drop
        if (configModal.style.display === 'block') {
          setTimeout(setupCategoryDragAndDrop, 100);
        }
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
    saveData();
    // Reconfigurar drag & drop
    if (configModal.style.display === 'block') {
      setTimeout(setupCategoryDragAndDrop, 100);
    }
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
        saveData();
        // Reconfigurar drag & drop
        if (configModal.style.display === 'block') {
          setTimeout(setupLocationDragAndDrop, 100);
        }
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
    saveData();
    // Reconfigurar drag & drop
    if (configModal.style.display === 'block') {
      setTimeout(setupLocationDragAndDrop, 100);
    }
  }
  
  // Favoritos
  if (e.target.classList.contains('save-favorite')) {
    const index = Number(e.target.dataset.index);
    if (index >= 0 && index < favoriteProducts.length) {
      const input = e.target.closest('.favorite-item').querySelector('input');
      const newName = input.value.trim();
      if (newName) {
        favoriteProducts[index].name = newName;
        renderFavoritesList();
        renderShoppingList();
        saveData();
        // Reconfigurar drag & drop
        if (favoritesModal.style.display === 'block') {
          setTimeout(setupFavoritesDragAndDrop, 100);
        }
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
      // Reconfigurar drag & drop
      if (favoritesModal.style.display === 'block') {
        setTimeout(setupFavoritesDragAndDrop, 100);
      }
    }
  }
  
  // Predeterminados
  if (e.target.classList.contains('save-default')) {
    const index = Number(e.target.dataset.index);
    if (index >= 0 && index < defaultProducts.length) {
      const input = e.target.closest('.default-item').querySelector('input');
      const newName = input.value.trim();
      if (newName) {
        defaultProducts[index].name = newName;
        renderDefaultsList();
        renderShoppingList();
        saveData();
        // Reconfigurar drag & drop
        if (defaultsModal.style.display === 'block') {
          setTimeout(setupDefaultsDragAndDrop, 100);
        }
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
      // Reconfigurar drag & drop
      if (defaultsModal.style.display === 'block') {
        setTimeout(setupDefaultsDragAndDrop, 100);
      }
    }
  }
});

// Añadir producto (con nuevo botón)
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

    const newItem = { name, categoryId, locationId, bought: false };
    
    shoppingList.push(newItem);
    
    const productKey = `${name}-${categoryId || ''}-${locationId || ''}`;
    
    if (favorite) {
      const exists = favoriteProducts.some(p => {
        const key = `${p.name}-${p.categoryId || ''}-${p.locationId || ''}`;
        return key === productKey;
      });
      if (!exists) {
        favoriteProducts.push({...newItem});
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
        defaultProducts.push({...newItem});
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
    
    // Resetear formulario
    document.getElementById('add-product-form').reset();
    document.getElementById('product-default').checked = true;
  });
}

// Toggle comprado o eliminar (solo en lista principal)
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

// Botón de limpiar (solo la lista principal)
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    if (confirm('¿Seguro que quieres borrar la lista actual?')) {
      shoppingList = [];
      renderShoppingList();
      // ¡favoriteProducts y defaultProducts permanecen intactos!
    }
  });
}

// Cargar Favoritos (solo si no hay favoritos en la lista actual)
if (loadFavoritesBtn) {
  loadFavoritesBtn.addEventListener('click', () => {
    if (favoriteProducts.length === 0) {
      alert('No hay productos marcados como favoritos.');
      return;
    }
    
    // Verificar si ALGÚN favorito ya está en la lista principal
    const anyFavoriteInList = favoriteProducts.some(fav => {
      return shoppingList.some(item => 
        item.name === fav.name && 
        item.categoryId === fav.categoryId && 
        item.locationId === fav.locationId
      );
    });
    
    if (anyFavoriteInList) {
      alert('Los favoritos ya están en la lista.');
      return;
    }
    
    // Añadir copias de favoritos a la lista principal (no comprados)
    const newItems = favoriteProducts.map(fav => ({ ...fav, bought: false }));
    shoppingList.push(...newItems);
    renderShoppingList();
  });
}

// Copiar lista al portapapeles
if (copyListBtn) {
  copyListBtn.addEventListener('click', async () => {
    if (shoppingList.length === 0) {
      alert('La lista está vacía.');
      return;
    }
    
    try {
      // Formatear la lista para copiar
      const listText = shoppingList
        .filter(item => !item.bought) // Solo productos no comprados
        .map((item, index) => {
          const categoryName = categories.find(c => c.id === item.categoryId)?.name || 'Sin categoría';
          const locationName = locations.find(l => l.id === item.locationId)?.name || 'Sin ubicación';
          const prefix = item.favorite ? '⭐ ' : item.isDefault ? '📌 ' : '';
          return `${index + 1}. ${prefix}${item.name} [${categoryName} - ${locationName}]`;
        })
        .join('\n');
      
      if (listText.trim() === '') {
        alert('No hay productos pendientes en la lista.');
        return;
      }
      
      // Copiar al portapapeles
      await navigator.clipboard.writeText(listText);
      alert('Lista copiada al portapapeles!');
    } catch (err) {
      // Fallback para navegadores antiguos
      const textArea = document.createElement('textarea');
      textArea.value = listText;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Lista copiada al portapapeles!');
      } catch (err) {
        alert('Error al copiar al portapapeles.');
      }
      document.body.removeChild(textArea);
    }
  });
}

// Inicializar
renderCategories();
renderLocations();
renderShoppingList();
renderFavoritesList();
renderDefaultsList();
