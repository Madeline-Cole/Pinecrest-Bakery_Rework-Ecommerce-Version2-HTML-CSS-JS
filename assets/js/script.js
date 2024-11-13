import { menuData } from '/data/menuData.js';

function initializePopularProducts() {
    const productsWrapper = document.querySelector('.products-wrapper');
    const scrollDots = document.querySelector('.scroll-dots');
    
    if (!productsWrapper || !menuData) {
        console.error('Required elements or data missing');
        return;
    }

    // Combine all products from different categories
    const allProducts = [
        ...(menuData.cafe || []),
        ...(menuData.bakery || []),
        ...(menuData.catering || [])
    ].flat();
    
    // Randomly select 12 products without duplicates
    const popularProducts = allProducts
        .filter(product => product && product.id) // Ensure valid products
        .sort(() => 0.5 - Math.random())
        .slice(0, 12);
    
    // Clear existing content
    productsWrapper.innerHTML = '';
    
    // Create and append product cards
    popularProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.id = product.id;
        
        productCard.innerHTML = `
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-details">
                <h3>${product.name}</h3>
                <p class="price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-product-id="${product.id}">
                    Add to Cart
                </button>
            </div>
        `;
        
        productsWrapper.appendChild(productCard);
    });

   // Add this function to your script.js
function getRandomProducts() {
    const allProducts = [
        ...menuData.latinAmerican,
        ...menuData.breakfast,
        ...menuData.sandwiches,
        ...menuData.desserts,
        ...Object.values(menuData.drinks.hotDrinks),
        ...menuData.drinks.toGoCarafe
    ];
    
    return allProducts
        .sort(() => 0.5 - Math.random())
        .slice(0, 12);
}

