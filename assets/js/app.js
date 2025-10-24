// ===== TinyStepsBD - Main Application JavaScript =====
// Author: TinyStepsBD
// Description: Main application functionality, API interactions, and utilities

class TinyStepsBD {
    constructor() {
        this.API_BASE_URL = 'https://script.google.com/macros/s/AKfycbyW3ZHdsQI2ohP6Fk3CAHhsYp4n_YY3BC9cJDedRqSqMMeL4a4BswE-DHbDuYChJlwM/exec';
        this.products = [];
        this.cart = this.loadCart();
        this.init();
    }

    // Initialize application
    init() {
        this.setupEventListeners();
        this.updateCartCount();
        this.loadFeaturedProducts();
        this.setupMobileMenu();
        this.setupScrollEffects();
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Mobile menu toggle
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking on links
        document.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        // Search functionality
        const searchIcon = document.querySelector('.nav__search');
        if (searchIcon) {
            searchIcon.addEventListener('click', this.openSearchModal);
        }

        // Cart functionality
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                this.handleAddToCart(e);
            }
        });
    }

    // ===== MOBILE MENU =====
    setupMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.querySelector('i').classList.toggle('fa-bars');
                navToggle.querySelector('i').classList.toggle('fa-times');
            });
        }
    }

    // ===== SCROLL EFFECTS =====
    setupScrollEffects() {
        // Header scroll effect
        const header = document.getElementById('header');
        if (header) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
        }

        // Scroll reveal animations
        this.setupScrollReveal();
    }

    setupScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-up, .reveal-down, .reveal-zoom');
        
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    }

    // ===== PRODUCTS API =====
    async fetchProducts() {
        try {
            const response = await fetch(`${this.API_BASE_URL}?action=products`);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            if (data.success) {
                this.products = data.data;
                return this.products;
            } else {
                throw new Error(data.error || 'Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            this.showNotification('পণ্য লোড করতে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।', 'error');
            return [];
        }
    }

    async fetchProductById(productId) {
        try {
            const response = await fetch(`${this.API_BASE_URL}?action=product&id=${productId}`);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.error || 'Product not found');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            this.showNotification('পণ্য লোড করতে সমস্যা হচ্ছে।', 'error');
            return null;
        }
    }

    // ===== FEATURED PRODUCTS =====
    async loadFeaturedProducts() {
        const featuredContainer = document.getElementById('featured-products');
        if (!featuredContainer) return;

        try {
            const products = await this.fetchProducts();
            const featuredProducts = products.slice(0, 6); // Show first 6 products as featured
            
            if (featuredProducts.length > 0) {
                this.renderProducts(featuredProducts, featuredContainer);
            } else {
                featuredContainer.innerHTML = this.getEmptyStateHTML('কোন পণ্য পাওয়া যায়নি');
            }
        } catch (error) {
            featuredContainer.innerHTML = this.getErrorStateHTML();
        }
    }

    // ===== PRODUCT RENDERING =====
    renderProducts(products, container) {
        if (!products || products.length === 0) {
            container.innerHTML = this.getEmptyStateHTML('কোন পণ্য পাওয়া যায়নি');
            return;
        }

        const productsHTML = products.map(product => this.createProductCardHTML(product)).join('');
        container.innerHTML = productsHTML;
        
        // Add event listeners to new product cards
        this.attachProductCardEvents();
    }

    createProductCardHTML(product) {
        const mainImage = product['Main Image'] || product['Image1'] || 'assets/images/placeholder.jpg';
        const price = this.formatPrice(product['Price (BDT)']);
        const shortDescription = this.truncateText(product['Description'] || '', 80);

        return `
            <div class="product-card fade-in" data-product-id="${product['Product ID']}">
                <div class="product-card__image">
                    <img src="${mainImage}" alt="${product['Name']}" class="product-img" loading="lazy">
                    <div class="product-card__actions">
                        <button class="action-btn wishlist-btn" data-product-id="${product['Product ID']}">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="action-btn quick-view-btn" data-product-id="${product['Product ID']}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                
                <div class="product-card__content">
                    <h3 class="product-card__title">
                        <a href="product.html?id=${product['Product ID']}">${product['Name']}</a>
                    </h3>
                    <p class="product-card__description">${shortDescription}</p>
                    
                    <div class="product-card__meta">
                        <div class="product-category">${product['Category']}</div>
                        <div class="product-size">সাইজ: ${product['Size']}</div>
                    </div>
                    
                    <div class="product-card__footer">
                        <div class="product-price">
                            <span class="current-price">${price}</span>
                        </div>
                        <button class="btn btn--primary btn--small add-to-cart-btn" data-product-id="${product['Product ID']}">
                            <i class="fas fa-shopping-cart"></i>
                            <span>কার্টে যোগ</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    attachProductCardEvents() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = btn.dataset.productId;
                this.addToCart(productId);
            });
        });

        // Quick view buttons
        document.querySelectorAll('.quick-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = btn.dataset.productId;
                this.quickViewProduct(productId);
            });
        });

        // Wishlist buttons
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = btn.dataset.productId;
                this.toggleWishlist(productId);
            });
        });
    }

    // ===== CART FUNCTIONALITY =====
    loadCart() {
        try {
            const cart = localStorage.getItem('tinystepsbd_cart');
            return cart ? JSON.parse(cart) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem('tinystepsbd_cart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    async handleAddToCart(event) {
        const button = event.target.closest('.add-to-cart-btn');
        if (!button) return;

        const productId = button.dataset.productId;
        const product = await this.fetchProductById(productId);
        
        if (product) {
            this.addToCart(productId, product);
            button.classList.add('btn--loading');
            
            setTimeout(() => {
                button.classList.remove('btn--loading');
            }, 1000);
        }
    }

    addToCart(productId, productData = null) {
        // If product data is not provided, try to find it in the products array
        let product = productData || this.products.find(p => p['Product ID'] === productId);
        
        if (!product) {
            console.error('Product not found:', productId);
            this.showNotification('পণ্য যোগ করতে সমস্যা হচ্ছে।', 'error');
            return;
        }

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: productId,
                name: product['Name'],
                price: parseFloat(product['Price (BDT)']) || 0,
                image: product['Main Image'] || product['Image1'],
                quantity: 1,
                color: '',
                size: ''
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.showAddToCartSuccess(product['Name']);
    }

    updateCartCount() {
        const cartCountElements = document.querySelectorAll('.nav__cart-count');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
            element.classList.add('cart-pulse');
            
            setTimeout(() => {
                element.classList.remove('cart-pulse');
            }, 300);
        });
    }

    // ===== NOTIFICATIONS =====
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification--${type} notification-enter`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        notification.innerHTML = `
            <div class="notification__icon">
                <i class="${icons[type]}"></i>
            </div>
            <div class="notification__content">
                <p>${message}</p>
            </div>
            <button class="notification__close">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('notification-exit');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);

        // Close button
        notification.querySelector('.notification__close').addEventListener('click', () => {
            notification.classList.add('notification-exit');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        });
    }

    showAddToCartSuccess(productName) {
        this.showNotification(`<strong>${productName}</strong> সফলভাবে কার্টে যোগ করা হয়েছে!`, 'success');
    }

    // ===== UTILITY FUNCTIONS =====
    formatPrice(price) {
        const numPrice = parseFloat(price) || 0;
        return `৳ ${numPrice.toLocaleString('bn-BD')}`;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    getEmptyStateHTML(message) {
        return `
            <div class="empty-state">
                <div class="empty-state__icon">
                    <i class="fas fa-box-open"></i>
                </div>
                <h3 class="empty-state__title">${message}</h3>
                <p class="empty-state__description">দুঃখিত, এই মুহূর্তে কোন পণ্য পাওয়া যায়নি।</p>
            </div>
        `;
    }

    getErrorStateHTML() {
        return `
            <div class="error-state">
                <div class="error-state__icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="error-state__title">লোড করতে সমস্যা হচ্ছে</h3>
                <p class="error-state__description">পণ্য লোড করতে সমস্যা হচ্ছে। অনুগ্রহ করে পৃষ্ঠাটি রিফ্রেশ করুন।</p>
                <button class="btn btn--primary" onclick="location.reload()">
                    <i class="fas fa-redo"></i>
                    রিফ্রেশ করুন
                </button>
            </div>
        `;
    }

    // ===== QUICK VIEW =====
    async quickViewProduct(productId) {
        // Implementation for quick view modal
        console.log('Quick view for product:', productId);
        // This would open a modal with product details
    }

    // ===== WISHLIST =====
    toggleWishlist(productId) {
        // Implementation for wishlist functionality
        console.log('Toggle wishlist for product:', productId);
    }

    // ===== SEARCH =====
    openSearchModal() {
        // Implementation for search modal
        console.log('Open search modal');
    }
}

// ===== GLOBAL INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    window.tinyStepsApp = new TinyStepsBD();
});

// ===== GLOBAL UTILITY FUNCTIONS =====
function formatPrice(price) {
    const numPrice = parseFloat(price) || 0;
    return `৳ ${numPrice.toLocaleString('bn-BD')}`;
}

function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TinyStepsBD, formatPrice, debounce };
}