document.addEventListener('DOMContentLoaded', () => {
    const cartContainers = document.querySelectorAll('.cart-items');
    const cartSummary = document.querySelector('.cart-summary');

    function updateCartCount() {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = cartItems.length;
        }
    }

    function displayCart() {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        
        // Early return if no items
        if (cartItems.length === 0) {
            document.querySelectorAll('.cart-items').forEach(container => {
                container.innerHTML = '<p>No items in this category</p>';
            });
            return;
        }
    
        // Combine duplicate items
        const combinedItems = cartItems.reduce((acc, item) => {
            const existingItem = acc.find(i => i.id === item.id && 
                JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions));
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                acc.push({ ...item, quantity: 1 });
            }
            return acc;
        }, []);
    
        // Categorize items
        const categorized = {
                bakery: combinedItems.filter(item => item.category === 'latin' || item.subCategory === 'pastelitos'),
                cafe: combinedItems.filter(item => item.category === 'drinks' || item.category === 'breakfast'),
                seasonal: combinedItems.filter(item => item.category === 'seasonal'), // Updated this line
                catering: combinedItems.filter(item => item.category === 'catering')
            };
        
    
        // Display items in their respective sections
        Object.entries(categorized).forEach(([category, items]) => {
            const container = document.querySelector(`#${category}-items .cart-items`);
            if (container) {
                container.innerHTML = items.length > 0 
        ? items.map(item => `
            <div class="cart-item" data-id="${item.id}">
    <div class="cart-item-main">
        <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-content">
            <div class="cart-item-header">
                <h3>${item.name}</h3>
                <button class="remove-item">×</button>
            </div>
            ${item.selectedOptions ? `
                <div class="selected-options">
                    ${Object.entries(item.selectedOptions)
                        .filter(([_, value]) => value)
                        .map(([key, value]) => `
                            <p class="option-detail">${key}: ${value}</p>
                        `).join('')}
                </div>
            ` : ''}
                        <p class="item-price">$${item.price.toFixed(2)}</p>
                        <div class="cart-item-controls">
                            <div class="quantity-controls">
                                <button class="quantity-btn minus">-</button>
                                <input type="number" class="quantity-input" value="${item.quantity}" min="0">
                                <button class="quantity-btn plus">+</button>
                            </div>
                            <p class="item-total">Total: $${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div class="item-notes">
                            ${item.note 
                                ? `<div class="note-content has-note">
                                     <p class="note-text">${item.note}</p>
                                     <button class="edit-note-btn">Edit Note</button>
                                   </div>`
                                : `<button class="add-note-btn">Add Note</button>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        `).join('')
        : '<p>No items in this category</p>';
}
        });
    
        updateCartSummary(combinedItems);
    }

    function updateCartSummary(items) {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.07;
        const total = subtotal + tax;

        const summaryContent = `
        <h2>Order Summary</h2>
        <div class="summary-line">
            <span>Subtotal</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-line">
            <span>Tax (7%)</span>
            <span>$${tax.toFixed(2)}</span>
        </div>
        <div class="summary-line total">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
        </div>
        <button class="checkout-btn">Proceed to Checkout</button>
    `;
    
    cartSummary.innerHTML = summaryContent;

    // Add the event listener after updating the content
    document.querySelector('.checkout-btn').addEventListener('click', () => {
        window.location.href = '/pages/checkout.html';
    });

    }

    function updateQuantity(itemId, newQuantity) {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        let updatedCart = [];

        if (newQuantity <= 0) {
            updatedCart = cartItems.filter(item => item.id !== itemId);
        } else {
            const itemToUpdate = cartItems.find(item => item.id === itemId);
            const currentQuantity = cartItems.filter(item => item.id === itemId).length;
            
            if (newQuantity > currentQuantity) {
                // Add items
                for (let i = 0; i < newQuantity - currentQuantity; i++) {
                    cartItems.push(itemToUpdate);
                }
                updatedCart = cartItems;
            } else {
                // Remove items
                let removed = 0;
                updatedCart = cartItems.filter(item => {
                    if (item.id === itemId && removed < currentQuantity - newQuantity) {
                        removed++;
                        return false;
                    }
                    return true;
                });
            }
        }

        localStorage.setItem('cartItems', JSON.stringify(updatedCart));
        displayCart();
        updateCartCount();
    }

    function removeNote(itemId) {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const updatedCart = cartItems.map(item => {
            if (item.id === itemId) {
                const { note, ...itemWithoutNote } = item;
                return itemWithoutNote;
            }
            return item;
        });
        
        localStorage.setItem('cartItems', JSON.stringify(updatedCart));
        displayCart();
    }

    function addProductNote(itemId) {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const cartItem = document.querySelector(`.cart-item[data-id="${itemId}"]`);
        const noteContent = cartItem.querySelector('.note-content');
        const currentNote = cartItems.find(item => item.id === itemId)?.note || '';
        
        const noteModal = document.createElement('div');
        noteModal.className = 'note-modal';
        noteModal.innerHTML = `
    <div class="note-modal-content">
        <h3>Add Note</h3>
        <textarea class="note-textarea" placeholder="Add special instructions...">${currentNote}</textarea>
        <div class="note-modal-buttons">
            <button class="remove-note">Remove Note</button>
            <div>
                <button class="save-note">Save</button>
                <button class="cancel-note">Cancel</button>
            </div>
        </div>
    </div>
`;
        
        document.body.appendChild(noteModal);
        
        const textarea = noteModal.querySelector('.note-textarea');
        textarea.focus();
        
        noteModal.querySelector('.save-note').addEventListener('click', () => {
            const noteText = textarea.value.trim();
            const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
            
            const updatedCart = cartItems.map(item => {
                if (item.id === itemId) {
                    return { ...item, note: noteText };
                }
                return item;
            });
            
            localStorage.setItem('cartItems', JSON.stringify(updatedCart));
            displayCart();
            noteModal.remove();
        });
        
        noteModal.querySelector('.cancel-note').addEventListener('click', () => {
            noteModal.remove();
        });

        noteModal.querySelector('.remove-note').addEventListener('click', () => {
            removeNote(itemId);
            noteModal.remove();
        });        
        
        noteModal.addEventListener('click', (e) => {
            if (e.target === noteModal) {
                noteModal.remove();
            }
        });
    }

    document.querySelector('.checkout-btn').addEventListener('click', () => {
        window.location.href = '../checkout.html';
    });

    // Event listeners for cart containers
    cartContainers.forEach(container => {
        container.addEventListener('click', (e) => {
            const cartItem = e.target.closest('.cart-item');
            if (!cartItem) return;
    
            const itemId = cartItem.dataset.id;
    
            if (e.target.classList.contains('add-note-btn') || e.target.classList.contains('edit-note-btn')) {
                addProductNote(itemId);
            } else if (e.target.classList.contains('note-text')) {
                removeNote(itemId);
            } else {
                const quantityInput = cartItem.querySelector('.quantity-input');
                let currentQuantity = parseInt(quantityInput.value);

                if (e.target.classList.contains('plus')) {
                    updateQuantity(itemId, currentQuantity + 1);
                } else if (e.target.classList.contains('minus')) {
                    updateQuantity(itemId, currentQuantity - 1);
                } else if (e.target.classList.contains('remove-item')) {
                    updateQuantity(itemId, 0);
                }
            }
        });
    });

    // Initialize cart display
    displayCart();
    updateCartCount();
});

function updateCart(item) {
    let cart = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // Add items based on quantity
    for (let i = 0; i < (item.quantity || 1); i++) {
        cart.push(item);
    }
    
    localStorage.setItem('cartItems', JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

// Simplify the addToCart function:
function addToCart(item) {
    updateCart(item);
}

function addCateringItem(item, sizeOption) {
    const cartItem = {
        id: sizeOption.id,
        name: item.name,
        price: sizeOption.price,
        category: item.category,
        subCategory: item.subCategory,
        image: item.image,
        description: item.description,
        servings: sizeOption.servings,
        size: sizeOption.size
    };
    
    updateCart(cartItem);
}