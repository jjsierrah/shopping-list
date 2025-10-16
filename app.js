const form = document.getElementById('add-form');
const list = document.getElementById('shopping-list');
const clearBtn = document.getElementById('clear-list');
const loadFavoritesBtn = document.getElementById('load-favorites');

let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];

function renderList() {
  list.innerHTML = '';
  shoppingList.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="product-info">
        <h3>${item.name}${item.favorite ? ' ⭐' : ''}</h3>
        <div class="category">${item.category || 'Sin categoría'}</div>
      </div>
      <div class="actions">
        <input type="checkbox" class="bought" ${item.bought ? 'checked' : ''} data-index="${index}">
        <button class="delete-btn" data-index="${index}">🗑️</button>
      </div>
    `;
    list.appendChild(li);
  });
  localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('product-name').value.trim();
  const category = document.getElementById('product-category').value.trim();
  const favorite = document.getElementById('product-favorite').checked;

  if (name) {
    shoppingList.push({ name, category: category || '', favorite, bought: false });
    renderList();
    form.reset();
    document.getElementById('product-favorite').checked = false;
  }
});

list.addEventListener('click', (e) => {
  const index = e.target.dataset.index;
  if (index === undefined) return;

  if (e.target.classList.contains('bought')) {
    shoppingList[index].bought = e.target.checked;
  } else if (e.target.classList.contains('delete-btn')) {
    shoppingList.splice(index, 1);
  }
  renderList();
});

clearBtn.addEventListener('click', () => {
  if (confirm('¿Seguro que quieres borrar toda la lista?')) {
    shoppingList = [];
    renderList();
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
  renderList();
});

renderList();
