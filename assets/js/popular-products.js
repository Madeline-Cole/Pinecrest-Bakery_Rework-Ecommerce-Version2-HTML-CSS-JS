import { menuData } from '/data/menuData.js';

class PopularProducts {
    constructor() {
        console.log('PopularProducts class initialized');
      this.productsGrid = document.querySelector('.popular-products__grid');
      console.log('Products Grid Element:', this.productsGrid);
      this.prevBtn = document.querySelector('.scroll-btn.prev');
      this.nextBtn = document.querySelector('.scroll-btn.next');
      this.products = [];
      this.currentPage = 0;
      this.productsPerPage = this.calculateProductsPerPage();
      
      this.init();
    }
  
    calculateProductsPerPage() {
      if (window.innerWidth > 1024) return 4;
      if (window.innerWidth > 768) return 3;
      if (window.innerWidth > 480) return 2;
      return 1;
    }
  
    async init() {
      try {
        await this.fetchProducts();
        this.renderProducts();
        this.setupEventListeners();
      } catch (error) {
        console.error('Failed to initialize popular products:', error);
      }
    }
  
    async fetchProducts() {
        console.log('Menu Data:', menuData);
        
        // Flatten all products from different categories
        const allProducts = [
            ...menuData.latinAmerican || [],
            ...(menuData.catering?.meals || []),
            ...(menuData.catering?.sides || []),
            ...(menuData.catering?.partyPackages || [])
        ].filter(product => product && product.id);
        
        console.log('Filtered Products:', allProducts);
        this.products = allProducts
            .sort(() => 0.5 - Math.random())
            .slice(0, 12);
        console.log('Selected Products:', this.products);
    }
    
    
  
    renderProducts() {
      if (!this.productsGrid) return;
  
      const startIndex = this.currentPage * this.productsPerPage;
      const endIndex = startIndex + this.productsPerPage;
      const currentProducts = this.products.slice(startIndex, endIndex);
  
      this.productsGrid.innerHTML = currentProducts.map(product => `
        <div class="product-card" data-product-id="${product.id}">
          <img 
            class="product-image" 
            src="${product.image}" 
            alt="${product.name}"
            loading="lazy"
          >
          <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${product.price ? product.price.toFixed(2) : '0.00'}</p>
                <button class="add-to-cart-btn" data-product-id="${product.id}">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
    }
  
    setupEventListeners() {
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => this.navigate('prev'));
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => this.navigate('next'));
      }
  
      window.addEventListener('resize', () => {
        this.productsPerPage = this.calculateProductsPerPage();
        this.renderProducts();
      });
  
      this.productsGrid.addEventListener('click', (e) => {
        const addToCartBtn = e.target.closest('.add-to-cart-btn');
        if (addToCartBtn) {
          const productId = addToCartBtn.dataset.productId;
          this.handleAddToCart(productId);
        }
      });
    }
  
    navigate(direction) {
      const maxPages = Math.ceil(this.products.length / this.productsPerPage) - 1;
      
      if (direction === 'prev') {
        this.currentPage = Math.max(0, this.currentPage - 1);
      } else {
        this.currentPage = Math.min(maxPages, this.currentPage + 1);
      }
      
      this.renderProducts();
    }
  
    handleAddToCart(productId) {
      const product = this.products.find(p => p.id === productId);
      if (product) {
        // Implement your cart logic here
        console.log(`Added ${product.name} to cart`);
      }
    }
  }
  
  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    new PopularProducts();
  });
  