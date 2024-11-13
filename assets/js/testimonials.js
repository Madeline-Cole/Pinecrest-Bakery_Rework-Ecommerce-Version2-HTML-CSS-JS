class TestimonialsCarousel {
    constructor() {
        this.currentSlide = 0;
        this.track = document.querySelector('.testimonials-track');
        this.slides = document.querySelectorAll('.testimonial-card');
        this.prevBtn = document.querySelector('.control-btn.prev');
        this.nextBtn = document.querySelector('.control-btn.next');
        
        this.totalSlides = this.slides.length;
        this.init();
    }

    init() {
        // Set initial width and position
        this.track.style.width = `${this.totalSlides * 100}%`;
        this.slides.forEach(slide => slide.style.width = `${100 / this.totalSlides}%`);
        
        // Add event listeners
        this.prevBtn.addEventListener('click', () => this.navigate('prev'));
        this.nextBtn.addEventListener('click', () => this.navigate('next'));
        
        // Auto scroll
        this.startAutoScroll();
    }

    navigate(direction) {
        if (direction === 'next') {
            this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        } else {
            this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        }
        
        this.updateSlidePosition();
    }

    updateSlidePosition() {
        this.track.style.transform = `translateX(-${this.currentSlide * (100 / this.totalSlides)}%)`;
    }

    startAutoScroll() {
        setInterval(() => this.navigate('next'), 5000);
    }
}

// Initialize carousel
document.addEventListener('DOMContentLoaded', () => {
    new TestimonialsCarousel();
});
