document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLeft = document.querySelector('.nav-left');
    const navRight = document.querySelector('.nav-right');

    hamburger.addEventListener('click', () => {
        navLeft.classList.toggle('active');
        navRight.classList.toggle('active');
    });
});

// Add to your existing JavaScript
document.addEventListener('DOMContentLoaded', () => {
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
});

// Add to your existing JavaScript
document.addEventListener('DOMContentLoaded', () => {
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
});
