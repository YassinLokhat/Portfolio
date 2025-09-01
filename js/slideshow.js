/**
 * The Minty Cat - Slideshow JavaScript
 * Handles the image slideshow functionality with navigation and auto-advance
 */

// Global variable to track current slide
let slideIndex = 1;

/**
 * Function to change slide by a given number (positive or negative)
 * @param {number} n - Number to change slide by (1 for next, -1 for previous)
 */
function changeSlide(n) {
    showSlide(slideIndex += n);
}

/**
 * Function to show a specific slide
 * @param {number} n - Slide number to display
 */
function currentSlide(n) {
    showSlide(slideIndex = n);
}

/**
 * Function to display the selected slide and update navigation
 * @param {number} n - Slide index to show
 */
function showSlide(n) {
    const slides = document.querySelectorAll('.slide');
    
    // Handle wrap-around for slide navigation
    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }
    
    // Hide all slides by removing active class
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Show current slide
    if (slides[slideIndex - 1]) {
        slides[slideIndex - 1].classList.add('active');
    }
}

/**
 * Initialize slideshow when page loads
 */
document.addEventListener('DOMContentLoaded', function() {
    // Ensure first slide is shown on page load
    showSlide(slideIndex);
    
    // Auto-advance slideshow every 5 seconds
    setInterval(() => {
        changeSlide(1);
    }, 5000);
    
    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            changeSlide(-1);
        } else if (e.key === 'ArrowRight') {
            changeSlide(1);
        }
    });
});