// Инициализация Telegram
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Состояние приложения
const state = {
    user: null,
    categories: [],
    products: [],
    cart: [],
    currentCategory: null,
    searchQuery: '',
    orders: []
};

// ============================================
// ИМИТАЦИЯ РЕГИСТРАЦИИ (используем данные Telegram)
// ============================================
function initUser() {
    // Пробуем получить данные из Telegram
    const tgUser = tg.initDataUnsafe?.user;
    
    if (tgUser) {
        // Пользователь зашел через Telegram - он уже "авторизован"
        state.user = {
            id: tgUser.id,
            firstName: tgUser.first_name,
            lastName: tgUser.last_name || '',
            username: tgUser.username,
            photoUrl: null,
            registered: true,
            registrationDate: new Date().toLocaleDateString()
        };
    } else {
        // Имитация регистрации для тестирования
        const savedUser = localStorage.getItem('olmi_user');
        if (savedUser) {
            state.user = JSON.parse(savedUser);
        } else {
            // Создаем "гостевого" пользователя
            state.user = {
                id: 'guest_' + Math.random().toString(36).substr(2, 9),
                firstName: 'Гость',
                lastName: '',
                username: null,
                photoUrl: null,
                registered: false,
                visitCount: 1,
                firstVisit: new Date().toLocaleDateString()
            };
            localStorage.setItem('olmi_user', JSON.stringify(state.user));
        }
    }
    
    updateUserInterface();
}

// Обновление интерфейса пользователя
function updateUserInterface() {
    const userNameEl = document.getElementById('userName');
    const userStatusEl = document.getElementById('userStatus');
    const userAvatarEl = document.getElementById('userAvatar');
    
    if (state.user.registered) {
        userNameEl.textContent = `${state.user.firstName} ${state.user.lastName}`.trim();
        userStatusEl.textContent = 'постоянный покупатель';
        userAvatarEl.textContent = state.user.firstName.charAt(0).toUpperCase();
    } else {
        userNameEl.textContent = 'Гость';
        userStatusEl.textContent = 'не авторизован';
    }
}

