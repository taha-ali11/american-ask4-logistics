"use strict";

// Add version information
const APP_VERSION = '1.0.0';

class ShippingApplication {
    constructor() {
        this.burgerButton = null;
        this.sidebar = null;
        this.overlay = null;
        this.toastContainer = null;
        this.db = null;
        this.analytics = null;
        this.isFirebaseInitialized = false;
        
        this.initializeApp();
    }

    // =============================================
    // INITIALIZATION METHODS
    // =============================================
    initializeApp() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeAllComponents();
            });
        } else {
            // DOM already loaded
            this.initializeAllComponents();
        }
    }

    async initializeAllComponents() {
        this.createToastContainer();
        this.initializeFormHandler();
        this.initializeMobileNavigation();
        this.initializePhoneFormatter();
        this.initializeCounters();
        
        // Initialize Firebase with delay to ensure SDKs are loaded
        setTimeout(() => {
            this.initializeFirebase();
        }, 1000);
    }

    // =============================================
    // FIREBASE INITIALIZATION
    // =============================================
    async initializeFirebase() {
        try {
            // Check if Firebase SDK is loaded
            if (typeof firebase === 'undefined') {
                // console.warn("Firebase SDK not loaded");
                return;
            }
            
            // Firebase configuration
            const firebaseConfig = {
                apiKey: "AIzaSyBIgohlEDVWwcrnmgdVEMf3b6IFcoa1Z0g",
                authDomain: "quotedata-b26fd.firebaseapp.com",
                projectId: "quotedata-b26fd",
                storageBucket: "quotedata-b26fd.firebasestorage.app",
                messagingSenderId: "817536629954",
                appId: "1:817536629954:web:6f84668c8e086789368f5b",
                measurementId: "G-HHLJ2610FE"
            };
            
            // Initialize Firebase App
            let app;
            try {
                if (firebase.apps.length === 0) {
                    app = firebase.initializeApp(firebaseConfig);
                } else {
                    app = firebase.app();
                }
            } catch (error) {
                app = firebase.app();
            }
            
            // Initialize Firestore
            if (typeof firebase.firestore === 'function') {
                this.db = firebase.firestore();
                
                // Test Firestore with a simple operation
                try {
                    await this.db.collection('connection_test').doc('test').set({
                        test: true,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                    // console.log("Firestore connection test successful");
                } catch (testError) {
                    console.warn("Firestore test failed:", testError.message);
                }
            } else {
                throw new Error("Firestore not available");
            }
            
            // Initialize Analytics
            if (typeof firebase.analytics === 'function') {
                this.analytics = firebase.analytics();
            }
            
            this.isFirebaseInitialized = true;
            // console.log("Firebase initialized successfully");

        } catch (error) {
            console.error("Firebase initialization error:", error);
            this.isFirebaseInitialized = false;
            
            setTimeout(() => {
                this.showToast("Working in offline mode", "error");
            }, 500);
        }
    }

    // =============================================
    // TOAST NOTIFICATION MODULE (ORIGINAL STYLING)
    // =============================================
    createToastContainer() {
        // Create toast container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'toast-container';
            this.toastContainer.className = 'fixed top-20 right-4 z-[9999] space-y-2 max-w-md';
            document.body.appendChild(this.toastContainer);
            
            this.toastContainer.style.cssText = `
                position: fixed;
                top: 5rem;
                right: 1rem;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                pointer-events: none;
            `;
        } else {
            this.toastContainer = document.getElementById('toast-container');
        }
    }

    showToast(message, type = 'success') {
        if (!this.toastContainer) return;
        
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
        const textColor = 'text-white';
        
        toast.className = `${bgColor} ${textColor} px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out opacity-0 translate-x-full mb-2`;
        toast.style.cssText = `
            pointer-events: auto;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            z-index: 9999;
            max-width: 24rem;
            min-width: 20rem;
        `;
        
        toast.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        ${type === 'success' ? 
                            '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>' :
                            '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>'
                        }
                    </svg>
                    <span class="font-medium text-sm">${this.escapeHtml(message)}</span>
                </div>
                <button class="ml-4 text-white hover:text-gray-200 focus:outline-none shrink-0" aria-label="Close notification">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                </button>
            </div>
        `;
        
        this.toastContainer.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.classList.remove('opacity-0', 'translate-x-full');
        });
        
        const closeButton = toast.querySelector('button');
        closeButton.addEventListener('click', () => {
            this.removeToast(toast);
        });
        
        setTimeout(() => {
            if (toast.parentElement) {
                this.removeToast(toast);
            }
        }, 5000);
    }

    removeToast(toastElement) {
        toastElement.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => {
            if (toastElement.parentElement) {
                toastElement.remove();
            }
        }, 300);
    }

    // =============================================
    // FORM HANDLING MODULE - UPDATED
    // =============================================
    initializeFormHandler() {
        const shippingForm = document.getElementById('shippingForm');
        if (!shippingForm) return;

        shippingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmit(e);
        });
    }

    async handleFormSubmit(event) {
        const form = event.target;
        const formData = new FormData(form);
        const dataObject = {};
        
        // Collect form data
        formData.forEach((value, key) => {
            dataObject[key] = value;
        });
        
        // console.log("Form data collected:", dataObject);
        
        // Add required metadata for Firestore rules
        dataObject.userId = "anonymous_user"; // Required by rules
        dataObject.createdAt = firebase.firestore.FieldValue.serverTimestamp(); // Must be Firestore Timestamp
        dataObject.submittedAt = new Date().toISOString();
        
        // console.log("Final data to save:", dataObject);
        
        try {
            if (this.isFirebaseInitialized && this.db) {
                // console.log("Attempting to save to Firestore...");
                
                // Save to Firestore
                const docRef = await this.db.collection("shipping_quotes").add(dataObject);
                // console.log("Document written with ID: ", docRef.id);
                
                this.showToast("Thanks for trusting us! Our team will contact you shortly.", "success");
            } else {
                console.log("Firestore not available, saving locally");
                // Save to localStorage
                this.saveToLocalStorage(dataObject);
                
                this.showToast("Thanks for trusting us! Our team will contact you shortly.", "success");
            }
            
            // Clear form
            form.reset();
            
        } catch (error) {
            console.error("Firestore save error:", {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            
            // Fallback to localStorage
            this.saveToLocalStorage(dataObject);
            
            this.showToast("Thanks for trusting us! Our team will contact you shortly. If you're not contacted within 24 hours, please call us at (800) 555-1234.", "success");
        }
    }

    saveToLocalStorage(data) {
        try {
            let saved = JSON.parse(localStorage.getItem('offline_quotes') || '[]');
            
            // Convert Firestore timestamp to string for localStorage
            const dataForStorage = { ...data };
            if (dataForStorage.createdAt && typeof dataForStorage.createdAt.toDate === 'function') {
                dataForStorage.createdAt = dataForStorage.createdAt.toDate().toISOString();
            }
            
            saved.push({
                ...dataForStorage,
                id: Date.now(),
                synced: false
            });
            
            // Keep only last 50
            if (saved.length > 50) {
                saved = saved.slice(-50);
            }
            
            localStorage.setItem('offline_quotes', JSON.stringify(saved));
            console.log("Data saved to localStorage");
        } catch (error) {
            console.error("LocalStorage save error:", error);
        }
    }

    // =============================================
    // MOBILE NAVIGATION MODULE
    // =============================================
    initializeMobileNavigation() {
        this.burgerButton = document.getElementById('burger-menu-button');
        this.sidebar = document.getElementById('mobile-sidebar');
        this.overlay = document.getElementById('sidebar-overlay');
        
        if (this.burgerButton && this.sidebar && this.overlay) {
            this.burgerButton.addEventListener('click', () => this.toggleMenu());
            this.overlay.addEventListener('click', () => this.toggleMenu());
        }
    }

    toggleMenu() {
        this.sidebar.classList.toggle('translate-x-full');
        this.overlay.classList.toggle('opacity-0');
        this.overlay.classList.toggle('opacity-50');
        this.overlay.classList.toggle('pointer-events-none');
        this.overlay.classList.toggle('pointer-events-auto');
    }

    // =============================================
    // PHONE INPUT FORMATTING MODULE
    // =============================================
    initializePhoneFormatter() {
        const phoneInput = document.getElementById('phone');
        if (!phoneInput) return;

        phoneInput.addEventListener('input', this.formatPhoneNumber.bind(this));
    }

    formatPhoneNumber(event) {
        let value = event.target.value.replace(/\D/g, '');
        
        // Remove +1 if it was manually typed
        if (value.startsWith('1')) {
            value = value.substring(1);
        }
        
        // Limit to 10 digits (US phone number)
        value = value.substring(0, 10);
        
        if (value.length > 0) {
            event.target.value = this.buildPhoneFormat(value);
        }
    }

    buildPhoneFormat(value) {
        let formatted = '+1 ';
        
        if (value.length > 0) {
            formatted += '(' + value.substring(0, 3);
        }
        if (value.length > 3) {
            formatted += ') ' + value.substring(3, 6);
        }
        if (value.length > 6) {
            formatted += '-' + value.substring(6, 10);
        }
        
        return formatted;
    }

    // =============================================
    // COUNTER ANIMATION MODULE
    // =============================================
    initializeCounters() {
        this.setInitialCounterValues();
        
        setTimeout(() => {
            this.startCounterAnimations();
        }, 500);
    }

    setInitialCounterValues() {
        const counters = {
            customersCount: '0+',
            statesCount: '0+',
            supportCount: '0/7'
        };
        
        Object.entries(counters).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    startCounterAnimations() {
        this.animateCounter('customersCount', 850, '+', 2500);
        this.animateCounter('statesCount', 50, '+', 2000);
        this.animateSupportCounter();
    }

    animateCounter(elementId, targetValue, suffix = '+', duration = 2000) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        let startValue = 0;
        const increment = targetValue / (duration / 16);

        const updateCounter = () => {
            startValue += increment;
            if (startValue < targetValue) {
                element.textContent = Math.floor(startValue) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = targetValue + suffix;
            }
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(element);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(element);
    }

    animateSupportCounter() {
        const supportElement = document.getElementById('supportCount');
        if (!supportElement) return;
        
        let currentHours = 0;
        let currentMinutes = 0;
        const hoursTarget = 24;
        const minutesTarget = 7;

        const updateSupportCounter = () => {
            if (currentHours < hoursTarget) {
                currentHours += 1;
            } else if (currentMinutes < minutesTarget) {
                currentMinutes += 1;
            }

            supportElement.textContent = `${currentHours}/${currentMinutes}`;

            if (currentHours < hoursTarget || currentMinutes < minutesTarget) {
                setTimeout(updateSupportCounter, 80);
            }
        };

        const supportObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateSupportCounter();
                    supportObserver.unobserve(supportElement);
                }
            });
        }, { threshold: 0.5 });

        supportObserver.observe(supportElement);
    }
    
    // =============================================
    // SECURITY HELPER METHODS
    // =============================================
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// =============================================
// APPLICATION BOOTSTRAP
// =============================================
// Initialize the application when the script loads
(() => {
    if (typeof window !== 'undefined') {
        window.ShippingApp = new ShippingApplication();
    }
})();