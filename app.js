// DOM Elements
const productForm = document.getElementById('add-product-form');
const shoppingListEl = document.getElementById('shopping-list');
const clearBtn = document.getElementById('clear-list');
const loadFavoritesBtn = document.getElementById('load-favorites');
const categoryForm = document.getElementById('add-category-form');
const locationForm = document.getElementById('add-location-form');
const categoriesListEl = document.getElementById('categories-list');
const locationsListEl = document.getElementById('locations-list');
const categorySelect = document.getElementById('product-category-select');
const locationSelect = document.getElementById('product-location-select');
const openConfigBtn = document.getElementById('open-config-btn');
const closeConfigBtn = document.getElementById('close-config-btn');
const closeConfigModalBtn = document.getElementById('close-config-modal-btn');
const modal = document.getElementById('config-modal');

// Load data
let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];
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

function renderShoppingList() {
  shoppingListEl.innerHTML = '';
  shoppingList.forEach((item, index) => {
    const categoryName = categories.find(c => c.id === item.categoryId)?.name || 'Sin categoría';
    const locationName = locations.find(l => l.id === item.locationId)?.name || 'Sin ubicación';
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="product-info">
        <h3>${item.name}${item.favorite ? ' ⭐' : ''}</h3>
        <div class="category">${categoryName}</div>
        <div class="location">${locationName}</div>
      </div>
      <div class="actions">
        <input type="checkbox" class="bought" ${item.bought ? 'checked' : ''} data-index="${index}">
        <button type="button" class="delete-btn" data-index="${index}">🗑️</button>
      </div>
    `;
    shoppingListEl.appendChild(li);
  });
  saveData();
}

// Drag & Drop genérico
function setupDragAndDrop(listEl, items, updateArray) {
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
      
      const newOrder = Array.from(listEl.children).map(el => {
        const id = Number(el.dataset.id);
        return items.find(item => item.id === id);
      }).filter(Boolean);
      
      updateArray(newOrder);
      renderShoppingList();
    }
  }

  function handleDragEnd() {
    this.classList.remove('dragging');
  }

  const elements = listEl.querySelectorAll('.category-item, .location-item');
  elements.forEach(item => {
    item.addEventListener('dragstart', handleDragStart, false);
    item.addEventListener('dragover', handleDragOver, false);
    item.addEventListener('drop', handleDrop, false);
    item.addEventListener('dragend', handleDragEnd, false);
  });
}

// Modal controls
if (openConfigBtn) {
  openConfigBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    setTimeout(() => {
      setupDragAndDrop(categoriesListEl, categories, (newCategories) => {
        categories = newCategories;
        renderCategories();
        saveData();
      });
      setupDragAndDrop(locationsListEl, locations, (newLocations) => {
        locations = newLocations;
        renderLocations();
        saveData();
      });
    }, 100);
  });
}

if (closeConfigBtn) {
  closeConfigBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

if (closeConfigModalBtn) {
  closeConfigModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

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

// Editar/eliminar categorías
if (categoriesListEl) {
  categoriesListEl.addEventListener('click', (e) => {
    const id = Number(e.target.dataset.id);
    if (!id) return;

    if (e.target.classList.contains('delete-category')) {
      const hasProducts = shoppingList.some(p => p.categoryId === id);
      if (hasProducts) {
        alert('No se puede eliminar: hay productos en esta categoría.');
        return;
      }
      categories = categories.filter(c => c.id !== id);
      renderCategories();
      renderShoppingList();
      saveData();
    } else if (e.target.classList.contains('save-category')) {
      const input = e.target.previousElementSibling;
      const newName = input.value.trim();
      if (newName) {
        const cat = categories.find(c => c.id === id);
        if (cat) cat.name = newName;
        renderCategories();
        saveData();
      }
    }
  });
}

// Editar/eliminar ubicaciones
if (locationsListEl) {
  locationsListEl.addEventListener('click', (e) => {
    const id = Number(e.target.dataset.id);
    if (!id) return;

    if (e.target.classList.contains('delete-location')) {
      const hasProducts = shoppingList.some(p => p.locationId === id);
      if (hasProducts) {
        alert('No se puede eliminar: hay productos en esta ubicación.');
        return;
      }
      locations = locations.filter(l => l.id !== id);
      renderLocations();
      renderShoppingList();
      saveData();
    } else if (e.target.classList.contains('save-location')) {
      const input = e.target.previousElementSibling;
      const newName = input.value.trim();
      if (newName) {
        const loc = locations.find(l => l.id === id);
        if (loc) loc.name = newName;
        renderLocations();
        saveData();
      }
    }
  });
}

// Añadir producto
if (productForm) {
  productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('product-name');
    const name = nameInput.value.trim();
    const favorite = document.getElementById('product-favorite').checked;
    const categoryId = categorySelect.value ? Number(categorySelect.value) : null;
    const locationId = locationSelect.value ? Number(locationSelect.value) : null;
    
    if (!name) return;

    shoppingList.push({ name, categoryId, locationId, favorite, bought: false });
    renderShoppingList();
    
    productForm.reset();
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

// Botones de control
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    if (confirm('¿Seguro que quieres borrar toda la lista?')) {
      shoppingList = [];
      renderShoppingList();
    }
  });
}

if (loadFavoritesBtn) {
  loadFavoritesBtn.addEventListener('click', () => {
    const favorites = shoppingList.filter(item => item.favorite);
    if (favorites.length === 0) {
      alert('No hay productos marcados como favoritos.');
      return;
    }
    const newItems = favorites.map(fav => ({ ...fav, bought: false }));
    shoppingList.push(...newItems);
    renderShoppingList();
  });
}

// Inicializar
renderCategories();
renderLocations();
renderShoppingList();
