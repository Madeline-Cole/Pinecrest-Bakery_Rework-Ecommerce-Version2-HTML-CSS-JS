import { menuData } from '../menuData.js';

document.addEventListener('DOMContentLoaded', () => {
    const cateringItems = menuData.catering.meals;
    
    function displayCateringItems() {
        const cateringSection = document.querySelector('.package-grid');
        
        cateringSection.innerHTML = cateringItems.map(item => `
            <div class="catering-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="catering-image">
                <div class="catering-details">
                    <h3>${item.name}</h3>
                    <p class="description">${item.description}</p>
                    
                    <div class="size-options">
                        ${item.options.map(option => `
                            <div class="size-option">
                                <input type="radio" 
                                    id="${option.id}" 
                                    name="size-${item.id}" 
                                    value="${option.id}"
                                    data-price="${option.price}"
                                    data-size="${option.size}">
                                <label for="${option.id}">
                                    <span class="size-name">${option.size}</span>
                                    <span class="price">$${option.price.toFixed(2)}</span>
                                    <span class="servings">${option.servings}</span>
                                </label>
                            </div>
                        `).join('')}
                    </div>
                    
                    <button class="add-to-cart-btn" data-id="${item.id}">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        addCateringEventListeners();
        document.querySelector('.checkout-btn').addEventListener('click', () => {
            window.location.href = '../checkout.html';
        });
    }

    function addCateringEventListeners() {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', handleAddToCart);
        });
    }

    function handleAddToCart(e) {
        const itemId = e.target.dataset.id;
        const itemContainer = e.target.closest('.catering-item');
        const selectedSize = itemContainer.querySelector('input[type="radio"]:checked');

        if (!selectedSize) {
            alert('Please select a size option');
            return;
        }

        const cateringItem = cateringItems.find(item => item.id === itemId);
        const selectedOption = cateringItem.options.find(opt => opt.id === selectedSize.value);

        const cartItem = {
            id: selectedOption.id,
            name: `${cateringItem.name} - ${selectedOption.size}`,
            price: selectedOption.price,
            category: 'catering',
            image: cateringItem.image,
            description: cateringItem.description,
            servings: selectedOption.servings,
            requiresAdvanceNotice: true
        };

        addToCart(cartItem);
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

    // Initialize
    displayCateringItems();
    updateCartCount();
});
