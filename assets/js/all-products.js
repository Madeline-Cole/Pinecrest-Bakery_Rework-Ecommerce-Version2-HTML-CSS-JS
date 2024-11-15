import { menuData } from '/data/menuData.js';

document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.querySelector('#productsGrid'); // Match your HTML id

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
                    <img src="${product.image || '/assets/images/placeholder.jpg'}" alt="${product.name}" class="product-image">
                    <div class="hover-overlay">
                        <span class="order-now">View Details</span>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-category">${product.sourceCategory}</p>
                    <p class="product-description">${product.description || ''}</p>
                    <p class="product-price">${product.price ? `$${product.price.toFixed(2)}` : 'Price Varies'}</p>
                    ${renderProductOptions(product)}
                </div>
            </a>
        `;
    }
    
    function renderProductOptions(product) {
        if (!product.options) return '';
        
        if (Array.isArray(product.options)) {
            return `
                <div class="product-options">
                    <p>Options: ${product.options.join(', ')}</p>
                </div>
            `;
        }
        
        return `
            <div class="product-options">
                ${Object.entries(product.options).map(([key, value]) => `
                    <p><strong>${key}:</strong> ${Array.isArray(value) ? value.join(', ') : value}</p>
                `).join('')}
            </div>
        `;
    }    

    function renderAllProducts() {
        const products = getAllProducts();
        productsGrid.innerHTML = products.map(renderProductCard).join('');
    }

    // Initialize
    renderAllProducts();
});
