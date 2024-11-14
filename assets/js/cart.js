function isUserSignedIn() {
    const currentUser = localStorage.getItem('currentUser');
    console.log('Current user:', currentUser); // This will help us verify the auth state
    return currentUser !== null;
}

function addOrderHistoryButton() {
    const cartHeader = document.querySelector('.cart-header');
    const button = document.createElement('button');
    button.className = 'order-history-btn';
    button.textContent = 'See Order History';
    
    button.addEventListener('click', () => {
        const signedIn = isUserSignedIn();
        console.log('Is signed in:', signedIn); // This will confirm our check
        
        if (signedIn) {
            window.location.href = '/pages/order-history.html';
        } else {
            showAuthModal();
        }
    });
    
    cartHeader.appendChild(button);
}


function showAuthModal() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="auth-modal-content">
            <h3>Sign In Required</h3>
            <p>Please sign in to view your order history</p>
            <div class="auth-modal-buttons">
                <button class="sign-in-btn">Sign In</button>
                <button class="return-btn">Return to Cart</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.sign-in-btn').onclick = () => {
        window.location.href = '/pages/auth.html';
    };
    
    modal.querySelector('.return-btn').onclick = () => {
        modal.remove();
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const cartContainers = document.querySelectorAll('.cart-items');
    const cartSummary = document.querySelector('.cart-summary');
    addOrderHistoryButton();

    function displayCart() {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        
        const combinedItems = cartItems.reduce((acc, item) => {
            const existingItemIndex = acc.findIndex(i => i.id === item.id);
            if (existingItemIndex >= 0) {
                acc[existingItemIndex].quantity += 1;
            } else {
                acc.push({ ...item, quantity: 1 });
            }
            return acc;
        }, []);
    
        const categorized = {
            bakery: combinedItems.filter(item => 
                item.category === 'bakery' || 
                item.category === 'latin' || 
                item.subCategory === 'pastelitos' || 
                item.subCategory === 'empanadas'
            ),
            cafe: combinedItems.filter(item => 
                item.category === 'cafe' || 
                item.category === 'drinks' || 
                item.category === 'breakfast' || 
                item.category === 'sandwiches'
            ),
            seasonal: combinedItems.filter(item => item.category === 'seasonal'),
            catering: combinedItems.filter(item => item.category === 'catering')
        };
    
        Object.entries(categorized).forEach(([category, items]) => {
            const container = document.querySelector(`#${category}-items .cart-items`);
            if (container) {
                // Check for existing menu button first
                const categoryHeader = container.closest(`#${category}-items`).querySelector('.category-title');
                if (categoryHeader && !categoryHeader.querySelector('.category-menu-btn')) {
                    const menuButton = document.createElement('button');
                    menuButton.className = 'category-menu-btn';
                    menuButton.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Menu`;
                    menuButton.onclick = () => {
                        window.location.href = `/pages/menu/${category}.html`;
                    };
                    categoryHeader.appendChild(menuButton);
                }
    
                container.innerHTML = items.length > 0 
                    ? items.map(item => renderCartItem(item)).join('')
                    : '<p>No items in this category</p>';
            }
        });
        
        updateCartSummary(combinedItems);
        updateCartCount();
    }    

    function renderCartItem(item) {
        return `
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
                        ${renderItemOptions(item)}
                        <p class="item-price">$${item.price.toFixed(2)}</p>
                        <div class="cart-item-controls">
                            <div class="quantity-controls">
                                <button class="quantity-btn minus">-</button>
                                <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                                <button class="quantity-btn plus">+</button>
                            </div>
                            <p class="item-total">$${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        ${renderItemNotes(item)}
                    </div>
                </div>
            </div>
        `;
    }

    function renderItemOptions(item) {
        if (!item.selectedOptions) return '';
        return `
            <div class="selected-options">
                ${Object.entries(item.selectedOptions)
                    .filter(([_, value]) => value)
                    .map(([key, value]) => `
                        <p class="option-detail">${key}: ${value}</p>
                    `).join('')}
            </div>
        `;
    }

    function renderItemNotes(item) {
        return `
            <div class="item-notes">
                ${item.note 
                    ? `<div class="note-content has-note">
                         <p class="note-text">${item.note}</p>
                         <button class="edit-note-btn">Edit Note</button>
                       </div>`
                    : `<button class="add-note-btn">Add Note</button>`
                }
            </div>
        `;
    }

    function updateCartSummary(items) {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.07;
        const total = subtotal + tax;

        cartSummary.innerHTML = `
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

        document.querySelector('.checkout-btn').addEventListener('click', () => {
            window.location.href = '/pages/checkout.html';
        });
    }

    function updateCartCount() {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = cartItems.length;
        }
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
                for (let i = 0; i < newQuantity - currentQuantity; i++) {
                    cartItems.push(itemToUpdate);
                }
                updatedCart = cartItems;
            } else {
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
        updateCartCount(); // Add this line
    }

    function addToCart(item) {
        if (item.sizes && item.sizes.length > 0) {
            const defaultSize = item.defaultSize || item.sizes[0].size;
            const sizeOption = item.sizes.find(s => s.size === defaultSize);
            
            const itemWithSize = {
                ...item,
                selectedSize: defaultSize,
                price: sizeOption.price,
                selectedOptions: {
                    size: defaultSize
                }
            };
            updateCart(itemWithSize);
        } else {
            updateCart(item);
        }
    }

    function updateCart(item) {
        let cart = JSON.parse(localStorage.getItem('cartItems')) || [];
        cart.push(item);
        localStorage.setItem('cartItems', JSON.stringify(cart));
        displayCart();
        updateCartCount();
    }

    function showNoteModal(itemId, existingNote = '') {
        const modal = document.createElement('div');
        modal.className = 'note-modal';
        modal.innerHTML = `
            <div class="note-modal-content">
                <h3>Add Note</h3>
                <textarea class="note-textarea">${existingNote}</textarea>
                <div class="note-modal-buttons">
                    <button class="cancel-note">Cancel</button>
                    <button class="save-note">Save Note</button>
                    ${existingNote ? '<button class="remove-note">Remove Note</button>' : ''}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    
        // Event listeners for modal buttons
        modal.querySelector('.cancel-note').onclick = () => modal.remove();
        modal.querySelector('.save-note').onclick = () => {
            const note = modal.querySelector('.note-textarea').value;
            updateItemNote(itemId, note);
            modal.remove();
        };
        
        if (existingNote) {
            modal.querySelector('.remove-note').onclick = () => {
                updateItemNote(itemId, '');
                modal.remove();
            };
        }
    }
    
    function updateItemNote(itemId, note) {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const updatedCart = cartItems.map(item => {
            if (item.id === itemId) {
                return { ...item, note };
            }
            return item;
        });
        localStorage.setItem('cartItems', JSON.stringify(updatedCart));
        displayCart();
    }

    // Event Listeners
    cartContainers.forEach(container => {
        container.addEventListener('click', (e) => {
            const cartItem = e.target.closest('.cart-item');
            if (!cartItem) return;

            const itemId = cartItem.dataset.id;
            const quantityInput = cartItem.querySelector('.quantity-input');
            const currentQuantity = parseInt(quantityInput?.value || 0);
            const noteText = cartItem.querySelector('.note-text')?.textContent || '';
            if (e.target.classList.contains('note-text')) {
                updateItemNote(itemId, '');
            }
            if (e.target.classList.contains('add-note-btn')) {
                showNoteModal(itemId);
            } else if (e.target.classList.contains('edit-note-btn')) {
                const noteText = cartItem.querySelector('.note-text').textContent;
                showNoteModal(itemId, noteText);
            }
            if (e.target.classList.contains('plus')) {
                updateQuantity(itemId, currentQuantity + 1);
                updateCartCount(); // Add this
            } else if (e.target.classList.contains('minus')) {
                updateQuantity(itemId, Math.max(0, currentQuantity - 1));
                updateCartCount(); // Add this
            } else if (e.target.classList.contains('remove-item')) {
                updateQuantity(itemId, 0);
                updateCartCount(); // Add this
            }
        });
    });

    // Initialize cart
    displayCart();
});