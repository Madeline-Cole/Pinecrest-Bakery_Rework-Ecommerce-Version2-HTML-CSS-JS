document.addEventListener('DOMContentLoaded', () => {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    let currentStep = 1;
    const totalSteps = 3;


    // Initialize page and step navigation
    function initializeCheckout() {
        displayOrderSummary();
        setupPickupForm();
        setupStepNavigation();
        updateProgressBar();
    }

    function completeOrder() {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const pickupDetails = getPickupDetails();
        
        // Save order to history
        saveOrderToHistory(cartItems, pickupDetails);
        
        // Clear cart
        localStorage.removeItem('cartItems');
        localStorage.removeItem('pickupDetails');
        
        // Redirect to confirmation page
        window.location.href = '/pages/order-confirmation.html';
    }


    function setupStepNavigation() {
        const existingButtonGroups = document.querySelectorAll('.button-group');
        existingButtonGroups.forEach(group => group.remove());
    
        const steps = document.querySelectorAll('.checkout-step');
        steps.forEach((step, index) => {
            step.style.display = index + 1 === currentStep ? 'block' : 'none';
        });
    
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'button-group';
        
        const returnToCartButton = createButton('Return to Cart', () => window.location.href = '/pages/cart.html', 'return-cart');
        buttonGroup.appendChild(returnToCartButton);
        
        if (currentStep > 1) {
            const prevButton = createButton('Previous', () => navigateStep(-1), 'prev-step');
            buttonGroup.appendChild(prevButton);
        }
        
        if (currentStep < totalSteps) {
            const nextButton = createButton('Next', () => validateAndNavigate(1), 'next-step');
            buttonGroup.appendChild(nextButton);
        } else {
            const completeButton = document.createElement('button');
            completeButton.textContent = 'Complete Order';
            completeButton.className = 'complete-order';
            completeButton.onclick = () => {
                if (validateCurrentStep()) {
                    handleOrderCompletion();
                }
            };
            buttonGroup.appendChild(completeButton);
        }
            
        const currentStepElement = document.querySelector(`#step${currentStep}`);
        currentStepElement.appendChild(buttonGroup);
    }    

    function createButton(text, onClick, className) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = className;
        button.addEventListener('click', onClick);
        return button;
    }


    function validateAndNavigate(direction) {
        if (validateCurrentStep()) {
            navigateStep(direction);
        }
    }


    function validateCurrentStep() {
        switch(currentStep) {
            case 1:
                // Check if cart has items
                return cartItems && cartItems.length > 0;
                
            case 2:
                // For regular items, we only need to validate basic pickup details
                const pickupType = determinePickupType(cartItems);
                if (pickupType.regularOnly) {
                    const regularDate = document.getElementById('regularDate');
                    const regularTime = document.getElementById('regularTime');
                    const pickupName = document.getElementById('pickupName');
                    
                    return pickupName.value && regularDate.value && regularTime.value;
                }
                return validatePickupDetails();
                
            case 3:
                return validatePaymentDetails();
                
            default:
                return true;
        }
    }    


    function validatePickupDetails() {
        const pickupType = determinePickupType(cartItems);
        
        if (pickupType.both) {
            const isCombined = document.getElementById('combinedPickup').checked;
            
            if (isCombined) {
                const combinedDate = document.getElementById('combinedDate');
                const combinedTime = document.getElementById('combinedTime');
                
                if (!combinedDate.value || !combinedTime.value) {
                    showError('Please select combined pickup date and time');
                    return false;
                }
                return true;
            } else {
                const regularDate = document.getElementById('regularDate');
                const regularTime = document.getElementById('regularTime');
                const specialDate = document.getElementById('specialDate');
                const specialTime = document.getElementById('specialTime');
                
                if (!regularDate.value || !regularTime.value || !specialDate.value || !specialTime.value) {
                    showError('Please select both regular and special pickup times');
                    return false;
                }
                return true;
            }
        } else {
            const dateInput = document.getElementById(pickupType.regularOnly ? 'regularDate' : 'specialDate');
            const timeInput = document.getElementById(pickupType.regularOnly ? 'regularTime' : 'specialTime');
            
            if (!dateInput.value || !timeInput.value) {
                showError('Please select pickup date and time');
                return false;
            }
            return true;
        }
    }    


    function validatePaymentDetails() {
        const requiredFields = ['cardName', 'cardNumber', 'expiry', 'cvv'];
        for (const field of requiredFields) {
            const input = document.getElementById(field);
            if (!input.value) {
                showError(`Please fill in ${field.replace('card', 'card ')}`);
                return false;
            }
        }
        return true;
    }


    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Remove any existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        const currentStepElement = document.querySelector(`#step${currentStep}`);
        currentStepElement.insertBefore(errorDiv, currentStepElement.firstChild);
        
        // Auto-remove after 3 seconds
        setTimeout(() => errorDiv.remove(), 3000);
    }


    function navigateStep(direction) {
        // Remove existing button group before updating step
        const existingButtonGroup = document.querySelector('.button-group');
        if (existingButtonGroup) {
            existingButtonGroup.remove();
        }
        
        currentStep += direction;
        updateProgressBar();
        
        // Update visibility of steps
        const steps = document.querySelectorAll('.checkout-step');
        steps.forEach((step, index) => {
            step.style.display = index + 1 === currentStep ? 'block' : 'none';
        });
        
        // Setup navigation for the new step
        setupStepNavigation();
    }


    function updateProgressBar() {
        const progressSteps = document.querySelectorAll('.progress-step');
        progressSteps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 <= currentStep);
        });
    }


    function handleOrderCompletion(event) {
        if (event) {
            event.preventDefault();
        }
        
        if (!validateCurrentStep()) {
            return;
        }
    
        const pickupDetails = getPickupDetails();
        const paymentDetails = {
            cardName: document.getElementById('cardName').value,
            cardNumber: document.getElementById('cardNumber').value,
            expiry: document.getElementById('expiry').value,
            cvv: document.getElementById('cvv').value
        };
    
        // Save order to history
        saveOrderToHistory(cartItems, pickupDetails);
        
        // Clear cart
        localStorage.removeItem('cartItems');
        localStorage.removeItem('pickupDetails');
        
        // Redirect to confirmation page
        window.location.href = '/pages/order-confirmation.html';
    }
    


    function saveOrderToHistory(order, pickupDetails) {
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
        
        const total = order.reduce((sum, item) => {
            return sum + (item.price * (item.quantity || 1));
        }, 0);
        
        const newOrder = {
            id: Date.now(),
            date: new Date().toISOString(),
            items: order.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1,
                category: item.category,
                image: item.image,
                options: item.selectedOptions || {},
                note: item.note || ''
            })),
            pickup: {
                date: pickupDetails.date,
                time: pickupDetails.time,
                name: pickupDetails.name
            },
            total: total,
            smsOptIn: pickupDetails.smsOptIn,
            phone: pickupDetails.phone
        };
        
        orderHistory.push(newOrder);
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    }
    


    // Core Cart Functions
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


    function categorizeItems(items) {
        const combined = combineCartItems(items);
        return {
            regular: {
                bakery: combined.filter(item => 
                    item.category !== 'seasonal' && 
                    item.category !== 'catering' && 
                    (item.category === 'latin' || item.subCategory === 'pastelitos')
                ),
                cafe: combined.filter(item => 
                    item.category !== 'seasonal' && 
                    item.category !== 'catering' && 
                    (item.category === 'drinks' || item.category === 'breakfast' || item.category === 'sandwiches')
                )
            },
            special: {
                catering: combined.filter(item => item.category === 'catering'),
                seasonal: combined.filter(item => item.category === 'seasonal')
            }
        };
    }


    function calculateOrderTotal(items) {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    // Display Functions
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


    function createCategoryHTML(title, items) {
        if (!items || items.length === 0) return '';
        return `
            <div class="category-section">
                <h4>${title}</h4>
                ${items.map(item => createItemHTML(item)).join('')}
            </div>
        `;
    }


    function displayOrderSummary() {
        const categorizedItems = categorizeItems(cartItems);
        const regularSummary = document.getElementById('regularItems');
        const specialSummary = document.getElementById('specialItems');


        regularSummary.innerHTML = `
            ${createCategoryHTML('Bakery Items', categorizedItems.regular.bakery)}
            ${createCategoryHTML('Cafe Items', categorizedItems.regular.cafe)}
            ${(!categorizedItems.regular.bakery.length && !categorizedItems.regular.cafe.length) 
                ? '<p class="empty-cart-message">No regular items in cart</p>' 
                : ''}
        `;


        specialSummary.innerHTML = `
            ${createCategoryHTML('Catering Items', categorizedItems.special.catering)}
            ${createCategoryHTML('Seasonal Items', categorizedItems.special.seasonal)}
            ${(!categorizedItems.special.catering.length && !categorizedItems.special.seasonal.length) 
                ? '<p class="empty-cart-message">No special items in cart</p>' 
                : ''}
        `;


        calculateAndDisplayTotals(categorizedItems);
    }


    function calculateAndDisplayTotals(categorizedItems) {
        const regularTotal = calculateOrderTotal([
            ...categorizedItems.regular.bakery,
            ...categorizedItems.regular.cafe
        ]);


        const specialTotal = calculateOrderTotal([
            ...categorizedItems.special.catering,
            ...categorizedItems.special.seasonal
        ]);


        document.getElementById('regularItems').insertAdjacentHTML('beforeend', 
            regularTotal > 0 ? `<div class="section-total">Subtotal: $${regularTotal.toFixed(2)}</div>` : '');
        document.getElementById('specialItems').insertAdjacentHTML('beforeend', 
            specialTotal > 0 ? `<div class="section-total">Subtotal: $${specialTotal.toFixed(2)}</div>` : '');
    }
    // Pickup Scheduling Functions
    function determinePickupType(cartItems) {
        const categorizedItems = categorizeItems(cartItems);
        const hasRegularItems = categorizedItems.regular.bakery.length > 0 || categorizedItems.regular.cafe.length > 0;
        const hasSpecialItems = categorizedItems.special.catering.length > 0 || categorizedItems.special.seasonal.length > 0;
        
        return {
            regularOnly: hasRegularItems && !hasSpecialItems,
            specialOnly: !hasRegularItems && hasSpecialItems,
            both: hasRegularItems && hasSpecialItems
        };
    }


    function setupPickupForm() {
        const pickupType = determinePickupType(cartItems);
        const pickupContainer = document.getElementById('pickup-container');
        
        const customerInfoHTML = `
        <div class="customer-info-section">
            <h3>Pickup Information</h3>
            <div class="form-group">
                <label for="pickupName">Name for Pickup *</label>
                <input type="text" id="pickupName" required>
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="smsOptIn">
                    Receive text notifications about your order
                </label>
            </div>
            <div class="form-group" id="phoneNumberGroup" style="display: none;">
                <label for="phoneNumber">Phone Number</label>
                <input type="tel" id="phoneNumber" pattern="[0-9]{10}" placeholder="(123) 456-7890">
            </div>
        </div>
    `;

        const now = new Date();
        const regularMinTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
        const specialMinTime = new Date(now.getTime() + 48 * 60 * 60000); // 48 hours from now
    
        let pickupHTML = '';
    
        if (pickupType.both) {
            pickupHTML = `
                <div class="pickup-options">
                    <h3>Select Pickup Option</h3>
                    <div class="pickup-choice">
                        <input type="radio" id="separatePickup" name="pickupChoice" value="separate" checked>
                        <label for="separatePickup">Separate Pickup Times</label>
                        
                        <input type="radio" id="combinedPickup" name="pickupChoice" value="combined">
                        <label for="combinedPickup">Combined Pickup (48hr notice required)</label>
                    </div>
    
                    <div id="separatePickupForms">
                        <div class="pickup-section">
                            <h4>Regular Items Pickup</h4>
                            <div class="form-group">
                                <label for="regularDate">Pickup Date</label>
                                <input type="date" id="regularDate" min="${regularMinTime.toISOString().split('T')[0]}" required>
                            </div>
                            <div class="form-group">
                                <label for="regularTime">Pickup Time</label>
                                <input type="time" id="regularTime" required>
                            </div>
                            <p class="time-notice">Minimum 30 minutes advance notice required</p>
                        </div>
    
                        <div class="pickup-section">
                            <h4>Special Items Pickup</h4>
                            <div class="form-group">
                                <label for="specialDate">Pickup Date</label>
                                <input type="date" id="specialDate" min="${specialMinTime.toISOString().split('T')[0]}" required>
                            </div>
                            <div class="form-group">
                                <label for="specialTime">Pickup Time</label>
                                <input type="time" id="specialTime" required>
                            </div>
                            <p class="time-notice">Minimum 48 hours advance notice required</p>
                        </div>
                    </div>
    
                    <div id="combinedPickupForm" style="display: none;">
                        <div class="pickup-section">
                            <h4>Combined Pickup</h4>
                            <div class="form-group">
                                <label for="combinedDate">Pickup Date</label>
                                <input type="date" id="combinedDate" min="${specialMinTime.toISOString().split('T')[0]}" required>
                            </div>
                            <div class="form-group">
                                <label for="combinedTime">Pickup Time</label>
                                <input type="time" id="combinedTime" required>
                            </div>
                            <p class="time-notice">Minimum 48 hours advance notice required</p>
                        </div>
                    </div>
                </div>
            `;
        } else if (pickupType.regularOnly) {
            pickupHTML = `
                <div class="pickup-section">
                    <h3>Regular Pickup</h3>
                    <div class="form-group">
                        <label for="regularDate">Pickup Date</label>
                        <input type="date" id="regularDate" min="${regularMinTime.toISOString().split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label for="regularTime">Pickup Time</label>
                        <input type="time" id="regularTime" required>
                    </div>
                    <p class="time-notice">Minimum 30 minutes advance notice required</p>
                </div>
            `;
        } else if (pickupType.specialOnly) {
            pickupHTML = `
                <div class="pickup-section">
                    <h3>Special Order Pickup</h3>
                    <div class="form-group">
                        <label for="specialDate">Pickup Date</label>
                        <input type="date" id="specialDate" min="${specialMinTime.toISOString().split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label for="specialTime">Pickup Time</label>
                        <input type="time" id="specialTime" required>
                    </div>
                    <p class="time-notice">Minimum 48 hours advance notice required</p>
                </div>
            `;
        }
    
       // Combine customer info with existing pickup form HTML
    pickupContainer.innerHTML = customerInfoHTML + pickupHTML;

    // Add event listener for SMS opt-in checkbox
    const smsOptIn = document.getElementById('smsOptIn');
    const phoneNumberGroup = document.getElementById('phoneNumberGroup');
    
    smsOptIn.addEventListener('change', (e) => {
        phoneNumberGroup.style.display = e.target.checked ? 'block' : 'none';
        document.getElementById('phoneNumber').required = e.target.checked;
    });
        
        // Add radio button event listeners if both types exist
        if (pickupType.both) {
            const separatePickup = document.getElementById('separatePickup');
            const combinedPickup = document.getElementById('combinedPickup');
            const separateForms = document.getElementById('separatePickupForms');
            const combinedForm = document.getElementById('combinedPickupForm');
    
            separatePickup.addEventListener('change', () => {
                separateForms.style.display = 'block';
                combinedForm.style.display = 'none';
            });
    
            combinedPickup.addEventListener('change', () => {
                separateForms.style.display = 'none';
                combinedForm.style.display = 'block';
            });
        }
    
        addPickupTimeValidation();
    }


        // Validation and Event Handling Functions
        function addPickupTimeValidation() {
            const regularDate = document.getElementById('regularDate');
            const regularTime = document.getElementById('regularTime');
            const specialDate = document.getElementById('specialDate');
            const specialTime = document.getElementById('specialTime');
    
            if (regularDate && regularTime) {
                regularDate.addEventListener('change', () => validatePickupTime(regularDate, regularTime, 0.5));
                regularTime.addEventListener('change', () => validatePickupTime(regularDate, regularTime, 0.5));
            }
    
            if (specialDate && specialTime) {
                specialDate.addEventListener('change', () => validatePickupTime(specialDate, specialTime, 48));
                specialTime.addEventListener('change', () => validatePickupTime(specialDate, specialTime, 48));
            }
        }
    
        function validatePickupTime(dateInput, timeInput, minHours) {
            const selectedDateTime = new Date(`${dateInput.value} ${timeInput.value}`);
            const minDateTime = new Date(Date.now() + minHours * 60 * 60000);
            
            if (selectedDateTime < minDateTime) {
                timeInput.setCustomValidity(`Pickup must be at least ${minHours} hours from now`);
            } else {
                timeInput.setCustomValidity('');
            }
        }
    
        function getPickupDetails() {
            const pickupType = determinePickupType(cartItems);
            let pickupDetails = {};

            const originalGetPickupDetails = getPickupDetails;
            getPickupDetails = function() {
                const details = originalGetPickupDetails();
                details.pickupName = document.getElementById('pickupName').value;
                details.smsOptIn = document.getElementById('smsOptIn').checked;
                details.phoneNumber = document.getElementById('smsOptIn').checked ? 
                    document.getElementById('phoneNumber').value : null;
                return details;
            };
        
            // Add validation for pickup name
            const pickupName = document.getElementById('pickupName');
            pickupName.addEventListener('input', () => {
                if (!pickupName.value.trim()) {
                    pickupName.setCustomValidity('Please enter a name for pickup');
                } else {
                    pickupName.setCustomValidity('');
                }
            });
        
            if (pickupType.both) {
                const isCombined = document.getElementById('combinedPickup').checked;
                
                if (isCombined) {
                    pickupDetails = {
                        date: document.getElementById('combinedDate').value,
                        time: document.getElementById('combinedTime').value,
                        isCombined: true
                    };
                } else {
                    pickupDetails = {
                        regular: {
                            date: document.getElementById('regularDate').value,
                            time: document.getElementById('regularTime').value
                        },
                        special: {
                            date: document.getElementById('specialDate').value,
                            time: document.getElementById('specialTime').value
                        },
                        isCombined: false
                    };
                }
            } else if (pickupType.regularOnly) {
                pickupDetails = {
                    date: document.getElementById('regularDate').value,
                    time: document.getElementById('regularTime').value,
                    type: 'regular'
                };
            } else if (pickupType.specialOnly) {
                pickupDetails = {
                    date: document.getElementById('specialDate').value,
                    time: document.getElementById('specialTime').value,
                    type: 'special'
                };
            }
        
            pickupDetails.name = document.getElementById('cardName').value;
            return pickupDetails;
        }        
        
        // Enhanced order confirmation modal
    function showOrderConfirmation(order, pickupDetails) {
        const modal = document.createElement('div');
        modal.className = 'confirmation-modal';
        modal.innerHTML = `
            <div class="confirmation-content">
                <h2>Order Summary</h2>
                <div class="confirmation-sections">
                    ${generateOrderSummaryHTML(order)}
                    ${generatePickupDetailsHTML(pickupDetails)}
                    <div class="notification-section">
                        <h3>Order Notifications</h3>
                        <label class="sms-checkbox">
                            <input type="checkbox" id="smsOptIn">
                            <span>Get SMS updates about your order</span>
                        </label>
                        <div id="phoneInput" class="phone-input" style="display: none;">
                            <input type="tel" id="phone" placeholder="(123) 456-7890" pattern="[0-9]{10}">
                        </div>
                    </div>
                </div>
                <div class="confirmation-buttons">
                    <button id="editOrder" class="secondary-button">Edit Order</button>
                    <button id="confirmOrder" class="primary-button">Place Order</button>
                </div>
            </div>
        `;


        document.body.appendChild(modal);
        setupConfirmationListeners(modal, order, pickupDetails);
    }


    // Initialize the checkout process
    initializeCheckout();
});