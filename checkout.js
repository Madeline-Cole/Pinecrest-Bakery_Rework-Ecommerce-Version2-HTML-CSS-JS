document.addEventListener('DOMContentLoaded', () => {
    // Get cart items from localStorage
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    // Add these functions at the beginning of your checkout.js file
    function saveOrderToHistory(order) {
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
        
        const newOrder = {
            id: Date.now(),
            date: new Date().toISOString(),
            items: order.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1,
                category: item.category,
                image: item.image
            })),
            total: order.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
        };
        
        orderHistory.push(newOrder);
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    }

function calculateOrderTotal(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Add this to handle order completion
document.getElementById('payment-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const currentCart = JSON.parse(localStorage.getItem('cartItems')) || [];
    if (currentCart.length > 0) {
        // Save order before clearing cart
        saveOrderToHistory(currentCart);
        
        // Clear the cart
        localStorage.removeItem('cartItems');
        
        // Redirect to confirmation page
        window.location.href = 'order-confirmation.html';
    }
});

    function handleCombinePickup() {
        const regularPickup = document.getElementById('regularPickup');
        const specialPickup = document.getElementById('specialPickup');
        const combinePickupCheckbox = document.getElementById('combinePickup');
    
        if (combinePickupCheckbox.checked) {
            regularPickup.style.display = 'none';
            specialPickup.querySelector('h3').textContent = 'Combined Pickup';
            
            // Set minimum date for combined pickup to 48 hours
            const now = new Date();
            const minDate = new Date(now.getTime() + 48 * 60 * 60000);
            document.getElementById('specialDate').min = minDate.toISOString().split('T')[0];
        } else {
            regularPickup.style.display = 'block';
            specialPickup.querySelector('h3').textContent = 'Catering & Seasonal Items Pickup';
            
            // Reset minimum dates
            setMinDates();
        }
    }
    
    // Function to combine duplicate items and add quantities
    function combineCartItems(items) {
        return items.reduce((acc, item) => {
            const existingItem = acc.find(i => i.id === item.id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                acc.push({ ...item, quantity: 1 });
            }
            return acc;
        }, []);
    }

    // Function to categorize items
    function categorizeItems(items) {
        const combined = combineCartItems(items);
        
        return {
            regular: {
                bakery: combined.filter(item => 
                    !item.seasonal && 
                    item.category !== 'catering' && 
                    (item.category === 'latin' || item.subCategory === 'pastelitos')
                ),
                cafe: combined.filter(item => 
                    !item.seasonal && 
                    item.category !== 'catering' && 
                    (item.category === 'drinks' || item.category === 'breakfast')
                )
            },
            special: {
                catering: combined.filter(item => item.category === 'catering'),
                seasonal: combined.filter(item => item.seasonal)
            }
        };
    }

    // Function to create HTML for a single item
    function createItemHTML(item) {
        return `
            <div class="order-item">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='../images/placeholder.jpg'">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p class="item-price">$${item.price.toFixed(2)} × ${item.quantity}</p>
                    <p class="item-subtotal">Subtotal: $${(item.price * item.quantity).toFixed(2)}</p>
                    ${item.note ? `<p class="item-note">Note: ${item.note}</p>` : ''}
                </div>
            </div>
        `;
    }

    // Function to create category section HTML
    function createCategoryHTML(title, items) {
        if (!items || items.length === 0) return '';
        
        return `
            <div class="category-section">
                <h4>${title}</h4>
                ${items.map(item => createItemHTML(item)).join('')}
            </div>
        `;
    }

    // Function to display order summary
    function displayOrderSummary() {
        const categorizedItems = categorizeItems(cartItems);
        const regularSummary = document.getElementById('regularItems');
        const specialSummary = document.getElementById('specialItems');

        // Display regular items
        regularSummary.innerHTML = `
            ${createCategoryHTML('Bakery Items', categorizedItems.regular.bakery)}
            ${createCategoryHTML('Cafe Items', categorizedItems.regular.cafe)}
            ${(!categorizedItems.regular.bakery.length && !categorizedItems.regular.cafe.length) 
                ? '<p class="empty-cart-message">No regular items in cart</p>' 
                : ''}
        `;

        // Display special items
        specialSummary.innerHTML = `
            ${createCategoryHTML('Catering Items', categorizedItems.special.catering)}
            ${createCategoryHTML('Seasonal Items', categorizedItems.special.seasonal)}
            ${(!categorizedItems.special.catering.length && !categorizedItems.special.seasonal.length) 
                ? '<p class="empty-cart-message">No special items in cart</p>' 
                : ''}
        `;

        // Calculate and display totals
        calculateAndDisplayTotals(categorizedItems);
    }

    // Function to calculate and display totals
    function calculateAndDisplayTotals(categorizedItems) {
        const calculateTotal = items => items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0);

        const regularTotal = calculateTotal([
            ...categorizedItems.regular.bakery,
            ...categorizedItems.regular.cafe
        ]);

        const specialTotal = calculateTotal([
            ...categorizedItems.special.catering,
            ...categorizedItems.special.seasonal
        ]);

        const totalHTML = `
            <div class="order-totals">
                <div class="subtotal-line">
                    <span>Regular Items Subtotal:</span>
                    <span>$${regularTotal.toFixed(2)}</span>
                </div>
                <div class="subtotal-line">
                    <span>Special Items Subtotal:</span>
                    <span>$${specialTotal.toFixed(2)}</span>
                </div>
                <div class="total-line">
                    <span>Total:</span>
                    <span>$${(regularTotal + specialTotal).toFixed(2)}</span>
                </div>
            </div>
        `;

        // Add totals to the bottom of each section
        document.getElementById('regularItems').insertAdjacentHTML('beforeend', 
            regularTotal > 0 ? `<div class="section-total">Subtotal: $${regularTotal.toFixed(2)}</div>` : '');
        document.getElementById('specialItems').insertAdjacentHTML('beforeend', 
            specialTotal > 0 ? `<div class="section-total">Subtotal: $${specialTotal.toFixed(2)}</div>` : '');
    }

    // Initialize the display
    displayOrderSummary();

    // Event listener for cart updates
    document.getElementById('combinePickup').addEventListener('change', handleCombinePickup);
    
    window.addEventListener('storage', (e) => {
        if (e.key === 'cartItems') {
            cartItems = JSON.parse(e.newValue) || [];
            displayOrderSummary();
        }
    });
});