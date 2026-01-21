

// =============================================
// SCROLL TRIGGER ANIMATIONS MODULE
// =============================================
class ScrollTriggerAnimator {
    constructor() {
        this.animatedElements = new Set();
        this.observer = null;
        this.isInitialized = false;
        this.scrollHandler = null;
    }

    init() {
        // Prevent multiple initializations
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        // Setup Intersection Observer
        this.setupObserver();
        
        // Animate elements already in view
        setTimeout(() => this.animateVisibleElements(), 300);
    }

    setupObserver() {
        // Check if IntersectionObserver is supported
        if (typeof IntersectionObserver === 'undefined') {
            this.setupScrollFallback();
            return;
        }

        try {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateElement(entry.target);
                        if (this.observer) {
                            this.observer.unobserve(entry.target);
                        }
                    }
                });
            }, {
                threshold: 0.15,
                rootMargin: '0px 0px -100px 0px' // Trigger 100px before element
            });

            // Observe all animated elements except home section (already visible)
            const elements = document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right');
            elements.forEach(element => {
                const isInHomeSection = element.closest('#home-section');
                if (!isInHomeSection && this.observer) {
                    this.observer.observe(element);
                } else if (isInHomeSection) {
                    // Home section elements should be visible immediately
                    element.classList.add('animated');
                    this.animatedElements.add(element);
                }
            });
        } catch (error) {
            this.setupScrollFallback();
        }
    }

    animateVisibleElements() {
        const elements = document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right');
        const viewportHeight = window.innerHeight;
        
        elements.forEach(element => {
            if (this.animatedElements.has(element)) return;
            
            const rect = element.getBoundingClientRect();
            const isInView = rect.top <= viewportHeight * 0.9 && rect.bottom >= 0;
            
            const isInHomeSection = element.closest('#home-section');
            if (isInView || isInHomeSection) {
                this.animateElement(element);
            }
        });
    }

    animateElement(element) {
        if (!element || this.animatedElements.has(element)) return;
        
        this.animatedElements.add(element);
        
        // Add a small delay for smoother feel
        setTimeout(() => {
            element.classList.add('animated');
        }, 100);
    }

    setupScrollFallback() {
        const checkElements = () => {
            const elements = document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right');
            const viewportHeight = window.innerHeight;
            
            elements.forEach(element => {
                if (this.animatedElements.has(element)) return;
                
                const rect = element.getBoundingClientRect();
                const isInView = rect.top <= viewportHeight * 0.8 && rect.bottom >= 0;
                
                if (isInView) {
                    this.animateElement(element);
                }
            });
        };
        
        // Use throttled scroll handler for performance
        let ticking = false;
        this.scrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    checkElements();
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', this.scrollHandler);
        // Initial check
        setTimeout(checkElements, 100);
    }

    // Clean up method if needed
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        if (this.scrollHandler) {
            window.removeEventListener('scroll', this.scrollHandler);
            this.scrollHandler = null;
        }
        
        this.animatedElements.clear();
        this.isInitialized = false;
    }

    // Refresh for dynamically added content
    refresh() {
        if (!this.isInitialized) return;
        
        // Clean up old observer
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        // Clear animated elements set
        this.animatedElements.clear();
        
        // Re-initialize
        this.setupObserver();
        setTimeout(() => this.animateVisibleElements(), 100);
    }
}

// =============================================
// INITIALIZATION AND EXPORT
// =============================================

// Create global instance
let scrollAnimatorInstance = null;

function initScrollAnimations() {
    if (scrollAnimatorInstance) {
        scrollAnimatorInstance.destroy();
    }
    
    scrollAnimatorInstance = new ScrollTriggerAnimator();
    scrollAnimatorInstance.init();
    return scrollAnimatorInstance;
}

// Initialize when DOM is ready
function setupScrollAnimations() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initScrollAnimations, 100);
        });
    } else {
        setTimeout(initScrollAnimations, 100);
    }
}

// Auto-initialize
setupScrollAnimations();

// Also re-initialize on window load for any dynamic content
window.addEventListener('load', function() {
    setTimeout(() => {
        if (scrollAnimatorInstance) {
            scrollAnimatorInstance.refresh();
        } else {
            initScrollAnimations();
        }
    }, 500);
});

// Handle page transitions (for SPAs)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && scrollAnimatorInstance) {
        setTimeout(() => scrollAnimatorInstance.refresh(), 100);
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ScrollTriggerAnimator,
        initScrollAnimations,
        getScrollAnimator: () => scrollAnimatorInstance
    };
} else {
    // Make available globally
    window.ScrollTriggerAnimator = ScrollTriggerAnimator;
    window.initScrollAnimations = initScrollAnimations;
    window.getScrollAnimator = () => scrollAnimatorInstance;
}