// DOM Elements
const productForm = document.getElementById('add-product-form');
const shoppingListEl = document.getElementById('shopping-list');
const clearBtn = document.getElementById('clear-list');
const loadFavoritesBtn = document.getElementById('load-favorites');
const categoryForm = document.getElementById('add-category-form');
const categoriesListEl = document.getElementById('categories-list');
const categorySelect = document.getElementById('product-category-select');
const newCategoryInput = document.getElementById('product-category-new');

// Load data
let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [
  { id: Date.now(), name: 'Pescadería' },
  { id: Date.now() + 1, name: 'Frutería' },
  { id: Date.now() + 2, name: 'Carnicería' }
];

// Save to localStorage
function saveData() {
  localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
  localStorage.setItem('categories', JSON.stringify(categories));
}

// Render categories
function renderCategories() {
  categoriesListEl.innerHTML = '';
  categorySelect.innerHTML = '<option value="">-- Selecciona categoría --</option>';
  
  categories.forEach(cat => {
    // Lista editable
    const div = document.createElement('div');
    div.className = 'category-item';
    div.innerHTML = `
      <input type="text" value="${cat.name}" data-id="${cat.id}" />
      <div class="category-actions">
        <button class="save-category" data-id="${cat.id}">💾</button>
        <button class="delete-category" data-id="${cat.id}">🗑️</button>
      </div>
    `;
    categoriesListEl.appendChild(div);

    // Opción en select
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });

  saveData();
}

// Render shopping list
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
        <button class="delete-btn" data-index="${index}">🗑️</button>
      </div>
    `;
    shoppingListEl.appendChild(li);
  });
  saveData();
}

// Add new category
categoryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('new-category').value.trim();
  if (name && !categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    categories.push({ id: Date.now(), name });
    renderCategories();
    categoryForm.reset();
  }
});

// Edit/delete categories
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

// Sync category input and select
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

// Add product
productForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('product-name').value.trim();
  const favorite = document.getElementById('product-favorite').checked;
  
  if (!name) return;

  let categoryId = null;
  let newCatName = newCategoryInput.value.trim();
  let selectedCatId = categorySelect.value;

  if (selectedCatId) {
    categoryId = Number(selectedCatId);
  } else if (newCatName) {
    // Crear nueva categoría
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
});

// Toggle bought or delete product
shoppingListEl.addEventListener('click', (e) => {
  const index = e.target.dataset.index;
  if (index === undefined) return;

  if (e.target.classList.contains('bought')) {
    shoppingList[index].bought = e.target.checked;
  } else if (e.target.classList.contains('delete-btn')) {
    shoppingList.splice(index, 1);
  }
  renderShoppingList();
});

// Clear list
clearBtn.addEventListener('click', () => {
  if (confirm('¿Seguro que quieres borrar toda la lista?')) {
    shoppingList = [];
    renderShoppingList();
  }
});

// Load favorites
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

// Initial render
renderCategories();
renderShoppingList();
