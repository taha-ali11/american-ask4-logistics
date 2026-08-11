function revealSlideshowImages() {
    const homeSection = document.getElementById("home-section");
    if (homeSection) {
        homeSection.classList.add("slideshow-loaded");
    }
}
if (document.readyState === "complete") {
    revealSlideshowImages();
} else {
    window.addEventListener("load", revealSlideshowImages);
}
setTimeout(revealSlideshowImages, 3e3);
class ScrollTriggerAnimator {
    constructor() {
        this.animatedElements = new Set;
        this.observer = null;
        this.isInitialized = false;
        this.scrollHandler = null;
        this.prefersReducedMotion = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        this.setupObserver();
        setTimeout(() => this.animateVisibleElements(), 300);
    }
    setupObserver() {
        if (typeof IntersectionObserver === "undefined") {
            this.setupScrollFallback();
            return;
        }
        try {
            this.observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateElement(entry.target);
                        if (this.observer) {
                            this.observer.unobserve(entry.target);
                        }
                    }
                });
            }, {
                threshold: .15,
                rootMargin: "0px 0px -100px 0px"
            });
            const elements = document.querySelectorAll(".scroll-animate, .scroll-animate-left, .scroll-animate-right");
            elements.forEach(element => {
                const isInHomeSection = element.closest("#home-section");
                if (!isInHomeSection && this.observer) {
                    this.observer.observe(element);
                } else if (isInHomeSection) {
                    element.classList.add("animated");
                    this.animatedElements.add(element);
                }
            });
        } catch (error) {
            this.setupScrollFallback();
        }
    }
    animateVisibleElements() {
        const elements = document.querySelectorAll(".scroll-animate, .scroll-animate-left, .scroll-animate-right");
        const viewportHeight = window.innerHeight;
        elements.forEach(element => {
            if (this.animatedElements.has(element)) return;
            const rect = element.getBoundingClientRect();
            const isInView = rect.top <= viewportHeight * .9 && rect.bottom >= 0;
            const isInHomeSection = element.closest("#home-section");
            if (isInView || isInHomeSection) {
                this.animateElement(element);
            }
        });
    }
    animateElement(element) {
        if (!element || this.animatedElements.has(element)) return;
        this.animatedElements.add(element);
        if (this.prefersReducedMotion) {
            element.classList.add("animated");
            return;
        }
        setTimeout(() => {
            element.classList.add("animated");
        }, 100);
    }
    setupScrollFallback() {
        const checkElements = () => {
            const elements = document.querySelectorAll(".scroll-animate, .scroll-animate-left, .scroll-animate-right");
            const viewportHeight = window.innerHeight;
            elements.forEach(element => {
                if (this.animatedElements.has(element)) return;
                const rect = element.getBoundingClientRect();
                const isInView = rect.top <= viewportHeight * .8 && rect.bottom >= 0;
                if (isInView) {
                    this.animateElement(element);
                }
            });
        };
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
        window.addEventListener("scroll", this.scrollHandler);
        setTimeout(checkElements, 100);
    }
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        if (this.scrollHandler) {
            window.removeEventListener("scroll", this.scrollHandler);
            this.scrollHandler = null;
        }
        this.animatedElements.clear();
        this.isInitialized = false;
    }
    refresh() {
        if (!this.isInitialized) return;
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.animatedElements.clear();
        this.setupObserver();
        setTimeout(() => this.animateVisibleElements(), 100);
    }
}
let scrollAnimatorInstance = null;
function initScrollAnimations() {
    if (scrollAnimatorInstance) {
        scrollAnimatorInstance.destroy();
    }
    scrollAnimatorInstance = new ScrollTriggerAnimator;
    scrollAnimatorInstance.init();
    return scrollAnimatorInstance;
}
function setupScrollAnimations() {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function() {
            setTimeout(initScrollAnimations, 100);
        });
    } else {
        setTimeout(initScrollAnimations, 100);
    }
}
setupScrollAnimations();
window.addEventListener("load", function() {
    setTimeout(() => {
        if (scrollAnimatorInstance) {
            scrollAnimatorInstance.refresh();
        } else {
            initScrollAnimations();
        }
    }, 500);
});
document.addEventListener("visibilitychange", function() {
    if (!document.hidden && scrollAnimatorInstance) {
        setTimeout(() => scrollAnimatorInstance.refresh(), 100);
    }
});
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        ScrollTriggerAnimator: ScrollTriggerAnimator,
        initScrollAnimations: initScrollAnimations,
        getScrollAnimator: () => scrollAnimatorInstance
    };
} else {
    window.ScrollTriggerAnimator = ScrollTriggerAnimator;
    window.initScrollAnimations = initScrollAnimations;
    window.getScrollAnimator = () => scrollAnimatorInstance;
}