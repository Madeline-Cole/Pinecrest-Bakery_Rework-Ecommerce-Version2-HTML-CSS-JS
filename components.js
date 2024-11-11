document.addEventListener('DOMContentLoaded', () => {
    loadNav();
});

function loadNav() {
    const navPlaceholder = document.getElementById('nav-placeholder');
    fetch('../nav.html')
        .then(response => response.text())
        .then(data => {
            navPlaceholder.innerHTML = data;
            initializeHamburgerMenu();
            // Check if we're on the cart page
            const isCartPage = window.location.pathname.includes('cart.html');
            const cartCount = document.querySelector('.cart-count');
            
            if (isCartPage && cartCount) {
                cartCount.style.display = 'none';
            } else {
                // Update cart count after nav is loaded
                updateCartCount();
            }
        })
        .catch(error => console.log('Nav loading error:', error));
}

// Add this function to components.js
function updateCartCount() {
    const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = storedCart.length;
    });
}

function initializeHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLeft = document.querySelector('.nav-left ul');
    const navRight = document.querySelector('.nav-right ul');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLeft.classList.toggle('active');
            navRight.classList.toggle('active');
        });
    }
}

function initializeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileContent = document.querySelector('.mobile-menu-content');

    hamburger.addEventListener('click', () => {
        mobileContent.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', initializeMobileMenu);