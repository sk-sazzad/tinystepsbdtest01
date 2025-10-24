// ===== TinyStepsBD - Product Page JavaScript =====

class ProductPage {
    constructor(app) {
        this.app = app;
        this.product = null;
        this.currentImageIndex = 0;
        this.selectedColor = '';
        this.selectedSize = '';
        this.init();
    }

    async init() {
        await this.loadProduct();
        this.setupEventListeners();
        this.setupImageGallery();
        this.loadRelatedProducts();
    }

    // ===== PRODUCT LOADING =====
    async loadProduct() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) {
            this.showErrorState('পণ্য আইডি পাওয়া যায়নি');
            return;
        }

        this.showLoadingState();

        try {
            this.product = await this.app.fetchProductById(productId);
            
            if (this.product) {
                this.renderProduct();
                this.updateBreadcrumb();
            } else {
                this.showErrorState('পণ্য পাওয়া যায়নি');
            }
        } catch (error) {
            console.error('Error loading product:', error);
            this.showErrorState('পণ্য লোড করতে সমস্যা হচ্ছে');
        }
    }

    // ===== PRODUCT RENDERING =====
    renderProduct() {
        this.updateProductBasicInfo();
        this.renderProductImages();
        this.renderColorOptions();
        this.renderSizeOptions();
        this.setupTabs();
    }

    updateProductBasicInfo() {
        // Update basic product information
        const selectors = {
            'product-title': 'Name',
            'product-price': 'Price (BDT)',
            'product-description': 'Description',
            'full-description': 'Description',
            'product-id': 'Product ID',
            'product-category': 'Category'
        };

        Object.entries(selectors).forEach(([selector, property]) => {
            const element = document.getElementById(selector);
            if (element) {
                if (selector === 'product-price') {
                    element.textContent = this.app.formatPrice(this.product[property]);
                } else {
                    element.textContent = this.product[property] || 'N/A';
                }
            }
        });

        // Update breadcrumb category
        const categoryBreadcrumb = document.getElementById('product-category-breadcrumb');
        if (categoryBreadcrumb) {
            categoryBreadcrumb.textContent = this.product['Name'];
        }
    }

    renderProductImages() {
        const mainImage = document.getElementById('main-product-image');
        const thumbnailsContainer = document.getElementById('gallery-thumbnails');

        if (!mainImage || !thumbnailsContainer) return;

        // Get all available images
        const images = this.getProductImages();
        
        if (images.length === 0) {
            mainImage.src = 'assets/images/placeholder.jpg';
            thumbnailsContainer.innerHTML = '<p>কোন ছবি পাওয়া যায়নি</p>';
            return;
        }

        // Set main image
        mainImage.src = images[0];
        mainImage.alt = this.product['Name'];

        // Create thumbnails
        const thumbnailsHTML = images.map((image, index) => `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${image}" alt="${this.product['Name']} - Image ${index + 1}" loading="lazy">
            </div>
        `).join('');

        thumbnailsContainer.innerHTML = thumbnailsHTML;

        // Add thumbnail click events
        this.setupThumbnailEvents();
    }

    getProductImages() {
        const images = [];
        
        // Check main image
        if (this.product['Main Image']) {
            images.push(this.product['Main Image']);
        }

        // Check additional images (Image1 to Image10)
        for (let i = 1; i <= 10; i++) {
            const imageKey = `Image${i}`;
            if (this.product[imageKey]) {
                images.push(this.product[imageKey]);
            }
        }

        return images;
    }

    // ===== IMAGE GALLERY =====
    setupImageGallery() {
        const mainImage = document.getElementById('main-product-image');
        const zoomBtn = document.getElementById('zoom-btn');
        const zoomModal = document.getElementById('image-zoom-modal');

        if (zoomBtn && zoomModal) {
            zoomBtn.addEventListener('click', () => {
                this.openImageZoom(mainImage.src);
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeImageZoom();
            }
        });
    }

    setupThumbnailEvents() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        const mainImage = document.getElementById('main-product-image');

        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', () => {
                const index = parseInt(thumbnail.dataset.index);
                this.changeMainImage(index);
                
                // Update active thumbnail
                thumbnails.forEach(t => t.classList.remove('active'));
                thumbnail.classList.add('active');
            });
        });
    }

    changeMainImage(index) {
        const images = this.getProductImages();
        const mainImage = document.getElementById('main-product-image');
        
        if (mainImage && images[index]) {
            mainImage.src = images[index];
            this.currentImageIndex = index;
        }
    }

    openImageZoom(imageSrc) {
        const zoomModal = document.getElementById('image-zoom-modal');
        const zoomedImage = document.getElementById('zoomed-image');
        const zoomClose = document.getElementById('zoom-close');

        if (zoomModal && zoomedImage) {
            zoomedImage.src = imageSrc;
            zoomModal.style.display = 'flex';

            if (zoomClose) {
                zoomClose.onclick = () => this.closeImageZoom();
            }

            // Close modal when clicking outside
            zoomModal.addEventListener('click', (e) => {
                if (e.target === zoomModal) {
                    this.closeImageZoom();
                }
            });
        }
    }

    closeImageZoom() {
        const zoomModal = document.getElementById('image-zoom-modal');
        if (zoomModal) {
            zoomModal.style.display = 'none';
        }
    }

    // ===== COLOR & SIZE SELECTION =====
    renderColorOptions() {
        const colorContainer = document.getElementById('color-options');
        if (!colorContainer || !this.product['Color']) return;

        const colors = this.product['Color'].split(',').map(color => color.trim());
        
        const colorsHTML = colors.map(color => `
            <label class="color-option">
                <input type="radio" name="product-color" value="${color}" ${this.selectedColor === color ? 'checked' : ''}>
                <span class="color-checkmark" style="background-color: ${this.getColorCode(color)}" title="${color}"></span>
            </label>
        `).join('');

        colorContainer.innerHTML = colorsHTML;
        this.setupColorEvents();
    }

    renderSizeOptions() {
        const sizeContainer = document.getElementById('size-options');
        if (!sizeContainer || !this.product['Size']) return;

        const sizes = this.product['Size'].split('-').map(size => size.trim());
        
        const sizesHTML = sizes.map(size => `
            <label class="size-option">
                <input type="radio" name="product-size" value="${size}" ${this.selectedSize === size ? 'checked' : ''}>
                <span class="size-checkmark">${size}</span>
            </label>
        `).join('');

        sizeContainer.innerHTML = sizesHTML;
        this.setupSizeEvents();
    }

    setupColorEvents() {
        const colorInputs = document.querySelectorAll('input[name="product-color"]');
        colorInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.selectedColor = e.target.value;
            });
        });
    }

    setupSizeEvents() {
        const sizeInputs = document.querySelectorAll('input[name="product-size"]');
        sizeInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.selectedSize = e.target.value;
            });
        });
    }

    getColorCode(colorName) {
        const colorMap = {
            'সাদা': '#FFFFFF',
            'কালো': '#000000',
            'নীল': '#0000FF',
            'গোলাপি': '#FFC0CB',
            'লাল': '#FF0000',
            'সবুজ': '#008000',
            'বাদামী': '#A52A2A',
            'ধূসর': '#808080',
            'কমলা': '#FFA500',
            'গাঢ় বাদামী': '#654321',
            'আর্মি গ্রিন': '#4B5320',
            'খুবানি': '#FFB6C1',
            'রূপা': '#C0C0C0',
            'গোল্ড': '#FFD700'
        };

        return colorMap[colorName] || '#CCCCCC';
    }

    // ===== TABS =====
    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                
                // Update active tab button
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active tab pane
                tabPanes.forEach(pane => pane.classList.remove('active'));
                document.getElementById(`${tabId}-tab`).classList.add('active');

                // Load tab content if needed
                this.loadTabContent(tabId);
            });
        });

        // Load initial tab content
        this.loadTabContent('description');
    }

    loadTabContent(tabId) {
        switch (tabId) {
            case 'specifications':
                this.loadSpecificationsTab();
                break;
            case 'reviews':
                this.loadReviewsTab();
                break;
            case 'shipping':
                // Shipping tab is static, no need to load
                break;
        }
    }

    loadSpecificationsTab() {
        const specs = {
            'spec-product-id': this.product['Product ID'],
            'spec-category': this.product['Category'],
            'spec-size': this.product['Size'],
            'spec-colors': this.product['Color'],
            'spec-material': 'পিইউ লেদার',
            'spec-age-group': '০-৬ বছর'
        };

        Object.entries(specs).forEach(([selector, value]) => {
            const element = document.getElementById(selector);
            if (element) {
                element.textContent = value || 'N/A';
            }
        });
    }

    loadReviewsTab() {
        // This would typically fetch reviews from an API
        // For now, we'll use static content or show a message
        const reviewsContainer = document.querySelector('.reviews-list');
        if (reviewsContainer) {
            reviewsContainer.innerHTML = `
                <div class="no-reviews">
                    <i class="fas fa-comment-alt"></i>
                    <h4>কোন রিভিউ নেই</h4>
                    <p>এই পণ্যের জন্য এখনও কোন রিভিউ নেই। প্রথম রিভিউ দিন!</p>
                </div>
            `;
        }
    }

    // ===== RELATED PRODUCTS =====
    async loadRelatedProducts() {
        const relatedContainer = document.getElementById('related-products');
        if (!relatedContainer) return;

        try {
            const allProducts = await this.app.fetchProducts();
            const relatedProducts = allProducts
                .filter(product => 
                    product['Product ID'] !== this.product['Product ID'] && 
                    product['Category'] === this.product['Category']
                )
                .slice(0, 4);

            if (relatedProducts.length > 0) {
                this.app.renderProducts(relatedProducts, relatedContainer);
            } else {
                relatedContainer.innerHTML = this.app.getEmptyStateHTML('কোন সম্পর্কিত পণ্য পাওয়া যায়নি');
            }
        } catch (error) {
            relatedContainer.innerHTML = this.app.getErrorStateHTML();
        }
    }

    // ===== EVENT HANDLERS =====
    setupEventListeners() {
        // Quantity controls
        const decreaseBtn = document.getElementById('decrease-qty');
        const increaseBtn = document.getElementById('increase-qty');
        const quantityInput = document.getElementById('quantity-input');

        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                this.changeQuantity(-1);
            });
        }

        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => {
                this.changeQuantity(1);
            });
        }

        if (quantityInput) {
            quantityInput.addEventListener('input', debounce(() => {
                this.validateQuantity();
            }, 300));
        }

        // Add to cart
        const addToCartBtn = document.getElementById('add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                this.addToCart();
            });
        }

        // Wishlist
        const wishlistBtn = document.getElementById('add-to-wishlist');
        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', () => {
                this.toggleWishlist();
            });
        }
    }

    // ===== QUANTITY MANAGEMENT =====
    changeQuantity(change) {
        const quantityInput = document.getElementById('quantity-input');
        if (!quantityInput) return;

        let newQuantity = parseInt(quantityInput.value) + change;
        
        if (newQuantity < 1) newQuantity = 1;
        if (newQuantity > 10) {
            this.app.showNotification('সর্বোচ্চ ১০টি পণ্য অর্ডার করা যাবে', 'warning');
            newQuantity = 10;
        }

        quantityInput.value = newQuantity;
    }

    validateQuantity() {
        const quantityInput = document.getElementById('quantity-input');
        if (!quantityInput) return;

        let quantity = parseInt(quantityInput.value) || 1;
        
        if (quantity < 1) quantity = 1;
        if (quantity > 10) {
            this.app.showNotification('সর্বোচ্চ ১০টি পণ্য অর্ডার করা যাবে', 'warning');
            quantity = 10;
        }

        quantityInput.value = quantity;
    }

    // ===== ADD TO CART =====
    addToCart() {
        if (!this.product) return;

        const quantityInput = document.getElementById('quantity-input');
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

        // Add product to cart with variations
        this.app.addToCart(this.product['Product ID'], this.product);

        // Show success modal
        this.showAddToCartSuccess();
    }

    showAddToCartSuccess() {
        const modal = document.getElementById('cart-success-modal');
        if (!modal) return;

        const continueShopping = document.getElementById('continue-shopping');
        
        modal.style.display = 'flex';

        if (continueShopping) {
            continueShopping.onclick = () => {
                modal.style.display = 'none';
            };
        }

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // ===== WISHLIST =====
    toggleWishlist() {
        const wishlistBtn = document.getElementById('add-to-wishlist');
        if (!wishlistBtn) return;

        const icon = wishlistBtn.querySelector('i');
        
        if (icon.classList.contains('far')) {
            // Add to wishlist
            icon.classList.remove('far');
            icon.classList.add('fas');
            this.app.showNotification('পণ্য উইশলিস্টে যোগ করা হয়েছে', 'success');
        } else {
            // Remove from wishlist
            icon.classList.remove('fas');
            icon.classList.add('far');
            this.app.showNotification('পণ্য উইশলিস্ট থেকে সরানো হয়েছে', 'info');
        }

        wishlistBtn.classList.add('heartbeat');
        setTimeout(() => {
            wishlistBtn.classList.remove('heartbeat');
        }, 1000);
    }

    // ===== UTILITY METHODS =====
    updateBreadcrumb() {
        const categoryBreadcrumb = document.getElementById('product-category-breadcrumb');
        if (categoryBreadcrumb && this.product) {
            categoryBreadcrumb.textContent = this.product['Name'];
        }
    }

    showLoadingState() {
        const elementsToHide = [
            'product-title', 'product-price', 'product-description',
            'gallery-thumbnails', 'color-options', 'size-options'
        ];

        elementsToHide.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = '<div class="loading-skeleton"></div>';
            }
        });
    }

    showErrorState(message) {
        const mainContent = document.querySelector('.product-detail__content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-state">
                    <div class="error-state__icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 class="error-state__title">${message}</h3>
                    <p class="error-state__description">পৃষ্ঠাটি রিফ্রেশ করুন বা হোমপেজে ফিরে যান</p>
                    <div class="error-state__actions">
                        <button class="btn btn--primary" onclick="location.reload()">
                            <i class="fas fa-redo"></i>
                            রিফ্রেশ করুন
                        </button>
                        <a href="index.html" class="btn btn--outline">
                            <i class="fas fa-home"></i>
                            হোমপেজে ফিরে যান
                        </a>
                    </div>
                </div>
            `;
        }
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    if (window.tinyStepsApp && window.location.pathname.includes('product.html')) {
        window.productPage = new ProductPage(window.tinyStepsApp);
    }
});