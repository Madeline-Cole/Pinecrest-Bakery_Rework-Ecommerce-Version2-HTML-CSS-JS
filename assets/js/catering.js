import { menuData } from '/data/menuData.js';

document.addEventListener('DOMContentLoaded', () => {
    let currentProducts = getAllCateringProducts();
    
    function getAllCateringProducts() {
        return [
            ...menuData.catering.partyPackages,
            ...Object.values(menuData.catering.cakes).flat(),
            ...menuData.catering.meals,
            ...menuData.catering.sides
        ];
    }

    function renderProducts(products) {
        const grid = document.getElementById('menuGrid');
        const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
        
        grid.innerHTML = products.map(product => createProductCard(product, storedCart)).join('');
        addEventListeners();
    }

    function createProductCard(product, storedCart) {
        const isInCart = storedCart.some(item => item.id === product.id);
        const quantity = isInCart ? getProductQuantity(product.id) : 1;
        
        // Special handling for party packages
        if (product.includes) {
            return `
                <div class="product-card package-card">
                    <div class="product-info">
                        <div class="package-header">
                            <h3 class="product-title">${product.name}</h3>
                            <p class="price">$${product.price.toFixed(2)}</p>
                        </div>
                        <p class="product-description">${product.description}</p>
                        <p class="serves">Serves: ${product.serves}</p>
                        <div class="package-includes">
                            <h4>Package Includes:</h4>
                            <ul>
                                ${product.includes.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                        ${createCartControls(product, isInCart, quantity)}
                    </div>
                </div>
            `;
        }
        
        // Regular product card for other items
        return `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    ${createPriceDisplay(product)}
                    <p class="product-description">${product.description}</p>
                    ${createCartControls(product, isInCart, quantity)}
                </div>
            </div>
        `;
    }    

   
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', handleAddToCart);
        });

        function createPriceDisplay(product) {
            if (product.options) {
                return `
                    <select class="size-selector" data-id="${product.id}">
                        ${product.options.map(option => `
                            <option value="${option.size}" data-price="${option.price}">
                                ${option.size} - $${option.price.toFixed(2)}
                            </option>
                        `).join('')}
                    </select>
                `;
            }
            return `<p class="price">$${product.price.toFixed(2)}</p>`;
        }
        
        function createCartControls(product, isInCart, quantity) {
            if (isInCart) {
                return `
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
                `;
            }
            return `<button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>`;
        }
        
        function addEventListeners() {
            document.querySelectorAll('.quantity-btn').forEach(button => {
                button.addEventListener('click', handleQuantityChange);
            });
            
            document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                button.addEventListener('click', handleAddToCart);
            });
            
            document.querySelectorAll('.remove-from-cart').forEach(button => {
                button.addEventListener('click', handleRemoveFromCart);
            });
        }        
    

        function handleAddToCart(e) {
            const productId = e.target.dataset.id;
            const productCard = e.target.closest('.product-card');
            
            // Find the product from all catering items
            const product = currentProducts.find(item => item.id === productId);
            
            if (!product) return;
        
            // Handle products with size options
            const sizeSelector = productCard.querySelector('.size-selector');
            let cartItem;
            
            if (sizeSelector) {
                const selectedOption = sizeSelector.options[sizeSelector.selectedIndex];
                cartItem = {
                    id: `${productId}-${selectedOption.value}`,
                    name: `${product.name} - ${selectedOption.value}`,
                    price: parseFloat(selectedOption.dataset.price),
                    category: 'catering',
                    image: product.image,
                    description: product.description
                };
            } else {
                // Handle regular items and party packages
                cartItem = {
                    id: productId,
                    name: product.name,
                    price: product.price,
                    category: 'catering',
                    image: product.image || null,
                    description: product.description,
                    includes: product.includes || null,
                    serves: product.serves || null
                };
            }
        
            addToCart(cartItem);
            renderProducts(currentProducts);
        }        

    function addToCart(item) {
        const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
        cart.push(item);
        localStorage.setItem('cartItems', JSON.stringify(cart));
        updateCartCount();
        showAddedToCartMessage(item.name);
    }

    function updateCartCount() {
        const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = storedCart.length;
        });
    }

    function showAddedToCartMessage(itemName) {
        const message = document.createElement('div');
        message.className = 'cart-message';
        message.textContent = `${itemName} added to cart`;
        document.body.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    // Search functionality
    document.getElementById('searchMenu').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredProducts = currentProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
        renderProducts(filteredProducts);
    });

    // Category filter
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
        const category = e.target.value;
        filterProducts(category);
    });

    function filterProducts(category) {
        if (category === 'all') {
            currentProducts = getAllCateringProducts();
        } else {
            currentProducts = category === 'cakes' 
                ? Object.values(menuData.catering.cakes).flat()
                : menuData.catering[category] || [];
        }
        renderProducts(currentProducts);
    }

    // Initialize
    renderProducts(currentProducts);
    updateCartCount();
});
