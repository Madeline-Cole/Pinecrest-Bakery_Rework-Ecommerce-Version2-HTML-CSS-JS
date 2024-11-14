import { menuData } from '/data/menuData.js';

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = cart.length;
    });
}

function showAddedToCartMessage(productName) {
    const message = document.createElement('div');
    message.className = 'added-to-cart-message';
    message.textContent = `${productName} added to cart!`;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
}

function showRemovedFromCartMessage(productName) {
    const message = document.createElement('div');
    message.className = 'removed-from-cart-message';
    message.textContent = `${productName} removed from cart`;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
}

function findProductInAllCategories(productId) {
    const categories = ['breakfast', 'sandwiches', 'drinks'];
    
    for (const category of categories) {
        if (menuData[category]) {
            if (category === 'drinks') {
                for (const subcategory in menuData[category]) {
                    const product = menuData[category][subcategory].find(p => p.id === productId);
                    if (product) return product;
                }
            } else {
                const product = menuData[category].find(p => p.id === productId);
                if (product) return product;
            }
        }
    }
    return null;
}

document.addEventListener('DOMContentLoaded', () => {
    const cafeGrid = document.querySelector('#menuGrid');

    function renderOptions(product) {
        let optionsHTML = '';

         // Add hot/cold option for heatable sandwiches
    if (product.canBeHeated) {
        optionsHTML += `
            <div class="option-group">
                <label for="temp-${product.id}">Temperature:</label>
                <select class="temp-select" id="temp-${product.id}" required>
                    <option value="cold">Cold</option>
                    <option value="hot" ${product.recommended === "hot" ? 'selected' : ''}>Hot</option>
                </select>
            </div>
        `;
    }
        
        if (product.sizes) {
            optionsHTML += `
                <div class="option-group">
                    <label for="size-${product.id}">Choose size:</label>
                    <select class="size-select" id="size-${product.id}" required>
                        <option value="">Select size</option>
                        ${product.sizes.map(size => `
                            <option value="${size.size}" data-price="${size.price}">
                                ${size.size} (${size.volume}) - $${size.price.toFixed(2)}
                            </option>
                        `).join('')}
                    </select>
                </div>
            `;
        }
        
        if (product.options) {
            optionsHTML += `
                <div class="option-group">
                    <label for="option-${product.id}">Choose option:</label>
                    <select class="option-select" id="option-${product.id}" required>
                        <option value="">Select an option</option>
                        ${product.options.map(option => `
                            <option value="${option}">${option}</option>
                        `).join('')}
                    </select>
                </div>
            `;
        }
        
        return optionsHTML;
    }

    function addToCart(product) {
        const selectedSize = document.querySelector(`#size-${product.id}`)?.value;
        const selectedTemp = document.querySelector(`#temp-${product.id}`)?.value;
    
        if (product.canBeHeated && !selectedTemp) {
            alert('Please select temperature preference');
            return;
        }
    
        const uniqueId = `${product.id}-${selectedSize || ''}-${selectedTemp || ''}`;
        const price = selectedSize ? 
            product.sizes.find(s => s.size === selectedSize)?.price : 
            product.price;
    
        const cartItem = {
            id: uniqueId,
            baseId: product.id,
            name: product.name,
            price: price,
            image: product.image,
            category: product.category,
            selectedOptions: {
                size: selectedSize,
                temperature: selectedTemp
            }
        };
    
        const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
        cart.push(cartItem);
        localStorage.setItem('cartItems', JSON.stringify(cart));
        updateCartCount();
        showAddedToCartMessage(`${selectedTemp ? selectedTemp + ' ' : ''}${cartItem.name}`);
    }

    function getOptionQuantityInCart(productId, selectedSize) {
        const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
        const quantity = cart.filter(item => item.baseId === productId).length;
        console.log(`Quantity for ${productId}: ${quantity}`);
        return quantity;
    }
    
    function removeAllFromCart(productId, selectedSize) {
        const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
        const updatedCart = cart.filter(item => item.baseId !== productId);
        localStorage.setItem('cartItems', JSON.stringify(updatedCart));
        updateCartCount();
        const product = findProductInAllCategories(productId);
        showRemovedFromCartMessage(product.name);
        renderCafeProducts(document.getElementById('categoryFilter').value);
    }

    function renderCafeProducts(category = 'all') {
        let products = [];
        
        if (category === 'all') {
            ['breakfast', 'sandwiches', 'drinks'].forEach(cat => {
                if (cat === 'drinks') {
                    Object.values(menuData[cat]).forEach(subcategory => {
                        products = products.concat(subcategory);
                    });
                } else {
                    products = products.concat(menuData[cat] || []);
                }
            });
        } else if (category === 'drinks') {
            Object.values(menuData[category]).forEach(subcategory => {
                products = products.concat(subcategory);
            });
        } else {
            products = menuData[category] || [];
        }

        cafeGrid.innerHTML = products.map(product => {
            const quantity = getOptionQuantityInCart(product.id, '');
            
            return `
                <div class="cafe-card" data-product-id="${product.id}">
                    <img src="${product.image}" alt="${product.name}" class="cafe-image">
                    <div class="cafe-content">
                        <h2 class="cafe-title">${product.name}</h2>
                        <p class="cafe-price">$${product.price ? product.price.toFixed(2) : '0.00'}</p>
                        <div class="cart-info" ${quantity > 0 ? '' : 'style="display: none;"'}>
                            <p class="cart-quantity">Amount in cart: ${quantity}</p>
                            <button class="remove-all-btn" data-id="${product.id}">
                                Remove all from cart
                            </button>
                        </div>
                        <p class="cafe-description">${product.description || product.servings}</p>
                        <div class="options-section">
                            ${renderOptions(product)}
                        </div>
                        <button class="add-to-cart-btn" data-id="${product.id}">
                            Add to Cart
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        addEventListeners();
        updateDynamicCartInfo();
    }
    
    function updateDynamicCartInfo() {
        document.querySelectorAll('.size-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const productId = e.target.id.replace('size-', '');
                const selectedSize = e.target.value;
                const quantity = getOptionQuantityInCart(productId, selectedSize);
                const infoContainer = document.querySelector(`.dynamic-cart-info[data-product-id="${productId}"]`);
                
                if (infoContainer && selectedSize && quantity > 0) {
                    infoContainer.innerHTML = `
                        <p class="cart-quantity">Amount of ${selectedSize} in cart: ${quantity}</p>
                        <button class="remove-all-btn" data-id="${productId}" data-size="${selectedSize}">
                            Remove all ${selectedSize} from cart
                        </button>
                    `;
                    
                    // Add click handler for the new remove button
                    const removeBtn = infoContainer.querySelector('.remove-all-btn');
                    removeBtn.onclick = () => removeAllFromCart(productId, selectedSize);
                } else {
                    infoContainer.innerHTML = '';
                }
            });
        });
    }
    
    function addEventListeners() {
        document.querySelectorAll('.remove-all-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.dataset.id;
                removeAllFromCart(productId);
            });
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.dataset.id;
                const product = findProductInAllCategories(productId);
                if (product) {
                    addToCart(product);
                }
            });
        });
    }

    // Initialize with all products
    renderCafeProducts('all');

    // Category filter listener
    document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
        renderCafeProducts(e.target.value);
    });
});
