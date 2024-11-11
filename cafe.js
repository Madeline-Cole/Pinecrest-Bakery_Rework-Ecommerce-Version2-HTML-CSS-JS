import { menuData } from '../menuData.js';

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    function showAddedToCartMessage(itemName) {
        const message = document.createElement('div');
        message.className = 'cart-message';
        message.textContent = `${itemName} added to cart`;
        document.body.appendChild(message);
    
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    function renderProducts(selectedCategory = 'breakfast') {
        let products = [];
        
        if (selectedCategory === 'drinks') {
            // Flatten drinks subcategories into a single array
            Object.values(menuData[selectedCategory]).forEach(subcategory => {
                products = products.concat(subcategory);
            });
        } else {
            products = menuData[selectedCategory] || [];
        }
    
        const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
        const grid = document.getElementById('menuGrid');
        
        grid.innerHTML = products.map(product => {
            const isInCart = storedCart.some(item => item.id === product.id);
            const quantity = isInCart ? getProductQuantity(product.id) : 1;
            
            return `
    <div class="product-card">
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            
            ${product.sizes ? `
                <select class="size-selector" data-id="${product.id}">
                    ${product.sizes.map(size => `
                        <option value="${size.size}" data-price="${size.price}">
                            ${size.size} (${size.volume}) - $${size.price.toFixed(2)}
                        </option>
                    `).join('')}
                </select>
            ` : `
                <p class="product-price">$${product.price.toFixed(2)}</p>
            `}

            <p class="product-servings">
                ${product.category === 'sandwiches' ? product.description : 
                  product.category === 'drinks' ? `${product.servings} - ${product.description}` : 
                  product.servings}
            </p>

            ${isInCart ? `
                <div class="quantity-controls">
                    <button class="quantity-btn minus" data-id="${product.id}">-</button>
                    <input type="number" 
                        class="quantity-input" 
                        value="${quantity}" 
                        min="0" 
                        max="99"
                        data-id="${product.id}"
                        readonly>
                    <button class="quantity-btn plus" data-id="${product.id}">+</button>
                    <button class="remove-from-cart" data-id="${product.id}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            ` : `
                <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
            `}
        </div>
    </div>
`;
        }).join('');

        // Add event listeners for buttons
        addButtonEventListeners();
    }

    function addButtonEventListeners() {
        // Quantity buttons
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', handleQuantityChange);
        });

        // Remove buttons
        document.querySelectorAll('.remove-from-cart').forEach(button => {
            button.addEventListener('click', handleRemove);
        });

        // Add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', handleAddToCart);
        });
    }

    // Event Handlers
    document.querySelector('.checkout-btn').addEventListener('click', () => {
        window.location.href = '../checkout.html';
    });
    
    function handleQuantityChange(e) {
        const productId = e.target.dataset.id;
        const input = e.target.parentElement.querySelector('.quantity-input');
        let value = parseInt(input.value);

        if (e.target.classList.contains('plus')) {
            value = Math.min(99, value + 1);
        } else {
            value = Math.max(0, value - 1);
        }

        if (value === 0) {
            removeFromCart(productId);
        } else {
            addToCart(productId, value);
        }
    }

    function handleRemove(e) {
        const productId = e.target.dataset.id;
        const currentCategory = document.getElementById('categoryFilter').value;
        const category = currentCategory === 'all' ? 'breakfast' : currentCategory;
        
        removeFromCart(productId);
        renderProducts(category); // Pass the current category
    }

    function handleAddToCart(e) {
        const productId = e.target.dataset.id;
        addToCart(productId, 1);
    }

    // Cart Functions
    function addToCart(productId, quantity) {
        const currentCategory = document.getElementById('categoryFilter').value;
        const category = currentCategory === 'all' ? 'breakfast' : currentCategory;
        
        // Look for product in current category first
        let product = menuData[category]?.find(p => p.id === productId);
        
        // If not found, look in all categories
        if (!product) {
            const categories = ['breakfast', 'drinks', 'sandwiches', 'latinAmerican'];
            for (const cat of categories) {
                if (menuData[cat]) {
                    product = menuData[cat].find(p => p.id === productId);
                    if (product) break;
                }
            }
        }
    
        if (product) {
            const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
            const updatedCart = storedCart.filter(item => item.id !== productId);

            for (let i = 0; i < quantity; i++) {
                updatedCart.push(product);
            }
            
            localStorage.setItem('cartItems', JSON.stringify(updatedCart));
            updateCartCount();
            showAddedToCartMessage(product.name);
            renderProducts(category);
        }
    }

    function removeFromCart(productId) {
        const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
        const updatedCart = storedCart.filter(item => item.id !== productId);
        localStorage.setItem('cartItems', JSON.stringify(updatedCart));
        updateCartCount();
        // Remove the renderProducts call from here since we're calling it in handleRemove
    }

    function getProductQuantity(productId) {
        const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
        return storedCart.filter(item => item.id === productId).length;
    }

    function updateCartCount() {
        const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = storedCart.length;
        });
    }

    // Category Filter Handler
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
        const selectedCategory = e.target.value;
        renderProducts(selectedCategory === 'all' ? 'breakfast' : selectedCategory);
    });

    // Initialize with breakfast items
    renderProducts('breakfast');
});
