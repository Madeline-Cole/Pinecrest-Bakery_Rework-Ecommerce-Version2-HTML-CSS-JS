import { menuData } from '/data/menuData.js';

function findProductInAllCategories(productId) {
    const categories = ['latinAmerican', 'desserts', 'breads', 'dryCase', 'latin'];
    
    for (const category of categories) {
        if (menuData[category]) {
            const product = menuData[category].find(p => p.id === productId);
            if (product) return product;
        }
    }
    return null;
}

 // Cart Functions
 function addToCart(productId, quantity = 1, selectedOption = null, showMessage = true) {
    const product = findProductInAllCategories(productId);
    
    if (product) {
        const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
        const cartItemId = selectedOption ? `${productId}-${selectedOption.toLowerCase()}` : productId;
        
        let cartItem = {
            ...product,
            id: cartItemId,
            name: selectedOption ? `${product.name} (${selectedOption})` : product.name,
            cookingOption: selectedOption
        };
        
        const updatedCart = storedCart.filter(item => item.id !== cartItemId);
        
        for (let i = 0; i < quantity; i++) {
            updatedCart.push(cartItem);
        }
        
        localStorage.setItem('cartItems', JSON.stringify(updatedCart));
        updateCartCount();
        
        if (showMessage) {
            showAddedToCartMessage(cartItem.name);
        }
        
        const currentCategory = document.getElementById('categoryFilter').value;
        const categoryData = currentCategory === 'all' ? menuData.latinAmerican : menuData[currentCategory];
        renderProducts(categoryData);
    }
}    

function removeFromCart(productId) {
    const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const removedItem = storedCart.find(item => item.id === productId);
    const updatedCart = storedCart.filter(item => item.id !== productId);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    updateCartCount();
    if (removedItem) {
        showRemovedFromCartMessage(removedItem.name);
    }
}

function updateCartCount() {
    const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = storedCart.length;
    });
}

// Message Display Functions
function showAddedToCartMessage(itemName) {
    const message = document.createElement('div');
    message.className = 'cart-message';
    message.textContent = `${itemName} added to cart`;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
}

function showRemovedFromCartMessage(itemName) {
    const existingMessage = document.querySelector('.cart-message.remove');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const message = document.createElement('div');
    message.className = 'cart-message remove';
    message.textContent = `${itemName} removed from cart`;
    document.body.appendChild(message);

    setTimeout(() => {
        message.remove();
    }, 3000);
}    

// Event Handler Functions
function handleAddToCart(e) {
    const productId = e.target.dataset.id;
    const productCard = e.target.closest('.menu-product-card');
    const cookingSelector = productCard.querySelector('.cooking-selector');
    const product = findProductInAllCategories(productId);
    
    if (cookingSelector) {
        // Handle products with options
        const selectedOption = cookingSelector.value;
        addToCart(productId, 1, selectedOption);
    } else {
        // Handle products without options
        addToCart(productId, 1, null, true);
    }
}


function handleQuantityChange(e) {
    const productId = e.target.dataset.id;
    const productCard = e.target.closest('.menu-product-card');
    const input = productCard.querySelector('.quantity-input');
    let currentValue = parseInt(input.value);
    const product = findProductInAllCategories(productId);

    if (e.target.classList.contains('plus')) {
        const newValue = currentValue + 1;
        input.value = newValue;
        showAddedToCartMessage(product.name);
        addToCart(productId, newValue, null, false);
    } else {
        // Don't proceed if already at zero
        if (currentValue === 0) return;
        
        const newValue = currentValue - 1;
        input.value = newValue;
        
        if (newValue === 0) {
            showRemovedFromCartMessage(product.name);
            removeFromCart(productId, false);
        } else {
            showRemovedFromCartMessage(product.name);
            addToCart(productId, newValue, null, false);
        }
    }
}    

function handleQuantityInputChange(e) {
    let value = parseInt(e.target.value);
    const productId = e.target.dataset.id;
    const productCard = e.target.closest('.menu-product-card');
    const cookingSelector = productCard.querySelector('.cooking-selector');
    
    if (value <= 0) {
        const fullId = cookingSelector ? 
            `${productId}-${cookingSelector.value.toLowerCase()}` : 
            productId;
        removeFromCart(fullId);
    } else {
        value = Math.min(99, value || 1);
        e.target.value = value;
        const selectedOption = cookingSelector ? cookingSelector.value : null;
        addToCart(productId, value, selectedOption);
    }
}

function handleCookingOptionChange(e) {
    const productCard = e.target.closest('.menu-product-card');
    const quantityInput = productCard.querySelector('.quantity-input');
    quantityInput.value = 1;
}

// Event Listeners Setup
function addEventListeners() {
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', handleQuantityChange);
    });

    document.querySelectorAll('.menu-add-to-cart-btn').forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });

    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', handleQuantityInputChange);
    });

    document.querySelectorAll('.cooking-selector').forEach(selector => {
        selector.addEventListener('change', handleCookingOptionChange);
    });
}

// Filter Functions
function initializeFilters() {
    const searchInput = document.getElementById('searchMenu');
    const categoryFilter = document.getElementById('categoryFilter');
    const subCategoryFilter = document.getElementById('subCategoryFilter');

    searchInput.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', handleCategoryChange);
    subCategoryFilter.addEventListener('change', filterProducts);
}

