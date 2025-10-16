// DOM Elements
const productForm = document.getElementById('add-product-form');
const shoppingListEl = document.getElementById('shopping-list');
const clearBtn = document.getElementById('clear-list');
const loadFavoritesBtn = document.getElementById('load-favorites');
const categoryForm = document.getElementById('add-category-form');
const categoriesListEl = document.getElementById('categories-list');
const categorySelect = document.getElementById('product-category-select');
const newCategoryInput = document.getElementById('product-category-new');
const openCategoriesBtn = document.getElementById('open-categories-btn');
const closeCategoriesBtn = document.getElementById('close-categories-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const modal = document.getElementById('categories-modal');

// Load data
let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [
  { id: Date.now(), name: 'Pescadería' },
  { id: Date.now() + 1, name: 'Frutería' },
  { id: Date.now() + 2, name: 'Carnicería' }
];

function saveData() {
  localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
  localStorage.setItem('categories', JSON.stringify(categories));
}

function renderCategories() {
  categoriesListEl.innerHTML = '';
  categorySelect.innerHTML = '<option value="">-- Selecciona categoría --</option>';
  
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
  saveData();
}

function renderShoppingList() {
  shoppingListEl.innerHTML = '';
  shoppingList.forEach((item, index) => {
    const categoryName = categories.find(c => c.id === item.categoryId)?.name || 'Sin categoría';
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="product-info">
        <h3>${item.name}${item.favorite ? ' ⭐' : ''}</h3>
        <div class="category">${categoryName}</div>
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

// Drag & Drop para categorías
let dragSrcEl = null;

function handleDragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
  this.classList.add('dragging');
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragEnter(e) {
  this.classList.add('over');
}

function handleDragLeave() {
  this.classList.remove('over');
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (dragSrcEl !== this) {
    const srcId = Number(dragSrcEl.dataset.id);
    const targetId = Number(this.dataset.id);

    const srcIndex = categories.findIndex(c => c.id === srcId);
    const targetIndex = categories.findIndex(c => c.id === targetId);

    if (srcIndex !== -1 && targetIndex !== -1) {
      // Reordenar array
      const [movedItem] = categories.splice(srcIndex, 1);
      categories.splice(targetIndex, 0, movedItem);
      renderCategories();
      renderShoppingList();
    }
  }

  this.classList.remove('over');
  return false;
}

function handleDragEnd() {
  this.classList.remove('dragging');
  document.querySelectorAll('.category-item').forEach(item => {
    item.classList.remove('over');
  });
}

function addDragEvents() {
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

// Modal controls
openCategoriesBtn.addEventListener('click', () => {
  modal.style.display = 'block';
  setTimeout(addDragEvents, 100); // Asegurar que los elementos existan
});

closeCategoriesBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

closeModalBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// Añadir categoría
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
  input.value = '';
});

// Editar/eliminar categorías
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
  } else if (e.target.classList.contains('save-category')) {
    const input = e.target.previousElementSibling;
    const newName = input.value.trim();
    if (newName) {
      const cat = categories.find(c => c.id === id);
      if (cat) cat.name = newName;
      renderCategories();
      renderShoppingList();
    }
  }
});

// Sincronizar select y campo nuevo
categorySelect.addEventListener('change', () => {
  if (categorySelect.value) {
    newCategoryInput.value = '';
    newCategoryInput.disabled = true;
  } else {
    newCategoryInput.disabled = false;
  }
});

newCategoryInput.addEventListener('input', () => {
  if (newCategoryInput.value) {
    categorySelect.value = '';
  }
});

// Añadir producto
productForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nameInput = document.getElementById('product-name');
  const name = nameInput.value.trim();
  const favorite = document.getElementById('product-favorite').checked;
  
  if (!name) return;

  let categoryId = null;
  const selectedCatId = categorySelect.value;
  const newCatName = newCategoryInput.value.trim();

  if (selectedCatId) {
    categoryId = Number(selectedCatId);
  } else if (newCatName) {
    const existing = categories.find(c => c.name.toLowerCase() === newCatName.toLowerCase());
    if (existing) {
      categoryId = existing.id;
    } else {
      const newCat = { id: Date.now(), name: newCatName };
      categories.push(newCat);
      categoryId = newCat.id;
      renderCategories();
    }
  }

  shoppingList.push({ name, categoryId, favorite, bought: false });
  renderShoppingList();
  
  productForm.reset();
  newCategoryInput.disabled = false;
  categorySelect.value = '';
});

// Toggle comprado o eliminar
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

// Botones de control
clearBtn.addEventListener('click', () => {
  if (confirm('¿Seguro que quieres borrar toda la lista?')) {
    shoppingList = [];
    renderShoppingList();
  }
});

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

// Inicializar
renderCategories();
renderShoppingList();