// Открыть профиль
window.openProfile = function() {
    const modal = document.getElementById('profileModal');
    const content = document.getElementById('profileContent');
    
    const ordersCount = state.orders.length;
    const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalSpent = state.orders.reduce((sum, order) => sum + order.total, 0);
    
    let profileHtml = '';
    
    if (state.user.registered) {
        profileHtml = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 32px; color: white;">
                    ${state.user.firstName.charAt(0).toUpperCase()}
                </div>
                <h3 style="margin-bottom: 4px;">${state.user.firstName} ${state.user.lastName}</h3>
                <p style="color: #667eea; font-size: 14px;">ID: ${state.user.id}</p>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Всего заказов:</span>
                    <span style="font-weight: 600;">${ordersCount}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Сумма покупок:</span>
                    <span style="font-weight: 600; color: #667eea;">${totalSpent.toLocaleString()} ₽</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Товаров в корзине:</span>
                    <span style="font-weight: 600;">${cartCount}</span>
                </div>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 12px; padding: 16px;">
                <h4 style="margin-bottom: 12px;">История заказов</h4>
                ${ordersCount > 0 ? state.orders.slice(-3).map(order => `
                    <div style="padding: 8px 0; border-bottom: 1px solid #eee;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>Заказ #${order.id}</span>
                            <span style="color: #667eea;">${order.total.toLocaleString()} ₽</span>
                        </div>
                        <div style="font-size: 12px; color: #999;">${order.date}</div>
                    </div>
                `).join('') : '<p style="color: #999; text-align: center;">У вас пока нет заказов</p>'}
            </div>
        `;
    } else {
        profileHtml = `
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 64px; margin-bottom: 16px;">👤</div>
                <h3 style="margin-bottom: 8px;">Гостевой режим</h3>
                <p style="color: #666; margin-bottom: 20px;">Войдите через Telegram, чтобы сохранять историю заказов</p>
                <button class="checkout-btn" onclick="simulateRegistration()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                    Войти через Telegram
                </button>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 12px; padding: 16px;">
                <h4 style="margin-bottom: 8px;">Статистика посещений</h4>
                <div style="display: flex; justify-content: space-between;">
                    <span>Визитов:</span>
                    <span>${state.user.visitCount}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Первый визит:</span>
                    <span>${state.user.firstVisit}</span>
                </div>
            </div>
        `;
    }
    
    content.innerHTML = profileHtml;
    modal.style.display = 'flex';
};

// Имитация регистрации
window.simulateRegistration = function() {
    state.user = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        firstName: 'Алексей',
        lastName: 'Петров',
        username: 'alex_' + Math.floor(Math.random() * 1000),
        photoUrl: null,
        registered: true,
        registrationDate: new Date().toLocaleDateString()
    };
    
    localStorage.setItem('olmi_user', JSON.stringify(state.user));
    updateUserInterface();
    closeProfile();
    showToast('✓ Вы успешно зарегистрированы!');
};

// Закрыть профиль
window.closeProfile = function() {
    document.getElementById('profileModal').style.display = 'none';
};

// ============================================
// ЗАГРУЗКА ДАННЫХ
// ============================================
async function loadData() {
    try {
        const response = await fetch('products.json');
        const data = await response.json();
        
        // Загружаем категории
        state.categories = data.categories;
        
        // Загружаем товары и добавляем цены
        state.products = data.products.map(product => {
            // Генерируем цену на основе названия (для имитации)
            const hash = product.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
            const price = 500 + (hash % 9500);
            
            return {
                ...product,
                price: Math.round(price / 100) * 100, // Округляем до сотен
                image: getProductImage(product)
            };
        });
        
        renderCategories();
        filterAndRenderProducts();
        
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        showToast('Ошибка загрузки товаров');
    }
}

// Получение изображения товара
function getProductImage(product) {
    if (product.image_url) return product.image_url;
    
    // Ищем изображение в категории
    const category = state.categories.find(c => c.url === product.category_url);
    return category?.image_url || 'https://via.placeholder.com/200';
}

// ============================================
// КАТЕГОРИИ
// ============================================
function renderCategories() {
    const list = document.getElementById('categoriesList');
    const rootCategories = state.categories.filter(c => c.level === 1);
    
    list.innerHTML = `
        <div class="category-chip ${!state.currentCategory ? 'active' : ''}" onclick="showAllCategories()">
            Все
        </div>
        ${rootCategories.map(cat => `
            <div class="category-chip ${state.currentCategory === cat.url ? 'active' : ''}" 
                 onclick="selectCategory('${cat.url}')">
                ${cat.name}
            </div>
        `).join('')}
    `;
}

// Показать все категории
window.showAllCategories = function() {
    state.currentCategory = null;
    document.getElementById('currentCategory').textContent = 'Все товары';
    renderCategories();
    filterAndRenderProducts();
};

// Выбрать категорию
window.selectCategory = function(categoryUrl) {
    state.currentCategory = categoryUrl;
    const category = state.categories.find(c => c.url === categoryUrl);
    document.getElementById('currentCategory').textContent = category.name;
    renderCategories();
    filterAndRenderProducts();
};

// ============================================
// ТОВАРЫ
// ============================================
function filterAndRenderProducts() {
    let filtered = [...state.products];
    
    // Фильтр по категории
    if (state.currentCategory) {
        filtered = filtered.filter(p => p.category_url === state.currentCategory);
    }
    
    // Фильтр по поиску
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query)
        );
    }
    
    document.getElementById('productCount').textContent = `${filtered.length} товаров`;
    renderProducts(filtered);
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: span 2; text-align: center; padding: 40px; color: #999;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                <p>Товары не найдены</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="product-card" onclick="openProduct('${product.url}')">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <div class="product-title">${product.name.substring(0, 40)}${product.name.length > 40 ? '...' : ''}</div>
                <div class="product-category">${product.category}</div>
                <div class="product-footer">
                    <span class="product-price">${product.price.toLocaleString()} ₽</span>
                    <button class="add-btn" onclick="addToCart(event, '${product.url}')">
                        В корзину
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// ТОВАР (детальный просмотр)
// ============================================
window.openProduct = function(productUrl) {
    const product = state.products.find(p => p.url === productUrl);
    if (!product) return;
    
    const modal = document.getElementById('productModal');
    const content = document.getElementById('productModalContent');
    
    content.innerHTML = `
        <div class="modal-header">
            <h3>${product.name.substring(0, 30)}${product.name.length > 30 ? '...' : ''}</h3>
            <span class="close-modal" onclick="closeProductModal()">&times;</span>
        </div>
        <div class="modal-body">
            <img src="${product.image}" alt="${product.name}" style="width:100%; max-height:200px; object-fit:contain; margin-bottom:16px;">
            
            <div style="margin-bottom:16px;">
                <span style="background:#f0f0f0; padding:4px 12px; border-radius:20px; font-size:12px;">${product.category}</span>
            </div>
            
            <p style="font-size:24px; font-weight:600; color:#667eea; margin:20px 0;">
                ${product.price.toLocaleString()} ₽
            </p>
            
            <p style="color:#666; line-height:1.5; margin-bottom:20px;">
                ${product.description || 'Телекоммуникационное оборудование высокого качества. Гарантия 12 месяцев.'}
            </p>
            
            <button class="add-btn" style="width:100%; padding:16px; font-size:16px;" 
                    onclick="addToCart(event, '${product.url}'); closeProductModal();">
                Добавить в корзину
            </button>
        </div>
    `;
    
    modal.style.display = 'flex';
};

window.closeProductModal = function() {
    document.getElementById('productModal').style.display = 'none';
};

// ============================================
// КОРЗИНА (имитация)
// ============================================
window.addToCart = function(event, productUrl) {
    event.stopPropagation();
    
    const product = state.products.find(p => p.url === productUrl);
    const existingItem = state.cart.find(item => item.url === productUrl);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        state.cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartBadge();
    saveCart();
    showToast('✓ Товар добавлен в корзину');
};

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalItems > 0) {
        badge.textContent = totalItems;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// Сохранение корзины
function saveCart() {
    localStorage.setItem('olmi_cart', JSON.stringify(state.cart));
}

// Загрузка корзины
function loadCart() {
    const saved = localStorage.getItem('olmi_cart');
    if (saved) {
        state.cart = JSON.parse(saved);
        updateCartBadge();
    }
}

// Открыть корзину
window.openCart = function() {
    const modal = document.getElementById('cartModal');
    const content = document.getElementById('cartContent');
    
    if (state.cart.length === 0) {
        content.innerHTML = `
            <div class="empty-state">
                <div class="emoji">🛒</div>
                <h3 style="margin-bottom:8px;">Корзина пуста</h3>
                <p style="color:#666;">Добавьте товары из каталога</p>
            </div>
        `;
    } else {
        const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        content.innerHTML = `
            <div style="max-height:400px; overflow-y:auto; margin-bottom:16px;">
                ${state.cart.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="cart-item-details">
                            <div class="cart-item-title">${item.name.substring(0, 30)}...</div>
                            <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
                            <div class="cart-item-quantity">
                                <button class="qty-btn" onclick="updateQuantity('${item.url}', -1)">-</button>
                                <span>${item.quantity}</span>
                                <button class="qty-btn" onclick="updateQuantity('${item.url}', 1)">+</button>
                                <button class="qty-btn" onclick="removeFromCart('${item.url}')" style="color:#ff4757; border-color:#ff4757;">×</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="cart-total">
                <span>Итого:</span>
                <span>${total.toLocaleString()} ₽</span>
            </div>
            
            <button class="checkout-btn" onclick="checkout()">
                Оформить заказ
            </button>
        `;
    }
    
    modal.style.display = 'flex';
};

// Закрыть корзину
window.closeCart = function() {
    document.getElementById('cartModal').style.display = 'none';
};

// Обновить количество
window.updateQuantity = function(productUrl, delta) {
    const index = state.cart.findIndex(item => item.url === productUrl);
    if (index === -1) return;
    
    const newQuantity = state.cart[index].quantity + delta;
    
    if (newQuantity <= 0) {
        state.cart.splice(index, 1);
    } else {
        state.cart[index].quantity = newQuantity;
    }
    
    updateCartBadge();
    saveCart();
    openCart(); // Обновляем отображение
};

// Удалить из корзины
window.removeFromCart = function(productUrl) {
    state.cart = state.cart.filter(item => item.url !== productUrl);
    updateCartBadge();
    saveCart();
    openCart(); // Обновляем отображение
    showToast('✓ Товар удален из корзины');
};

// ============================================
// ОФОРМЛЕНИЕ ЗАКАЗА (имитация)
// ============================================
function checkout() {
    if (state.cart.length === 0) {
        showToast('Корзина пуста');
        return;
    }
    
    const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Создаем заказ
    const order = {
        id: 'ORD' + Date.now().toString().slice(-8),
        date: new Date().toLocaleString(),
        items: [...state.cart],
        total: total,
        status: 'processed'
    };
    
    state.orders.push(order);
    
    // Имитация отправки в Telegram (для отладки)
    console.log('Заказ оформлен:', order);
    
    // Очищаем корзину
    state.cart = [];
    updateCartBadge();
    saveCart();
    closeCart();
    
    // Показываем успешное оформление
    showToast('✓ Заказ оформлен! Менеджер свяжется с вами');
    
    // Если пользователь зарегистрирован, показываем номер заказа
    if (state.user.registered) {
        setTimeout(() => {
            showToast(`Номер заказа: ${order.id}`);
        }, 1000);
    }
    
    // Имитация отправки данных в Telegram бот
    tg.sendData(JSON.stringify({
        action: 'new_order',
        order: order,
        user: state.user
    }));
}

// ============================================
// УВЕДОМЛЕНИЯ
// ============================================
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}

// ============================================
// ПОИСК
// ============================================
document.getElementById('searchInput').addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    filterAndRenderProducts();
});

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
function init() {
    initUser();
    loadCart();
    loadData();
    
    // Клик по аватарке открывает профиль
    document.getElementById('userAvatar').addEventListener('click', openProfile);
    document.getElementById('userName').addEventListener('click', openProfile);
    
    // Закрытие модальных окон по клику вне
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Запуск приложения
init();
