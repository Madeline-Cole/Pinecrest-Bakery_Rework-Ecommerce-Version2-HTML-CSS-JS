// Dynamic path detection
const isGitHubPages = window.location.hostname.includes('github.io');
const repoName = isGitHubPages ? '/Pinecrest_Bakery_Site_Rework_Version_2-HTML-CSS-JS' : '';

document.addEventListener('DOMContentLoaded', function() {
    // Get the current path depth
    const pathPrefix = window.location.pathname.includes('/menu/') ? '../' : './';

    // Load navigation
    const navPlaceholder = document.getElementById('nav-placeholder');
    fetch(`${pathPrefix}nav.html`)
        .then(response => response.text())
        .then(data => {
            navPlaceholder.innerHTML = data;
            initializeHamburgerMenu();
            initializeMobileMenu();
            
            // Check if we're on the cart page
            const isCartPage = window.location.pathname.includes('cart.html');
            const cartCount = document.querySelector('.cart-count');
            
            if (isCartPage && cartCount) {
                cartCount.style.display = 'none';
            } else {
                updateCartCount();
            }
        })
        .catch(error => console.log('Nav loading error:', error));

    // Load footer
    fetch(`${pathPrefix}footer.html`)
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        });
});

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

    if (hamburger && mobileContent) {
        hamburger.addEventListener('click', () => {
            mobileContent.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
}