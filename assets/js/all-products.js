import { menuData } from '/data/menuData.js';

document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('productsGrid');
    const searchInput = document.getElementById('searchProducts');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    let allProducts = [];
    
    function createProductLink(product) {
        const categoryPages = {
            bakery: '/pages/menu/bakery.html',
            cafe: '/pages/menu/cafe.html',
            seasonal: '/pages/menu/seasonal.html',
            catering: '/pages/menu/catering.html'
        };
        
        return `${categoryPages[product.category]}#${product.id}`;
    }
    
    function renderProducts(products) {
        productsGrid.innerHTML = products.map(product => `
            <a href="${createProductLink(product)}" class="product-card" data-category="${product.category}">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <div class="hover-overlay">
                        <span class="order-now">Order Now</span>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-category">${product.category}</p>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <div class="product-options">
                        ${product.options ? Object.entries(product.options).map(([key, values]) => `
                            <p class="option-group">
                                <span class="option-label">${key}:</span> 
                                ${Array.isArray(values) ? values.join(', ') : values}
                            </p>
                        `).join('') : ''}
                    </div>
                </div>
            </a>
        `).join('');
    }
    
    // Rest of your existing fetch and filter logic
    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const filteredProducts = category === 'all' 
                ? allProducts 
                : allProducts.filter(product => product.category === category);
            
            renderProducts(filteredProducts);
        });
    });
    
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredProducts = allProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
        renderProducts(filteredProducts);
    });

    fetchAllProducts();
});
