document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const form = this;
    const submitButton = form.querySelector('.submit-btn');
    
    // Animate button
    submitButton.innerHTML = `
        <div class="success-animation">
            <div class="checkmark-circle">
                <div class="checkmark"></div>
            </div>
            <span>Message Sent!</span>
        </div>
    `;
    
    // Reset form after animation
    setTimeout(() => {
        form.reset();
        submitButton.innerHTML = `
            <span class="btn-text">Send Message</span>
            <span class="btn-icon">→</span>
        `;
    }, 2000);
});
