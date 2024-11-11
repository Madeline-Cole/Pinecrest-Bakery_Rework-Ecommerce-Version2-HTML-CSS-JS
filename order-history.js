document.addEventListener('DOMContentLoaded', () => {
    displayOrderHistory();

    // Add modal HTML to the page
    document.body.insertAdjacentHTML('beforeend', `
        <div id="reorderModal" class="modal">
            <div class="modal-content">
                <h2>Reorder Items</h2>
                <div id="reorderItems"></div>
                <div class="modal-footer">
                    <button id="addToCartBtn">Add Selected Items to Cart</button>
                    <button id="cancelReorderBtn">Cancel</button>
                </div>
            </div>
        </div>
    `);

    function displayOrderHistory() {
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
        const container = document.getElementById('order-history-container');
        
        if (orderHistory.length === 0) {
            container.innerHTML = '<p class="no-orders">No previous orders found</p>';
            return;
        }
        
        const ordersHTML = orderHistory.reverse().map(order => {
            const total = order.total || 0;
            const items = Array.isArray(order.items) ? order.items : 
                         order.items?.regular?.bakery?.concat(order.items?.regular?.cafe || [])
                         .concat(order.items?.special?.catering || [])
                         .concat(order.items?.special?.seasonal || []) || [];
            
                         // Combine duplicate items
        const combinedItems = items.reduce((acc, item) => {
            const existingItem = acc.find(i => i.name === item.name && i.price === item.price);
            if (existingItem) {
                existingItem.quantity += (item.quantity || 1);
            } else {
                acc.push({ ...item, quantity: item.quantity || 1 });
            }
            return acc;
        }, []);
        return `
        <div class="order-card">
            <div class="order-header">
                <h3>Order #${order.id}</h3>
                <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
            </div>
            <div class="order-items">
                ${combinedItems.map(item => `
                    <div class="order-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <span class="order-total">Total: $${total.toFixed(2)}</span>
                <button class="reorder-btn" data-order-id="${order.id}">Order Again</button>
            </div>
        </div>
    `;
}).join('');

        
        container.innerHTML = ordersHTML;
    }

    function updateItemPrice(itemElement, quantity) {
        const item = JSON.parse(itemElement.querySelector('input[type="checkbox"]').dataset.item);
        const priceElement = itemElement.querySelector('.item-price');
        priceElement.textContent = `$${((item.price || 0) * quantity).toFixed(2)}`;
    }

    function updateTotalPrice() {
        const selectedItems = document.querySelectorAll('#reorderItems input[type="checkbox"]:checked');
        const total = Array.from(selectedItems).reduce((sum, checkbox) => {
            const item = JSON.parse(checkbox.dataset.item);
            const quantity = parseInt(checkbox.closest('.reorder-item').querySelector('.quantity').textContent);
            return sum + (item.price * quantity);
        }, 0);

        const totalElement = document.querySelector('.modal-total');
        if (totalElement) {
            totalElement.textContent = `Total: $${total.toFixed(2)}`;
        }
    }

    function showReorderModal(orderId) {
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
        const order = orderHistory.find(o => o.id === parseInt(orderId));
        const modal = document.getElementById('reorderModal');
        const itemsContainer = document.getElementById('reorderItems');
        
        const items = Array.isArray(order.items) ? order.items : 
                     order.items?.regular?.bakery?.concat(order.items?.regular?.cafe || [])
                     .concat(order.items?.special?.catering || [])
                     .concat(order.items?.special?.seasonal || []) || [];
    
        // Combine duplicate items
        const combinedItems = items.reduce((acc, item) => {
            const existingItem = acc.find(i => i.name === item.name && i.price === item.price);
            if (existingItem) {
                existingItem.quantity += (item.quantity || 1);
            } else {
                acc.push({ ...item, quantity: item.quantity || 1 });
            }
            return acc;
        }, []);
    
        itemsContainer.innerHTML = `
            ${combinedItems.map(item => `
                <div class="reorder-item">
                    <label class="checkbox-container">
                        <input type="checkbox" checked data-item='${JSON.stringify(item)}'>
                        <span class="checkmark"></span>
                    </label>
                    <span class="item-name">${item.name}</span>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus">+</button>
                    </div>
                    <span class="item-price">$${((item.price || 0) * item.quantity).toFixed(2)}</span>
                </div>
            `).join('')}
            <div class="modal-total">Total: $${order.total || 0}</div>
        `;
    
        modal.style.display = 'block';
        updateTotalPrice();
    }
    
    function handleQuantityUpdate(button) {
        const reorderItem = button.closest('.reorder-item');
        const quantitySpan = reorderItem.querySelector('.quantity');
        const checkbox = reorderItem.querySelector('input[type="checkbox"]');
        let quantity = parseInt(quantitySpan.textContent);
        
        if (button.classList.contains('plus')) {
            quantity += 1;
            checkbox.checked = true;
        } else if (button.classList.contains('minus')) {
            quantity = Math.max(0, quantity - 1);
            checkbox.checked = quantity > 0;
        }
        
        quantitySpan.textContent = quantity;
        
        const itemData = JSON.parse(checkbox.dataset.item);
        itemData.quantity = quantity;
        checkbox.dataset.item = JSON.stringify(itemData);
        
        updateItemPrice(reorderItem, quantity);
        updateTotalPrice();
    }
    
    // Add this new event listener for checkbox changes
    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const reorderItem = e.target.closest('.reorder-item');
            const quantitySpan = reorderItem.querySelector('.quantity');
            
            if (e.target.checked) {
                const itemData = JSON.parse(e.target.dataset.item);
                quantitySpan.textContent = itemData.quantity || 1;
            } else {
                quantitySpan.textContent = '0';
            }
            
            updateItemPrice(reorderItem, parseInt(quantitySpan.textContent));
            updateTotalPrice();
        }
    });
    

    // Event delegation for all click events
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('reorder-btn')) {
            const orderId = e.target.dataset.orderId;
            showReorderModal(orderId);
        }

        if (e.target.classList.contains('quantity-btn')) {
            handleQuantityUpdate(e.target);
        }

        if (e.target.id === 'cancelReorderBtn') {
            document.getElementById('reorderModal').style.display = 'none';
        }
    });

    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            updateTotalPrice();
        }
    });

    document.getElementById('addToCartBtn').addEventListener('click', handleAddToCart);
});

function handleQuantityUpdate(button) {
    const reorderItem = button.closest('.reorder-item');
    const quantitySpan = reorderItem.querySelector('.quantity');
    const checkbox = reorderItem.querySelector('input[type="checkbox"]');
    let quantity = parseInt(quantitySpan.textContent);
    
    if (button.classList.contains('plus')) {
        quantity += 1;
    } else if (button.classList.contains('minus') && quantity > 1) {
        quantity -= 1;
    }
    
    quantitySpan.textContent = quantity;
    
    const itemData = JSON.parse(checkbox.dataset.item);
    itemData.quantity = quantity;
    checkbox.dataset.item = JSON.stringify(itemData);
    
    updateItemPrice(reorderItem, quantity);
    updateTotalPrice();
}

function handleAddToCart() {
    const selectedItems = Array.from(document.querySelectorAll('#reorderItems input[type="checkbox"]:checked'))
        .map(checkbox => {
            const itemData = JSON.parse(checkbox.dataset.item);
            const quantityElement = checkbox.closest('.reorder-item').querySelector('.quantity');
            return {
                ...itemData,
                quantity: parseInt(quantityElement.textContent)
            };
        });

    const currentCart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const updatedCart = [...currentCart];
    
    selectedItems.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
            updatedCart.push({ ...item, quantity: 1 });
        }
    });

    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    document.getElementById('reorderModal').style.display = 'none';
    alert('Items added to cart!');
    window.location.href = '../cart.html';
}
