import { menuData } from '/data/menuData.js';

document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.querySelector('#productsGrid'); // Match your HTML id
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.querySelector('#searchProducts');
    
    let currentFilter = 'all';
    let currentProducts = getAllProducts();

    // Filter button click handlers
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Apply filter
            currentFilter = button.dataset.category;
            filterAndRenderProducts();
        });
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        filterAndRenderProducts();
    });

    function filterAndRenderProducts() {
        let filteredProducts = currentProducts;
        
        // Add fade-out effect
        productsGrid.classList.add('fade-out');
        
        setTimeout(() => {
            // Apply filters
            if (currentFilter !== 'all') {
                filteredProducts = filteredProducts.filter(product => 
                    product.sourceCategory === currentFilter
                );
            }
            
            const searchTerm = searchInput.value.toLowerCase();
            if (searchTerm) {
                filteredProducts = filteredProducts.filter(product => 
                    product.name.toLowerCase().includes(searchTerm) || 
                    (product.description && product.description.toLowerCase().includes(searchTerm))
                );
            }
            
            // Update grid and fade back in
            productsGrid.innerHTML = filteredProducts.map(renderProductCard).join('');
            productsGrid.classList.remove('fade-out');
        }, 300);
    }

    // Initial render
    filterAndRenderProducts();


    function getAllProducts() {
        const products = [];
        
        // Cafe products
        ['breakfast', 'sandwiches'].forEach(category => {
            if (menuData[category]) {
                products.push(...menuData[category].map(product => ({
                    ...product,
                    sourceCategory: 'cafe'
                })));
            }
        });
        
        // Drinks need special handling due to subcategories
        if (menuData.drinks) {
            Object.values(menuData.drinks).forEach(subcategory => {
                products.push(...subcategory.map(product => ({
                    ...product,
                    sourceCategory: 'cafe'
                })));
            });
        }
        
        // Bakery products
        ['latinAmerican', 'desserts', 'breads', 'dryCase'].forEach(category => {
            if (menuData[category]) {
                products.push(...menuData[category].map(product => ({
                    ...product,
                    sourceCategory: 'bakery'
                })));
            }
        });
        
        // Seasonal products
        if (menuData.seasonal?.thanksgiving) {
            products.push(...menuData.seasonal.thanksgiving.map(product => ({
                ...product,
                sourceCategory: 'seasonal'
            })));
        }
        
        // Catering products
        if (menuData.catering) {
            ['partyPackages', 'meals', 'sides'].forEach(category => {
                if (menuData.catering[category]) {
                    products.push(...menuData.catering[category].map(product => ({
                        ...product,
                        sourceCategory: 'catering'
                    })));
                }
            });
            
            // Handle catering cakes separately due to structure
            if (menuData.catering.cakes) {
                Object.values(menuData.catering.cakes).forEach(cakeType => {
                    products.push(...cakeType.map(product => ({
                        ...product,
                        sourceCategory: 'catering'
                    })));
                });
            }
        }
        
        return products;
    }

    function createProductLink(product) {
        const categoryPages = {
            cafe: '/pages/menu/cafe.html',
            bakery: '/pages/menu/bakery.html',
            seasonal: '/pages/menu/seasonal.html',
            catering: '/pages/menu/catering.html'
        };
        
        return `${categoryPages[product.sourceCategory]}#product-${product.id}`;
    }

    
    function renderProductCard(product) {
        return `
            <a href="${createProductLink(product)}" class="product-card">
                <div class="product-image-container">
                    <img src="${product.image || '/assets/images/placeholder.jpg'}" 
                         alt="${product.name}" 
                         class="product-image">
                </div>
                
                <div class="product-content">
                    <h3 class="product-title">${product.name}</h3>
                    
                    ${product.description ? 
                        `<p class="product-description">${product.description}</p>` : 
                        '<p class="product-description">Delicious item from our menu</p>'
                    }
                    
                    <div class="product-details">
                        ${renderPrice(product)}
                        ${renderOptions(product)}
                        ${renderCategory(product)}
                    </div>
                </div>
            </a>
        `;
    }
    
    function renderPrice(product) {
        if (!product.price) return '<span class="price">Price upon request</span>';
        
        if (typeof product.price === 'object') {
            return `
                <div class="price-range">
                    ${Object.entries(product.price)
                        .map(([size, price]) => `<span>${size}: $${price}</span>`)
                        .join(' | ')}
                </div>
            `;
        }
        
        return `<span class="price">$${product.price}</span>`;
    }
    
    function renderOptions(product) {
        if (!product.options) return '';
        
        const options = Array.isArray(product.options) 
            ? product.options.join(', ')
            : Object.entries(product.options)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
                
        return `<div class="options">${options}</div>`;
    }
    
    function renderCategory(product) {
        return `<span class="category-tag">${product.sourceCategory}</span>`;
    }    

    function renderAllProducts() {
        const products = getAllProducts();
        productsGrid.innerHTML = products.map(renderProductCard).join('');
    }

    // Initialize
    renderAllProducts();
});
