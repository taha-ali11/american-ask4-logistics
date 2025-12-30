// =============================================
// PRIVACY & TERMS PAGE JAVASCRIPT
// =============================================

class PrivacyTermsPage {
    constructor() {
        this.backToTopButton = document.getElementById('backToTop');
        this.acceptTermsButton = document.getElementById('acceptTerms');
        this.printButton = null;
        this.init();
    }

    init() {
        this.setupBackToTop();
        this.setupTermsAcknowledgment();
        this.setupSmoothScrolling();
        this.setupPrintFunctionality();
        this.setupAdditionalEventListeners();
    }

    // =============================================
    // BACK TO TOP FUNCTIONALITY
    // =============================================
    setupBackToTop() {
        if (!this.backToTopButton) return;

        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                this.backToTopButton.style.display = 'flex';
            } else {
                this.backToTopButton.style.display = 'none';
            }
        });

        // Scroll to top when clicked
        this.backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.scrollToTop();
        });
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // =============================================
    // TERMS ACKNOWLEDGMENT
    // =============================================
    setupTermsAcknowledgment() {
        if (!this.acceptTermsButton) return;

        this.acceptTermsButton.addEventListener('click', () => {
            this.handleTermsAcceptance();
        });
    }

    handleTermsAcceptance() {
        // Update button appearance
        this.acceptTermsButton.innerHTML = '<i class="fas fa-check mr-2"></i>Terms Acknowledged';
        this.acceptTermsButton.classList.remove('from-[#3C3B6E]', 'to-[#0A2342]');
        this.acceptTermsButton.classList.add('from-green-600', 'to-green-800');
        this.acceptTermsButton.disabled = true;

        // Show confirmation message
        this.showConfirmationMessage();

        // Optional: Save acknowledgment in localStorage
        this.saveAcknowledgment();
    }

    showConfirmationMessage() {
        const confirmation = document.createElement('div');
        confirmation.className = 'fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm animate-fade-in';
        confirmation.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle text-xl mr-3"></i>
                <div>
                    <p class="font-bold">Thank you!</p>
                    <p class="text-sm">Your acknowledgment has been noted.</p>
                </div>
            </div>
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fadeIn 0.3s ease-out;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(confirmation);

        // Remove confirmation after 5 seconds
        setTimeout(() => {
            confirmation.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (confirmation.parentNode) {
                    confirmation.parentNode.removeChild(confirmation);
                }
            }, 300);
        }, 5000);
    }

    saveAcknowledgment() {
        // Save to localStorage to remember user's acknowledgment
        try {
            localStorage.setItem('termsAcknowledged', new Date().toISOString());
        } catch (error) {
            // Could not save acknowledgment to localStorage
        }
    }

    // =============================================
    // SMOOTH SCROLLING
    // =============================================
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                this.handleAnchorClick(e, anchor);
            });
        });
    }

    handleAnchorClick(e, anchor) {
        const href = anchor.getAttribute('href');
        if (href === '#' || href === '#!') return;

        e.preventDefault();
        const targetId = href;
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            this.scrollToElement(targetElement);
        }
    }

    scrollToElement(element) {
        const headerHeight = 80; // Adjust based on your header height
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // =============================================
    // PRINT FUNCTIONALITY
    // =============================================
    setupPrintFunctionality() {
        this.createPrintButton();
        this.setupPrintStyles();
    }

    createPrintButton() {
        this.printButton = document.createElement('button');
        this.printButton.className = 'fixed bottom-32 right-6 bg-white text-gray-800 font-medium py-2 px-4 rounded-lg shadow-lg flex items-center hover:bg-gray-100 transition-colors z-40 print:hidden';
        this.printButton.innerHTML = '<i class="fas fa-print mr-2"></i> Print Terms';
        this.printButton.setAttribute('aria-label', 'Print this page');
        this.printButton.addEventListener('click', () => this.printPage());
        document.body.appendChild(this.printButton);
    }

    printPage() {
        // Add print-specific behavior if needed
        window.print();
    }

    setupPrintStyles() {
        // Add print-specific styles
        const printStyles = document.createElement('style');
        printStyles.textContent = `
            @media print {
                .back-to-top,
                .print-button,
                nav,
                footer,
                button:not(.no-print) {
                    display: none !important;
                }
                
                body {
                    font-size: 12pt;
                    line-height: 1.5;
                }
                
                .legal-card {
                    box-shadow: none !important;
                    border: 1px solid #ddd !important;
                }
                
                .section-title::after {
                    background: #000 !important;
                }
                
                a {
                    color: #000 !important;
                    text-decoration: none !important;
                }
                
                .no-break {
                    page-break-inside: avoid;
                }
            }
        `;
        document.head.appendChild(printStyles);
    }

    // =============================================
    // ADDITIONAL FUNCTIONALITY
    // =============================================
    setupAdditionalEventListeners() {
        // Handle page visibility for better UX
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onPageHidden();
            } else {
                this.onPageVisible();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Check if user already acknowledged terms
        this.checkPreviousAcknowledgment();
    }

    onPageHidden() {
        // Optional: Pause animations or save state
    }

    onPageVisible() {
        // Optional: Resume animations or restore state
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + P for print
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            this.printPage();
        }

        // Escape key to close any open modals (if added later)
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
    }

    closeAllModals() {
        // Function to close any open modal windows
        const modals = document.querySelectorAll('.modal-open');
        modals.forEach(modal => {
            modal.classList.remove('modal-open');
        });
    }

    checkPreviousAcknowledgment() {
        try {
            const acknowledged = localStorage.getItem('termsAcknowledged');
            if (acknowledged && this.acceptTermsButton) {
                // User already acknowledged terms
                this.acceptTermsButton.innerHTML = '<i class="fas fa-check mr-2"></i>Previously Acknowledged';
                this.acceptTermsButton.classList.remove('from-[#3C3B6E]', 'to-[#0A2342]');
                this.acceptTermsButton.classList.add('from-gray-600', 'to-gray-800');
                this.acceptTermsButton.disabled = true;
            }
        } catch (error) {
            // Could not check previous acknowledgment
        }
    }

    // =============================================
    // UTILITY METHODS
    // =============================================
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// =============================================
// PAGE INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the page functionality
    window.privacyTermsPage = new PrivacyTermsPage();
    
    // Optional: Add loading state management
    window.addEventListener('load', () => {
        document.body.classList.add('page-loaded');
    });

    // Optional: Analytics tracking for page views
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_title: 'Privacy Policy & Terms',
            page_location: window.location.href
        });
    }
});

// =============================================
// POLYFILLS & FALLBACKS (if needed)
// =============================================
// Smooth scrolling polyfill for older browsers
if (!('scrollBehavior' in document.documentElement.style)) {
    import('scroll-behavior-polyfill').then(module => {
        // Polyfill loaded
    });
}

// =============================================
// ERROR HANDLING
// =============================================
window.addEventListener('error', (event) => {
    // You could send this to an error tracking service
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    // Handle unhandled promise rejection
});