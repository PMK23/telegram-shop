// Инициализация Telegram
const tg = window.Telegram.WebApp;
tg.expand();

// Состояние магазина
const state = {
    categories: [],
    products: [],
    cart: [],
    filteredProducts: [],
    searchQuery: ''
};

// Загрузка данных
async function loadData() {
    try {
        const response = await fetch('products.json');
        const data = await response.json();

        state.categories = data.categories;
        state.products = data.products.map(p => ({
            ...p,
            price: Math.floor(1000 + Math.random() * 9000),
            image: p.image_url || 'https://via.placeholder.com/200'
        }));

        state.filteredProducts = [...state.products];

        renderCategories();
        renderProducts();
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

// Показать категории
function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    const rootCats = state.categories.filter(c => c.level === 1);

    grid.innerHTML = rootCats.map(cat => `
        <div class="category-card" onclick="showCategory('${cat.url}')">
            <div class="category-image">
                <img src="${cat.image_url || 'https://via.placeholder.com/100'}" alt="${cat.name}">
            </div>
            <div class="category-info">
                <h3>${cat.name}</h3>
                <span class="product-count">${countProducts(cat.url)} товаров</span>
            </div>
        </div>
    `).join('');
}

// Считаем товары в категории
function countProducts(catUrl) {
    return state.products.filter(p => p.category_url === catUrl).length;
}

// Показать товары категории
window.showCategory = function(catUrl) {
    const category = state.categories.find(c => c.url === catUrl);
    document.getElementById('currentCategoryTitle').textContent = category.name;
    state.filteredProducts = state.products.filter(p => p.category_url === catUrl);
    renderProducts();
};

// Показать все товары
window.showAllProducts = function() {
    document.getElementById('currentCategoryTitle').textContent = 'Все товары';
    state.filteredProducts = [...state.products];
    renderProducts();
};

// Рендер товаров
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const products = state.searchQuery
        ? state.products.filter(p => p.name.toLowerCase().includes(state.searchQuery.toLowerCase()))
        : state.filteredProducts;

    if (products.length === 0) {
        grid.innerHTML = '<div class="no-products">Товары не найдены</div>';
        return;
    }

    grid.innerHTML = products.map(p => `
        <div class="product-card" onclick="openProduct('${p.url}')">
            <div class="product-image">
                <img src="${p.image}" alt="${p.name}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${p.name.substring(0, 50)}...</h3>
                <p class="product-category">${p.category}</p>
                <div class="product-footer">
                    <span class="product-price">${p.price.toLocaleString()} ₽</span>
                    <button class="add-to-cart-btn" onclick="addToCart(event, '${p.url}')">В корзину</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Открыть товар
window.openProduct = function(url) {
    const product = state.products.find(p => p.url === url);
    const modal = document.getElementById('productModal');
    const content = document.getElementById('productModalContent');

    content.innerHTML = `
        <img src="${product.image}" alt="${product.name}" style="width:100%; max-height:200px; object-fit:contain;">
        <h2>${product.name}</h2>
        <p style="color:#666; margin:10px 0;">${product.category}</p>
        <p style="font-size:24px; font-weight:600; color:#2A6BFF; margin:20px 0;">${product.price.toLocaleString()} ₽</p>
        <button class="btn-primary" onclick="addToCart(event, '${product.url}'); document.getElementById('productModal').style.display='none'">
            Добавить в корзину
        </button>
    `;

    modal.style.display = 'flex';
};

// Добавить в корзину
window.addToCart = function(event, url) {
    event.stopPropagation();
    const product = state.products.find(p => p.url === url);
    const existing = state.cart.find(item => item.url === url);

    if (existing) {
        existing.quantity += 1;
    } else {
        state.cart.push({...product, quantity: 1});
    }

    updateCartBadge();
    tg.showPopup({ title: 'Успешно', message: 'Товар добавлен в корзину', buttons: [{type: 'ok'}] });
};

// Обновить счетчик корзины
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const total = state.cart.reduce((sum, item) => sum + item.quantity, 0);

    if (total > 0) {
        badge.textContent = total;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

// Показать корзину
function renderCart() {
    const content = document.getElementById('cartContent');

    if (state.cart.length === 0) {
        content.innerHTML = `
            <div class="empty-cart">
                <span class="empty-icon">🛒</span>
                <p>Корзина пуста</p>
                <button class="btn-primary" onclick="switchView('catalog')">Перейти в каталог</button>
            </div>
        `;
        return;
    }

    const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    content.innerHTML = `
        <div class="cart-items">
            ${state.cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" class="cart-item-image">
                    <div class="cart-item-info">
                        <h4>${item.name.substring(0, 30)}...</h4>
                        <p class="cart-item-price">${item.price.toLocaleString()} ₽</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button onclick="updateQuantity('${item.url}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity('${item.url}', 1)">+</button>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart('${item.url}')">×</button>
                </div>
            `).join('')}
        </div>
        <div class="cart-total">
            <span>Итого:</span>
            <span class="total-price">${total.toLocaleString()} ₽</span>
        </div>
        <button class="btn-primary" style="margin-top:20px;" onclick="checkout()">Оформить заказ</button>
    `;
}

// Изменить количество
window.updateQuantity = function(url, delta) {
    const index = state.cart.findIndex(item => item.url === url);
    if (index === -1) return;

    const newQty = state.cart[index].quantity + delta;

    if (newQty <= 0) {
        state.cart.splice(index, 1);
    } else {
        state.cart[index].quantity = newQty;
    }

    updateCartBadge();
    renderCart();
};

// Удалить из корзины
window.removeFromCart = function(url) {
    state.cart = state.cart.filter(item => item.url !== url);
    updateCartBadge();
    renderCart();
};

// Оформить заказ
function checkout() {
    const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    tg.sendData(JSON.stringify({
        action: 'checkout',
        items: state.cart,
        total: total
    }));

    state.cart = [];
    updateCartBadge();
    switchView('catalog');

    tg.showPopup({
        title: 'Заказ оформлен',
        message: 'Спасибо! Менеджер свяжется с вами.',
        buttons: [{type: 'ok'}]
    });
}

// Переключение вкладок
window.switchView = function(view) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    document.querySelectorAll('.view').forEach(v => {
        v.classList.toggle('active', v.id === `${view}-view`);
    });

    if (view === 'cart') renderCart();
};

// Поиск
document.getElementById('searchInput').addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderProducts();
});

// Закрытие модального окна
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('productModal').style.display = 'none';
});

// Навигация
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
});

// Запуск
loadData();