function handleCategoryChange(e) {
    const category = e.target.value;
    updateSubcategories(category);
    
    // Get products based on category
    let products;
    if (category === 'all') {
        products = Object.values(menuData).flat();
    } else {
        // Convert category value to match menuData structure
        const categoryMap = {
            'latin': 'latinAmerican',
            'dry-case': 'dryCase',
            'desserts': 'desserts',
            'breakfast': 'breakfast',
            'sandwiches': 'sandwiches',
            'drinks': 'drinks'
        };
        
        const categoryKey = categoryMap[category] || category;
        products = menuData[categoryKey] || [];
    }
    
    renderProducts(products);
}

function updateSubcategories(category) {
    const subCategoryFilter = document.getElementById('subCategoryFilter');
    const subcategories = getSubcategoriesForCategory(category);
    
    subCategoryFilter.innerHTML = `
        <option value="all">All Types</option>
        ${subcategories.map(sub => `
            <option value="${sub.toLowerCase()}">${sub}</option>
        `).join('')}
    `;
}

function getSubcategoriesForCategory(category) {
    const subcategoryMap = {
        'latin': ['Pastelitos', 'Empanadas', 'Croquetas'],
        'desserts': ['Cakes', 'Cookies', 'Pastries'],
        'breads': ['Cuban Bread', 'French Bread', 'Rolls'],
        'dry-case': ['Crackers', 'Packaged Goods']
    };
    return subcategoryMap[category] || [];
}

function filterProducts() {
    const searchTerm = document.getElementById('searchMenu').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const subcategory = document.getElementById('subCategoryFilter').value;
    
    let filteredProducts = [];
    
    // Handle the 'all' category case
    if (category === 'all') {
        ['latinAmerican', 'desserts', 'breads', 'dryCase', 'latin'].forEach(cat => {
            if (menuData[cat]) {
                filteredProducts = filteredProducts.concat(menuData[cat]);
            }
        });
    } else {
        // Convert category value to match menuData structure
        const categoryKey = category === 'dry-case' ? 'dryCase' : category;
        filteredProducts = menuData[categoryKey] || [];
    }
    
    // Apply search filter
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description?.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply subcategory filter if selected
    if (subcategory !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
            product.subcategory?.toLowerCase() === subcategory
        );
    }
    
    renderProducts(filteredProducts);
}

 // Rendering Functions
 function renderProductWithOptions(product, storedCart) {
    const price = product.price || 3; // Default to 3 if price is undefined
    return `
        <div class="menu-product-card">
            <img src="${product.image}" alt="${product.name}" class="menu-product-image">
            <div class="menu-product-info">
                <h3 class="menu-product-title">${product.name}</h3>
                <div class="cooking-options">
                    <select class="cooking-selector" data-id="${product.id}">
                        ${product.options.map(option => `
                            <option value="${option}">${option}</option>
                        `).join('')}
                    </select>
                </div>
                <p class="menu-product-price">$${price.toFixed(2)}</p>
                <button class="menu-add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
            </div>
        </div>
    `;
}


function renderProductWithoutOptions(product, storedCart) {
    const currentQuantity = getQuantityForSimpleProduct(product, storedCart);
    const price = product.price || 3; // Default to 3 if price is undefined
    return `
        <div class="menu-product-card">
            <img src="${product.image}" alt="${product.name}" class="menu-product-image">
            <div class="menu-product-info">
                <h3 class="menu-product-title">${product.name}</h3>
                <p class="menu-product-price">$${price.toFixed(2)}</p>
                ${currentQuantity > 0 ? `
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-id="${product.id}">-</button>
                        <input type="number" class="quantity-input" value="${currentQuantity}" min="0" max="99" data-id="${product.id}">
                        <button class="quantity-btn plus" data-id="${product.id}">+</button>
                    </div>
                ` : `
                    <button class="menu-add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                `}
            </div>
        </div>
    `;
}

function renderProducts(products) {
    const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const grid = document.getElementById('menuGrid');
    
    grid.innerHTML = products.map(product => 
        product.options ? 
            renderProductWithOptions(product, storedCart) : 
            renderProductWithoutOptions(product, storedCart)
    ).join('');

    addEventListeners();
}

// Helper Functions
function getQuantityForOptionProduct(product, storedCart) {
    const cookingSelector = document.querySelector(`.cooking-selector[data-id="${product.id}"]`);
    const selectedOption = cookingSelector ? cookingSelector.value : product.options[0];
    const fullId = `${product.id}-${selectedOption.toLowerCase()}`;
    return storedCart.filter(item => item.id === fullId).length || 1;
}

function getQuantityForSimpleProduct(product, storedCart) {
    const items = storedCart.filter(item => item.id === product.id);
    return items.length;
}    

document.addEventListener('DOMContentLoaded', () => {
    initializeFilters();
    const currentCategory = document.body.dataset.category || 'latinAmerican';

    // Initialize
    if (menuData[currentCategory]) {
        renderProducts(menuData[currentCategory]);
    }
    updateCartCount();
});