import { menuData } from '/data/menuData.js';

document.addEventListener('DOMContentLoaded', () => {
    const seasonalGrid = document.querySelector('.seasonal-products');
    // Get the product ID from the URL hash
    const productId = window.location.hash.replace('#product-', '');
    
if (productId) {
    // Add small delay to ensure products are rendered
    setTimeout(() => {
        const productElement = document.querySelector(`[data-product-id="${productId}"]`);
        if (productElement) {
            productElement.scrollIntoView({ behavior: 'smooth' });
            productElement.classList.add('highlight');
        }
    }, 100);
}
    
    function renderOptions(product) {
        let optionsHTML = '';
        
        if (product.options) {
            optionsHTML += `
                <div class="option-group">
                    <label for="option-${product.id}">Choose your option:</label>
                    <select class="option-select" id="option-${product.id}" required>
                        <option value="">Select an option</option>
                        ${product.options.map(option => `
                            <option value="${option}">${option}</option>
                        `).join('')}
                    </select>
                </div>
            `;
        }
        
        if (product.appetizers && product.pies) {
            optionsHTML += `
                <div class="option-group">
                    <label for="appetizer-${product.id}">Choose your appetizer:</label>
                    <select class="appetizer-select" id="appetizer-${product.id}" required>
                        <option value="">Select an appetizer</option>
                        ${product.appetizers.map(app => `
                            <option value="${app}">${app}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="option-group">
                    <label for="pie-${product.id}">Choose your pie:</label>
                    <select class="pie-select" id="pie-${product.id}" required>
                        <option value="">Select a pie</option>
                        ${product.pies.map(pie => `
                            <option value="${pie}">${pie}</option>
                        `).join('')}
                    </select>
                </div>
            `;
        }
        
        if (product.breadOptions) {
            optionsHTML += `
                <div class="option-group">
                    <label for="bread-${product.id}">Choose your bread:</label>
                    <select class="bread-select" id="bread-${product.id}" required>
                        <option value="">Select bread type</option>
                        ${product.breadOptions.map(bread => `
                            <option value="${bread}">${bread}</option>
                        `).join('')}
                    </select>
                </div>
                <p class="includes">${product.includes}</p>
                <p class="flavors">${product.flavors}</p>
            `;
        }
        
        return optionsHTML;
    }    

    function addEventListeners() {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.dataset.id;
                const product = menuData.seasonal.thanksgiving.find(p => p.id === productId);
                if (product) {
                    addToCart(product);
                }
            });
        });
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

    function addToCart(product) {
        // Validate option selection
        const selectedOption = document.querySelector(`#option-${product.id}`)?.value;
        const selectedAppetizer = document.querySelector(`#appetizer-${product.id}`)?.value;
        const selectedPie = document.querySelector(`#pie-${product.id}`)?.value;
        const selectedBread = document.querySelector(`#bread-${product.id}`)?.value;
    
        // Check if required options are selected
        if (product.options && !selectedOption) {
            alert('Please select an option before adding to cart');
            return;
        }
    
        // Create unique ID based on product and selections
        const uniqueId = `${product.id}-${selectedOption || ''}-${selectedAppetizer || ''}-${selectedPie || ''}-${selectedBread || ''}`;
    
        const cartItem = {
            id: uniqueId,
            baseId: product.id,
            name: `${product.name} - ${selectedOption || selectedPie || selectedBread || ''}`,
            price: product.price,
            image: product.image,
            category: 'seasonal',
            description: product.description,
            selectedOptions: {
                option: selectedOption,
                appetizer: selectedAppetizer,
                pie: selectedPie,
                bread: selectedBread
            }
        };
    
        const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
        cart.push(cartItem);
        localStorage.setItem('cartItems', JSON.stringify(cart));
        updateCartCount();
        showAddedToCartMessage(cartItem.name);
    }    

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = cart.length;
        });
    }

    function showAddedToCartMessage(itemName) {
        const message = document.createElement('div');
        message.className = 'cart-message';
        message.textContent = `${itemName} added to cart`;
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 3000);
    }

    function renderSeasonalProducts() {
        const products = menuData.seasonal.thanksgiving;
        seasonalGrid.innerHTML = products.map(product => `
            <div class="seasonal-card" data-product-id="${product.id}">
                <div class="seasonal-badge">
                    <span class="sold-count">${product.soldCount} sold</span>
                    <span class="timeframe">in last ${product.soldTimeframe} hours</span>
                </div>
                
                <img src="${product.image}" alt="${product.name}" class="seasonal-image">
                
                <div class="seasonal-content">
                    <h2 class="seasonal-title">${product.name}</h2>
                    <p class="seasonal-price">$${product.price.toFixed(2)}</p>
                    <p class="seasonal-description">${product.description}</p>
                    
                    <div class="options-section">
                        ${renderOptions(product)}
                    </div>
                    
                    <button class="add-to-cart-btn" data-id="${product.id}">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
        
        addEventListeners();
    }    
    
    renderSeasonalProducts();
});
