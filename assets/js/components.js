document.addEventListener('DOMContentLoaded', function() {
    // Determine if we're on GitHub Pages or local
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    // Set the base path accordingly
    const basePath = isGitHubPages 
        ? '/Pinecrest_Bakery_Site_Rework_Version_2-HTML-CSS-JS'
        : '';

    // Load navigation
    const navPlaceholder = document.getElementById('nav-placeholder');
    fetch(`${basePath}/components/nav.html`)
        .then(response => response.text())
        .then(data => {
            navPlaceholder.innerHTML = data;
            initializeHamburgerMenu();
            initializeMobileMenu();
            
            const isCartPage = window.location.pathname.includes('cart.html');
            const cartCount = document.querySelector('.cart-count');
            
            if (isCartPage && cartCount) {
                cartCount.style.display = 'none';
            } else {
                updateCartCount();
            }
        });

    // Load footer
    fetch(`${basePath}/components/footer.html`)
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