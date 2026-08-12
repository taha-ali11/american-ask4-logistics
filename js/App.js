"use strict";
const APP_VERSION = "1.0.0";
class ShippingApplication {
    constructor() {
        this.burgerButton = null;
        this.sidebar = null;
        this.overlay = null;
        this.toastContainer = null;
        this.db = null;
        this.firestoreSDK = null;
        this.analytics = null;
        this.isFirebaseInitialized = false;
        this.initializeApp();
    }
    initializeApp() {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => {
                this.initializeAllComponents();
            });
        } else {
            this.initializeAllComponents();
        }
    }
    async initializeAllComponents() {
        this.createToastContainer();
        this.initializeFormHandler();
        this.initializeMobileNavigation();
        this.initializePhoneFormatter();
        this.initializeCounters();
        setTimeout(() => {
            this.initializeFirebase();
        }, 1e3);
    }
    loadFirebaseSDK() {
        if (window.firebaseSDK) {
            return Promise.resolve(window.firebaseSDK);
        }
        if (!window._firebaseSDKPromise) {
            window._firebaseSDKPromise = Promise.all([
                import('https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js'),
                import('https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore-lite.js'),
                import('https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js')
            ]).then(([appMod, fsMod, analyticsMod]) => {
                const sdk = {
                    initializeApp: appMod.initializeApp,
                    getApps: appMod.getApps,
                    getApp: appMod.getApp,
                    getFirestore: fsMod.getFirestore,
                    collection: fsMod.collection,
                    doc: fsMod.doc,
                    setDoc: fsMod.setDoc,
                    addDoc: fsMod.addDoc,
                    serverTimestamp: fsMod.serverTimestamp,
                    getAnalytics: analyticsMod.getAnalytics,
                    isSupported: analyticsMod.isSupported
                };
                window.firebaseSDK = sdk;
                return sdk;
            }).catch(error => {
                console.error("Firebase SDK load error:", error);
                return null;
            });
        }
        return window._firebaseSDKPromise;
    }
    async initializeFirebase() {
        try {
            const sdk = await this.loadFirebaseSDK();
            if (!sdk) {
                return;
            }
            const firebaseConfig = {
                apiKey: "AIzaSyBIgohlEDVWwcrnmgdVEMf3b6IFcoa1Z0g",
                authDomain: "quotedata-b26fd.firebaseapp.com",
                projectId: "quotedata-b26fd",
                storageBucket: "quotedata-b26fd.firebasestorage.app",
                messagingSenderId: "817536629954",
                appId: "1:817536629954:web:6f84668c8e086789368f5b",
                measurementId: "G-HHLJ2610FE"
            };
            let app;
            try {
                app = sdk.getApps().length === 0 ? sdk.initializeApp(firebaseConfig) : sdk.getApp();
            } catch (error) {
                app = sdk.getApp();
            }
            try {
                this.db = sdk.getFirestore(app);
                this.firestoreSDK = sdk;
                try {
                    const testDocRef = sdk.doc(this.db, "connection_test", "test");
                    await sdk.setDoc(testDocRef, {
                        test: true,
                        timestamp: sdk.serverTimestamp()
                    }, {
                        merge: true
                    });
                } catch (testError) {
                    console.warn("Firestore test failed:", testError.message);
                }
            } catch (firestoreError) {
                throw new Error("Firestore not available");
            }
            if (typeof sdk.getAnalytics === "function") {
                try {
                    const analyticsSupported = typeof sdk.isSupported === "function" ? await sdk.isSupported() : true;
                    if (analyticsSupported) {
                        this.analytics = sdk.getAnalytics(app);
                    }
                } catch (analyticsError) {}
            }
            this.isFirebaseInitialized = true;
        } catch (error) {
            console.error("Firebase initialization error:", error);
            this.isFirebaseInitialized = false;
            setTimeout(() => {
                this.showToast("Working in offline mode", "error");
            }, 500);
        }
    }
    createToastContainer() {
        if (!document.getElementById("toast-container")) {
            this.toastContainer = document.createElement("div");
            this.toastContainer.id = "toast-container";
            this.toastContainer.className = "fixed top-20 right-4 z-[9999] space-y-2 max-w-md";
            this.toastContainer.setAttribute("role", "status");
            this.toastContainer.setAttribute("aria-live", "polite");
            document.body.appendChild(this.toastContainer);
            this.toastContainer.style.cssText = `\n                position: fixed;\n                top: 5rem;\n                right: 1rem;\n                z-index: 9999;\n                display: flex;\n                flex-direction: column;\n                align-items: flex-end;\n                pointer-events: none;\n            `;
        } else {
            this.toastContainer = document.getElementById("toast-container");
        }
    }
    showToast(message, type = "success") {
        if (!this.toastContainer) return;
        const toast = document.createElement("div");
        const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
        const textColor = "text-white";
        toast.className = `${bgColor} ${textColor} px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out opacity-0 translate-x-full mb-2`;
        toast.style.cssText = `\n            pointer-events: auto;\n            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);\n            z-index: 9999;\n            max-width: 24rem;\n            min-width: 20rem;\n        `;
        toast.innerHTML = `\n            <div class="flex items-center justify-between">\n                <div class="flex items-center">\n                    <svg class="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">\n                        ${type === "success" ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>' : '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>'}\n                    </svg>\n                    <span class="font-medium text-sm">${this.escapeHtml(message)}</span>\n                </div>\n                <button class="ml-4 text-white hover:text-gray-200 focus:outline-none shrink-0" aria-label="Close notification">\n                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">\n                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>\n                    </svg>\n                </button>\n            </div>\n        `;
        this.toastContainer.appendChild(toast);
        requestAnimationFrame(() => {
            toast.classList.remove("opacity-0", "translate-x-full");
        });
        const closeButton = toast.querySelector("button");
        closeButton.addEventListener("click", () => {
            this.removeToast(toast);
        });
        setTimeout(() => {
            if (toast.parentElement) {
                this.removeToast(toast);
            }
        }, 5e3);
    }
    removeToast(toastElement) {
        toastElement.classList.add("opacity-0", "translate-x-full");
        setTimeout(() => {
            if (toastElement.parentElement) {
                toastElement.remove();
            }
        }, 300);
    }
    initializeFormHandler() {
        const shippingForm = document.getElementById("shippingForm");
        if (!shippingForm) return;
        shippingForm.addEventListener("submit", async e => {
            e.preventDefault();
            await this.handleFormSubmit(e);
        });
    }
    async handleFormSubmit(event) {
        const form = event.target;
        const formData = new FormData(form);
        const dataObject = {};
        formData.forEach((value, key) => {
            dataObject[key] = value;
        });
        dataObject.userId = "anonymous_user";
        dataObject.createdAt = this.firestoreSDK && typeof this.firestoreSDK.serverTimestamp === "function" ? this.firestoreSDK.serverTimestamp() : (new Date).toISOString();
        dataObject.submittedAt = (new Date).toISOString();
        try {
            if (this.isFirebaseInitialized && this.db && this.firestoreSDK) {
                const quotesRef = this.firestoreSDK.collection(this.db, "shipping_quotes");
                const docRef = await this.firestoreSDK.addDoc(quotesRef, dataObject);
                this.showToast("Thanks for trusting us! Our team will contact you shortly.", "success");
            } else {
                console.log("Firestore not available, saving locally");
                this.saveToLocalStorage(dataObject);
                this.showToast("Thanks for trusting us! Our team will contact you shortly.", "success");
            }
            form.reset();
        } catch (error) {
            console.error("Firestore save error:", {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            this.saveToLocalStorage(dataObject);
            this.showToast("Thanks for trusting us! Our team will contact you shortly. If you're not contacted within 24 hours, please call us at (800) 555-1234.", "success");
        }
    }
    saveToLocalStorage(data) {
        try {
            let saved = JSON.parse(localStorage.getItem("offline_quotes") || "[]");
            const dataForStorage = {
                ...data
            };
            if (dataForStorage.createdAt && typeof dataForStorage.createdAt.toDate === "function") {
                dataForStorage.createdAt = dataForStorage.createdAt.toDate().toISOString();
            }
            saved.push({
                ...dataForStorage,
                id: Date.now(),
                synced: false
            });
            if (saved.length > 50) {
                saved = saved.slice(-50);
            }
            localStorage.setItem("offline_quotes", JSON.stringify(saved));
            console.log("Data saved to localStorage");
        } catch (error) {
            console.error("LocalStorage save error:", error);
        }
    }
    initializeMobileNavigation() {
        this.burgerButton = document.getElementById("burger-menu-button");
        this.sidebar = document.getElementById("mobile-sidebar");
        this.overlay = document.getElementById("sidebar-overlay");
        if (this.burgerButton && this.sidebar && this.overlay) {
            this.burgerButton.addEventListener("click", () => this.toggleMenu());
            this.overlay.addEventListener("click", () => this.toggleMenu());
        }
    }
    toggleMenu() {
        this.sidebar.classList.toggle("translate-x-full");
        this.overlay.classList.toggle("opacity-0");
        this.overlay.classList.toggle("opacity-50");
        this.overlay.classList.toggle("pointer-events-none");
        this.overlay.classList.toggle("pointer-events-auto");
        const isOpen = !this.sidebar.classList.contains("translate-x-full");
        this.burgerButton.setAttribute("aria-expanded", String(isOpen));
        this.sidebar.setAttribute("aria-hidden", String(!isOpen));
        if (isOpen) {
            this.sidebar.removeAttribute("inert");
        } else {
            this.sidebar.setAttribute("inert", "");
        }
    }
    initializePhoneFormatter() {
        const phoneInput = document.getElementById("phone");
        if (!phoneInput) return;
        phoneInput.addEventListener("input", this.formatPhoneNumber.bind(this));
    }
    formatPhoneNumber(event) {
        let value = event.target.value.replace(/\D/g, "");
        if (value.startsWith("1")) {
            value = value.substring(1);
        }
        value = value.substring(0, 10);
        if (value.length > 0) {
            event.target.value = this.buildPhoneFormat(value);
        }
    }
    buildPhoneFormat(value) {
        let formatted = "+1 ";
        if (value.length > 0) {
            formatted += "(" + value.substring(0, 3);
        }
        if (value.length > 3) {
            formatted += ") " + value.substring(3, 6);
        }
        if (value.length > 6) {
            formatted += "-" + value.substring(6, 10);
        }
        return formatted;
    }
    initializeCounters() {
        this.setInitialCounterValues();
        setTimeout(() => {
            this.startCounterAnimations();
        }, 500);
    }
    setInitialCounterValues() {
        const counters = {
            customersCount: "0+",
            statesCount: "0+",
            supportCount: "0/7"
        };
        Object.entries(counters).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }
    startCounterAnimations() {
        this.animateCounter("customersCount", 850, "+", 2500);
        this.animateCounter("statesCount", 50, "+", 2e3);
        this.animateSupportCounter();
    }
    animateCounter(elementId, targetValue, suffix = "+", duration = 2e3) {
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
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(element);
                }
            });
        }, {
            threshold: .5
        });
        observer.observe(element);
    }
    animateSupportCounter() {
        const supportElement = document.getElementById("supportCount");
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
        const supportObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateSupportCounter();
                    supportObserver.unobserve(supportElement);
                }
            });
        }, {
            threshold: .5
        });
        supportObserver.observe(supportElement);
    }
    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
}
(() => {
    if (typeof window !== "undefined") {
        window.ShippingApp = new ShippingApplication;
    }
})();