function renderPopularProducts() {
    const popularProducts = getRandomProducts();
    const popularProductsContainer = document.querySelector('.popular-products-grid');
    
    popularProducts.forEach(product => {
        const price = product.price || (product.options ? product.options[0].price : 0);
        
        const productElement = document.createElement('div');
        productElement.className = 'popular-product-item';
        
        productElement.innerHTML = `
            <img class="popular-product-image" src="${product.image}" alt="${product.name}">
            <h3 class="popular-product-title">${product.name}</h3>
            <p class="popular-product-price">$${price}</p>
        `;
        
        popularProductsContainer.appendChild(productElement);
    });
}


    
    document.addEventListener('DOMContentLoaded', renderPopularProducts);    
    
    // Initialize scroll functionality
    const numDots = Math.ceil(popularProducts.length / 4); // 4 items per view
    let currentIndex = 0;
    let autoScrollInterval;
    
    // Create scroll dots
    scrollDots.innerHTML = Array(numDots)
        .fill('')
        .map((_, i) => `<button class="dot ${i === 0 ? 'active' : ''}" aria-label="Go to slide ${i + 1}"></button>`)
        .join('');
    
    function scrollToIndex(index) {
        if (!productsWrapper) return;
        
        const scrollPosition = index * productsWrapper.offsetWidth;
        productsWrapper.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
        updateActiveDot(index);
    }
    
    function updateActiveDot(index) {
        const dots = scrollDots.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    function startAutoScroll() {
        stopAutoScroll(); // Clear any existing interval
        autoScrollInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % numDots;
            scrollToIndex(currentIndex);
        }, 5000);
    }
    
    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    }
    
    // Event Listeners
    scrollDots.querySelectorAll('.dot').forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopAutoScroll();
            currentIndex = index;
            scrollToIndex(index);
        });
    });
    
    // Handle scroll events
    let scrollTimeout;
    productsWrapper.addEventListener('scroll', () => {
        stopAutoScroll();
        
        // Debounce scroll event
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollPosition = productsWrapper.scrollLeft;
            currentIndex = Math.round(scrollPosition / productsWrapper.offsetWidth);
            updateActiveDot(currentIndex);
        }, 100);
    });
    
    // Touch events for mobile
    productsWrapper.addEventListener('touchstart', stopAutoScroll);
    
    // Visibility change handling
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            startAutoScroll();
        } else {
            stopAutoScroll();
        }
    });
    
    // Initialize auto-scroll
    startAutoScroll();
    
    // Add to cart functionality
    productsWrapper.addEventListener('click', (e) => {
        const addToCartBtn = e.target.closest('.add-to-cart');
        if (!addToCartBtn) return;
        
        const productId = addToCartBtn.dataset.productId;
        const product = popularProducts.find(p => p.id === productId);
        
        if (product) {
            // Assuming you have a cart management function
            if (typeof handleAddToCart === 'function') {
                handleAddToCart(product);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('DOMContentLoaded', initializePopularProducts);
    // Initialize Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const navLeft = document.querySelector('.nav-left');
    const navRight = document.querySelector('.nav-right');


    hamburger.addEventListener('click', () => {
        navLeft.classList.toggle('active');
        navRight.classList.toggle('active');
    });

    // Initialize popular products
    initializePopularProducts();
    
    // Initialize holiday products
    createHolidayProducts();  

    const productsWrapper = document.querySelector('.products-wrapper');
    const scrollDots = document.querySelector('.scroll-dots');
    
    // Create dots based on number of products
    const productCards = document.querySelectorAll('.product-card');
    const numDots = Math.ceil(productCards.length / 4); // 4 items per view on desktop
    
    for (let i = 0; i < numDots; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        scrollDots.appendChild(dot);
    }
    
    // Handle dot clicks
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const scrollPosition = index * productsWrapper.offsetWidth;
            productsWrapper.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
            
            // Update active dot
            dots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
        });
    });
    
    // Update dots on scroll
    productsWrapper.addEventListener('scroll', () => {
        const scrollPosition = productsWrapper.scrollLeft;
        const activeIndex = Math.round(scrollPosition / productsWrapper.offsetWidth);
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    });

     // Testimonials Carousel
     let currentSlide = 0;
     const slides = document.querySelectorAll('.testimonial-card');
     const nextBtn = document.querySelector('.next');
     const prevBtn = document.querySelector('.prev');
 
 
     function showSlide(n) {
         slides.forEach(slide => slide.style.display = 'none');
         slides[n].style.display = 'block';
     }
 
 
     if(nextBtn && prevBtn) {
         nextBtn.addEventListener('click', () => {
             currentSlide = (currentSlide + 1) % slides.length;
             showSlide(currentSlide);
         });
 
 
         prevBtn.addEventListener('click', () => {
             currentSlide = (currentSlide - 1 + slides.length) % slides.length;
             showSlide(currentSlide);
         });
     }
 
 
     // Initialize Google Maps
     function initMap() {
         const map = new google.maps.Map(document.getElementById('map'), {
             zoom: 10,
             center: { lat: 25.6667, lng: -80.3483 } // Miami coordinates
         });
 
 
         // Add markers for each location
         locations.forEach(location => {
             new google.maps.Marker({
                 position: location.coordinates,
                 map: map,
                 title: location.name
             });
         });
     }
 
 
     // Newsletter Form
     const newsletterForm = document.querySelector('.newsletter-form');
     if(newsletterForm) {
         newsletterForm.addEventListener('submit', (e) => {
             e.preventDefault();
             // Add your newsletter signup logic here
         });
     }
 
 
     function createHolidayProducts() {
         const gridContainer = document.querySelector('.grid-container');
         const holidayProducts = menuData.seasonal.thanksgiving;
         
         holidayProducts.forEach(product => {
             const productElement = document.createElement('div');
             productElement.className = 'grid-item product-item';
             
             productElement.innerHTML = `
                 <img src="${product.image}" alt="${product.name}">
                 <div class="product-overlay">
                     <h3>${product.name}</h3>
                     <p class="price">$${product.price.toFixed(2)}</p>
                     <p class="sold-info">${product.soldCount} sold in last ${product.soldTimeframe} hours</p>
                     <p class="description">${product.description}</p>
                     <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                 </div>
             `;
             
             gridContainer.appendChild(productElement);
         });
     }
     
     document.addEventListener('DOMContentLoaded', createHolidayProducts);

});


document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.querySelector('.grid-container');
    const holidayProducts = menuData.seasonal.thanksgiving;
    
    // Clear existing static items
    gridContainer.innerHTML = '';
    
    // Keep the holiday-item (first item)
    const holidayItem = `
        <div class="grid-item holiday-item">
            <div class="holiday-content">
                <h2>Holiday Products</h2>
                <p>Please order 2 days in advance</p>
                <a href="/menu/holiday" class="btn">Order Pickup</a>
            </div>
        </div>
    `;
    
    // Add holiday item and dynamically generate product items
    gridContainer.innerHTML = holidayItem + holidayProducts.map(product => `
        <div class="grid-item" data-product-id="${product.id}" style="cursor: pointer" onclick="window.location.href='/pages/menu/seasonal.html#product-${product.id}'">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">$${product.price.toFixed(2)}</p>
            </div>
        </div>
    `).join('');
});