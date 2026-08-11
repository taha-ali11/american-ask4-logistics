class PrivacyTermsPage {
    constructor() {
        this.backToTopButton = document.getElementById("backToTop");
        this.acceptTermsButton = document.getElementById("acceptTerms");
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
    setupBackToTop() {
        if (!this.backToTopButton) return;
        window.addEventListener("scroll", () => {
            if (window.pageYOffset > 300) {
                this.backToTopButton.style.display = "flex";
            } else {
                this.backToTopButton.style.display = "none";
            }
        });
        this.backToTopButton.addEventListener("click", e => {
            e.preventDefault();
            this.scrollToTop();
        });
    }
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
    setupTermsAcknowledgment() {
        if (!this.acceptTermsButton) return;
        this.acceptTermsButton.addEventListener("click", () => {
            this.handleTermsAcceptance();
        });
    }
    handleTermsAcceptance() {
        this.acceptTermsButton.innerHTML = '<i class="fas fa-check mr-2" aria-hidden="true"></i>Terms Acknowledged';
        this.acceptTermsButton.classList.remove("from-[#3C3B6E]", "to-[#0A2342]");
        this.acceptTermsButton.classList.add("from-green-600", "to-green-800");
        this.acceptTermsButton.disabled = true;
        this.showConfirmationMessage();
        this.saveAcknowledgment();
    }
    showConfirmationMessage() {
        const confirmation = document.createElement("div");
        confirmation.className = "fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm animate-fade-in";
        confirmation.setAttribute("role", "status");
        confirmation.setAttribute("aria-live", "polite");
        confirmation.innerHTML = `\n<div class="flex items-center">\n<i class="fas fa-check-circle text-xl mr-3" aria-hidden="true"></i>\n  <div>\n <p class="font-bold">Thank you!</p>\n <p class="text-sm">Your acknowledgment has been noted.</p>\n</div>\n </div>\n        `;
        const style = document.createElement("style");
        style.textContent = `\n @keyframes fadeIn {\n from { opacity: 0; transform: translateY(-10px); }\n to { opacity: 1; transform: translateY(0); }\n            }\n            .animate-fade-in {\n   animation: fadeIn 0.3s ease-out;\n     }\n        `;
        document.head.appendChild(style);
        document.body.appendChild(confirmation);
        setTimeout(() => {
            confirmation.style.animation = "fadeOut 0.3s ease-out";
            setTimeout(() => {
                if (confirmation.parentNode) {
                    confirmation.parentNode.removeChild(confirmation);
                }
            }, 300);
        }, 5e3);
    }
    saveAcknowledgment() {
        try {
            localStorage.setItem("termsAcknowledged", (new Date).toISOString());
        } catch (error) { }
    }
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener("click", e => {
                this.handleAnchorClick(e, anchor);
            });
        });
    }
    handleAnchorClick(e, anchor) {
        const href = anchor.getAttribute("href");
        if (href === "#" || href === "#!") return;
        e.preventDefault();
        const targetId = href;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            this.scrollToElement(targetElement);
        }
    }
    scrollToElement(element) {
        const headerHeight = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
    setupPrintFunctionality() {
        this.createPrintButton();
        this.setupPrintStyles();
    }
    createPrintButton() {
        this.printButton = document.createElement("button");
        this.printButton.className = "fixed bottom-32 right-6 bg-white text-gray-800 font-medium py-2 px-4 rounded-lg shadow-lg flex items-center hover:bg-gray-100 transition-colors z-40 print:hidden";
        this.printButton.innerHTML = '<i class="fas fa-print mr-2" aria-hidden="true"></i> Print Terms';
        this.printButton.setAttribute("aria-label", "Print this page");
        this.printButton.addEventListener("click", () => this.printPage());
        document.body.appendChild(this.printButton);
    }
    printPage() {
        window.print();
    }
    setupPrintStyles() {
        const printStyles = document.createElement("style");
        printStyles.textContent = `\n            @media print {\n                .back-to-top,\n                .print-button,\n                nav,\n                footer,\n                button:not(.no-print) {\n                    display: none !important;\n                }\n                \n                body {\n                    font-size: 12pt;\n                    line-height: 1.5;\n                }\n                \n                .legal-card {\n                    box-shadow: none !important;\n                    border: 1px solid #ddd !important;\n                }\n                \n                .section-title::after {\n                    background: #000 !important;\n                }\n                \n                a {\n                    color: #000 !important;\n                    text-decoration: none !important;\n                }\n                \n                .no-break {\n                    page-break-inside: avoid;\n                }\n            }\n        `;
        document.head.appendChild(printStyles);
    }
    setupAdditionalEventListeners() {
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.onPageHidden();
            } else {
                this.onPageVisible();
            }
        });
        document.addEventListener("keydown", e => {
            this.handleKeyboardShortcuts(e);
        });
        this.checkPreviousAcknowledgment();
    }
    onPageHidden() { }
    onPageVisible() { }
    handleKeyboardShortcuts(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === "p") {
            e.preventDefault();
            this.printPage();
        }
        if (e.key === "Escape") {
            this.closeAllModals();
        }
    }
    closeAllModals() {
        const modals = document.querySelectorAll(".modal-open");
        modals.forEach(modal => {
            modal.classList.remove("modal-open");
        });
    }
    checkPreviousAcknowledgment() {
        try {
            const acknowledged = localStorage.getItem("termsAcknowledged");
            if (acknowledged && this.acceptTermsButton) {
                this.acceptTermsButton.innerHTML = '<i class="fas fa-check mr-2" aria-hidden="true"></i>Previously Acknowledged';
                this.acceptTermsButton.classList.remove("from-[#3C3B6E]", "to-[#0A2342]");
                this.acceptTermsButton.classList.add("from-gray-600", "to-gray-800");
                this.acceptTermsButton.disabled = true;
            }
        } catch (error) { }
    }
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
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}
document.addEventListener("DOMContentLoaded", () => {
    window.privacyTermsPage = new PrivacyTermsPage;
    window.addEventListener("load", () => {
        document.body.classList.add("page-loaded");
    });
    if (typeof gtag !== "undefined") {
        gtag("event", "page_view", {
            page_title: "Privacy Policy & Terms",
            page_location: window.location.href
        });
    }
});
if (!("scrollBehavior" in document.documentElement.style)) {
    import("scroll-behavior-polyfill").then(module => { });
}
window.addEventListener("error", event => { });
window.addEventListener("unhandledrejection", event => { });