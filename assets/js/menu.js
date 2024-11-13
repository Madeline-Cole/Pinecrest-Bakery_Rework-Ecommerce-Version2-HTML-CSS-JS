import { menuData } from '/data/menuData.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get the current page category from the HTML
    const currentCategory = document.body.dataset.category || 'latinAmerican';

    // Initialize with the correct category data
    if (menuData[currentCategory]) {
        renderProducts(menuData[currentCategory]);
    }

    updateCartCount(); // Add this line at the start
    function showAddedToCartMessage(itemName) {
        const message = document.createElement('div');
        message.className = 'cart-message';
        message.textContent = `${itemName} added to cart`;
        document.body.appendChild(message);
    
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    function showRemovedFromCartMessage(itemName) {
        const message = document.createElement('div');
        message.className = 'cart-message remove';
        message.textContent = `${itemName} removed from cart`;
        document.body.appendChild(message);
    
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
    
    /*There are different categories for bakery: latin american delights (types of items in category: Pastelitos, empandas, croqutas, papa rellenas, tostatads,), breakfast, drinks(types of drinks: coffee, soda, juice), sandwiches, desserts (types of food in dessrt category: Marquesitas, Cake Slices,Cheesecake Slices,Señoritas,Eclairs, Dulce Copas, Mojados, Pudin, cake pops, cupcakes, mini mouses, pie fruit slices, tarts), breads, dry case (types of food: cookie box, muffins, fondant, masa real.)*/

        //core function
        function renderProducts(products) {
            const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
            const grid = document.getElementById('menuGrid');
            
            grid.innerHTML = products.map(product => {
                const isInCart = storedCart.some(item => item.id === product.id);
                const quantity = isInCart ? getProductQuantity(product.id) : 1;
                
                return `
                    <div class="menu-product-card">
                        <img src="${product.image}" alt="${product.name}" class="menu-product-image">
                        <div class="menu-product-info">
                            <h3 class="menu-product-title">${product.name}</h3>
                            <p class="menu-product-price">$${product.price.toFixed(2)}</p>
                            <p class="menu-product-servings">
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
                                <button class="menu-add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                            `}
                        </div>
                    </div>
                `;
            }).join('');        
        
            // Add event listeners for quantity buttons
            document.querySelectorAll('.quantity-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = e.target.dataset.id;
                    const input = e.target.parentElement.querySelector('.quantity-input');
                    let value = parseInt(input.value);
        
                    if (e.target.classList.contains('plus')) {
                        value = Math.min(99, value + 1);
                    } else if (e.target.classList.contains('minus')) {
                        value = Math.max(0, value - 1);
                    }
        
                    if (value === 0) {
                        removeFromCart(productId);
                    } else {
                        addToCart(productId, value);
                    }
                    
                    renderProducts(products);
                });
            });
        
            // Add event listener for remove buttons
            document.querySelectorAll('.remove-from-cart').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = e.target.dataset.id;
                    removeFromCart(productId);
                    renderProducts(products);
                });
            });
        }        

        //core function
        /*REMOVE FROM CART*/
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
        

        //core function
        /*ADD TO CART*/
        function addToCart(productId, quantity = 1) {
            const product = findProductInAllCategories(productId);
            
            if (product) {
                const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
                const updatedCart = storedCart.filter(item => item.id !== productId);
                
                for (let i = 0; i < quantity; i++) {
                    updatedCart.push(product);
                }
                
                localStorage.setItem('cartItems', JSON.stringify(updatedCart));
                updateCartCount();
                showAddedToCartMessage(product.name);
                
                // Get current category from filter
                const currentCategory = document.getElementById('categoryFilter').value;
                const categoryData = currentCategory === 'all' ? menuData.latinAmerican : menuData[currentCategory];
                renderProducts(categoryData);
            }
        }        

        // Helper function to find products across all categories
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

        //core function
        function getProductQuantity(productId) {
        const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
        return storedCart.filter(item => item.id === productId).length;
        }
    
    // Filter & Search Functions
    /*SUBCATEGORY FILTER*/
    function updateSubcategoryFilter(category) {
        const subCategoryFilter = document.getElementById('subCategoryFilter');
        const subcategories = [...new Set(menuData.latinAmerican
            .filter(product => product.category === category)
            .map(product => product.subCategory))];
        
        subCategoryFilter.innerHTML = `
            <option value="all">All Types</option>
            ${subcategories.map(sub => `
                <option value="${sub}">${sub.charAt(0).toUpperCase() + sub.slice(1)}</option>
            `).join('')}
        `;
    }

    /*SEARCH FUNCTIONALITY*/
    document.getElementById('searchMenu').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredProducts = menuData.latinAmerican.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
        renderProducts(filteredProducts);
    });

    // Event Listeners
    // Event Listeners
document.getElementById('menuGrid').addEventListener('click', (e) => {
    if (e.target.classList.contains('menu-add-to-cart-btn')) {
        const productCard = e.target.closest('.menu-product-card');
        const quantityInput = productCard.querySelector('.quantity-input');
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
        addToCart(e.target.dataset.id, quantity);
    }
});

    document.getElementById('menuGrid').addEventListener('change', (e) => {
        if (e.target.classList.contains('quantity-input')) {
            let value = parseInt(e.target.value);
            const productId = e.target.dataset.id;
            
            if (value <= 0) {
                removeFromCart(productId);
                renderProducts(menuData.latinAmerican);
            } else {
                value = Math.min(99, value || 1);
                e.target.value = value;
                
                if (productId) {
                    addToCart(productId, value);
                }
            }
        }
    });

    document.getElementById('categoryFilter').addEventListener('change', (e) => {
    updateSubcategoryFilter(e.target.value);
    });

    // Initialize
    renderProducts(menuData.latinAmerican);
}); //END OF GIANT EVENT LISTENER

// Cart Management
    /*ADD TO CART DISPLAY*/
    function updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const cartCount = document.querySelector('.cart-count');
        
        cartItemsContainer.innerHTML = cartItems.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)}</p>
                </div>
                <button class="remove-item" data-id="${item.id}">×</button>
            </div>
        `).join('');
        
        const total = cartItems.reduce((sum, item) => sum + item.price, 0);
        cartTotal.textContent = `$${total.toFixed(2)}`;
        cartCount.textContent = cartItems.length;
    }

    function updateCartCount() {
        const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = storedCart.length;
        });
    }

    document.querySelector('.checkout-btn').addEventListener('click', () => {
        window.location.href = '../checkout.html';
    });