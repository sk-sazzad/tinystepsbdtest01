// ===== TinyStepsBD - Cart Management JavaScript =====

class CartManager {
    constructor(app) {
        this.app = app;
        this.cart = app.cart;
        this.init();
    }

    init() {
        this.setupCartEvents();
        this.loadCartItems();
        this.updateCartSummary();
    }

    // ===== CART EVENT HANDLERS =====
    setupCartEvents() {
        // Quantity changes
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quantity-btn')) {
                this.handleQuantityChange(e);
            }
        });

        // Quantity input changes
        document.addEventListener('input', debounce((e) => {
            if (e.target.classList.contains('quantity-input')) {
                this.handleManualQuantityChange(e);
            }
        }, 300));

        // Remove item
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-item-btn')) {
                this.handleRemoveItem(e);
            }
        });

        // Clear cart
        const clearCartBtn = document.getElementById('clear-cart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                this.showClearCartConfirmation();
            });
        }

        // Update cart
        const updateCartBtn = document.getElementById('update-cart');
        if (updateCartBtn) {
            updateCartBtn.addEventListener('click', () => {
                this.updateCartFromInputs();
            });
        }

        // Delivery area change
        const deliveryArea = document.getElementById('delivery-area');
        if (deliveryArea) {
            deliveryArea.addEventListener('change', () => {
                this.updateCartSummary();
            });
        }
    }

    // ===== CART RENDERING =====
    loadCartItems() {
        const cartItemsList = document.getElementById('cart-items-list');
        const emptyCart = document.getElementById('empty-cart');
        
        if (!cartItemsList) return;

        if (this.cart.length === 0) {
            cartItemsList.innerHTML = '';
            if (emptyCart) emptyCart.style.display = 'block';
            return;
        }

        if (emptyCart) emptyCart.style.display = 'none';

        const cartItemsHTML = this.cart.map(item => this.createCartItemHTML(item)).join('');
        cartItemsList.innerHTML = cartItemsHTML;
    }

    createCartItemHTML(item) {
        const subtotal = item.price * item.quantity;
        
        return `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item__product">
                    <div class="product-image">
                        <img src="${item.image}" alt="${item.name}" loading="lazy">
                    </div>
                    <div class="product-details">
                        <h4 class="product-name">
                            <a href="product.html?id=${item.id}">${item.name}</a>
                        </h4>
                        <div class="product-variants">
                            ${item.color ? `<span class="variant">রং: ${item.color}</span>` : ''}
                            ${item.size ? `<span class="variant">সাইজ: ${item.size}</span>` : ''}
                        </div>
                        <button class="remove-item-btn" data-product-id="${item.id}">
                            <i class="fas fa-trash"></i>
                            সরান
                        </button>
                    </div>
                </div>
                
                <div class="cart-item__price">
                    <span class="price">${formatPrice(item.price)}</span>
                </div>
                
                <div class="cart-item__quantity">
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease" data-product-id="${item.id}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="quantity-input" value="${item.quantity}" 
                               min="1" max="10" data-product-id="${item.id}">
                        <button class="quantity-btn increase" data-product-id="${item.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                
                <div class="cart-item__total">
                    <span class="total-price">${formatPrice(subtotal)}</span>
                </div>
                
                <div class="cart-item__actions">
                    <button class="action-btn remove-item-btn" data-product-id="${item.id}" title="সরান">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // ===== QUANTITY MANAGEMENT =====
    handleQuantityChange(event) {
        const button = event.target.closest('.quantity-btn');
        const productId = button.dataset.productId;
        const isIncrease = button.classList.contains('increase');
        
        this.updateQuantity(productId, isIncrease ? 1 : -1);
    }

    handleManualQuantityChange(event) {
        const input = event.target;
        const productId = input.dataset.productId;
        const newQuantity = parseInt(input.value) || 1;
        
        this.setQuantity(productId, newQuantity);
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;

        const newQuantity = item.quantity + change;
        
        if (newQuantity < 1) {
            this.showRemoveItemConfirmation(productId);
            return;
        }

        if (newQuantity > 10) {
            this.app.showNotification('সর্বোচ্চ ১০টি পণ্য অর্ডার করা যাবে', 'warning');
            return;
        }

        item.quantity = newQuantity;
        this.saveAndUpdateCart();
    }

    setQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;

        if (quantity < 1) {
            this.showRemoveItemConfirmation(productId);
            return;
        }

        if (quantity > 10) {
            this.app.showNotification('সর্বোচ্চ ১০টি পণ্য অর্ডার করা যাবে', 'warning');
            quantity = 10;
        }

        item.quantity = quantity;
        this.saveAndUpdateCart();
    }

    // ===== ITEM REMOVAL =====
    handleRemoveItem(event) {
        const button = event.target.closest('.remove-item-btn');
        const productId = button.dataset.productId;
        
        this.showRemoveItemConfirmation(productId);
    }

    showRemoveItemConfirmation(productId) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;

        const modal = document.getElementById('remove-item-modal');
        const message = document.getElementById('remove-item-message');
        
        if (modal && message) {
            message.textContent = `আপনি কি নিশ্চিত যে আপনি "${item.name}" কার্ট থেকে সরাতে চান?`;
            
            const confirmBtn = document.getElementById('confirm-remove');
            const cancelBtn = document.getElementById('cancel-remove');
            
            const confirmHandler = () => {
                this.removeItem(productId);
                modal.style.display = 'none';
                confirmBtn.removeEventListener('click', confirmHandler);
                cancelBtn.removeEventListener('click', cancelHandler);
            };
            
            const cancelHandler = () => {
                modal.style.display = 'none';
                confirmBtn.removeEventListener('click', confirmHandler);
                cancelBtn.removeEventListener('click', cancelHandler);
            };
            
            confirmBtn.addEventListener('click', confirmHandler);
            cancelBtn.addEventListener('click', cancelHandler);
            
            modal.style.display = 'flex';
        } else {
            // Fallback if modal doesn't exist
            if (confirm(`আপনি কি নিশ্চিত যে আপনি "${item.name}" কার্ট থেকে সরাতে চান?`)) {
                this.removeItem(productId);
            }
        }
    }

    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveAndUpdateCart();
        this.app.showNotification('পণ্য কার্ট থেকে সরানো হয়েছে', 'info');
    }

    // ===== CART MANAGEMENT =====
    showClearCartConfirmation() {
        const modal = document.getElementById('clear-cart-modal');
        
        if (modal) {
            const confirmBtn = document.getElementById('confirm-clear');
            const cancelBtn = document.getElementById('cancel-clear');
            
            const confirmHandler = () => {
                this.clearCart();
                modal.style.display = 'none';
                confirmBtn.removeEventListener('click', confirmHandler);
                cancelBtn.removeEventListener('click', cancelHandler);
            };
            
            const cancelHandler = () => {
                modal.style.display = 'none';
                confirmBtn.removeEventListener('click', confirmHandler);
                cancelBtn.removeEventListener('click', cancelHandler);
            };
            
            confirmBtn.addEventListener('click', confirmHandler);
            cancelBtn.addEventListener('click', cancelHandler);
            
            modal.style.display = 'flex';
        } else {
            // Fallback if modal doesn't exist
            if (confirm('আপনি কি নিশ্চিত যে আপনি সম্পূর্ণ কার্ট খালি করতে চান?')) {
                this.clearCart();
            }
        }
    }

    clearCart() {
        this.cart = [];
        this.saveAndUpdateCart();
        this.app.showNotification('কার্ট খালি করা হয়েছে', 'info');
    }

    updateCartFromInputs() {
        let hasChanges = false;
        
        document.querySelectorAll('.quantity-input').forEach(input => {
            const productId = input.dataset.productId;
            const quantity = parseInt(input.value) || 1;
            const item = this.cart.find(item => item.id === productId);
            
            if (item && item.quantity !== quantity) {
                item.quantity = quantity;
                hasChanges = true;
            }
        });

        if (hasChanges) {
            this.saveAndUpdateCart();
            this.app.showNotification('কার্ট আপডেট করা হয়েছে', 'success');
        }
    }

    // ===== CART SUMMARY =====
    updateCartSummary() {
        this.updateSubtotal();
        this.updateDeliveryCharge();
        this.updateTotal();
    }

    updateSubtotal() {
        const subtotalElement = document.getElementById('cart-subtotal');
        if (!subtotalElement) return;

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        subtotalElement.textContent = formatPrice(subtotal);
    }

    updateDeliveryCharge() {
        const deliveryChargeElement = document.getElementById('delivery-charge');
        const deliveryNoteElement = document.getElementById('delivery-note');
        if (!deliveryChargeElement) return;

        const deliveryArea = document.getElementById('delivery-area');
        let deliveryCharge = 150; // Default outside Dhaka

        if (deliveryArea && deliveryArea.value === 'inside-dhaka') {
            deliveryCharge = 80;
            if (deliveryNoteElement) {
                deliveryNoteElement.textContent = '(ঢাকা শহরের ভিতরে)';
            }
        } else {
            if (deliveryNoteElement) {
                deliveryNoteElement.textContent = '(ঢাকার বাইরে)';
            }
        }

        deliveryChargeElement.textContent = formatPrice(deliveryCharge);
        return deliveryCharge;
    }

    updateTotal() {
        const totalElement = document.getElementById('cart-total');
        if (!totalElement) return;

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryCharge = this.updateDeliveryCharge();
        const total = subtotal + deliveryCharge;

        totalElement.textContent = formatPrice(total);
    }

    // ===== CART PERSISTENCE =====
    saveAndUpdateCart() {
        this.app.saveCart();
        this.app.updateCartCount();
        this.loadCartItems();
        this.updateCartSummary();
        
        // Update proceed to checkout button state
        this.updateCheckoutButton();
    }

    updateCheckoutButton() {
        const checkoutBtn = document.getElementById('proceed-checkout');
        if (checkoutBtn) {
            if (this.cart.length === 0) {
                checkoutBtn.style.opacity = '0.6';
                checkoutBtn.style.pointerEvents = 'none';
            } else {
                checkoutBtn.style.opacity = '1';
                checkoutBtn.style.pointerEvents = 'auto';
            }
        }
    }

    // ===== CART DATA GETTERS =====
    getCartItems() {
        return this.cart;
    }

    getCartTotal() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryCharge = this.getDeliveryCharge();
        return subtotal + deliveryCharge;
    }

    getDeliveryCharge() {
        const deliveryArea = document.getElementById('delivery-area');
        if (deliveryArea && deliveryArea.value === 'inside-dhaka') {
            return 80;
        }
        return 150;
    }

    getCartSummary() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryCharge = this.getDeliveryCharge();
        const total = subtotal + deliveryCharge;

        return {
            subtotal,
            deliveryCharge,
            total,
            itemCount: this.cart.reduce((sum, item) => sum + item.quantity, 0)
        };
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    if (window.tinyStepsApp && document.getElementById('cart-items-list')) {
        window.cartManager = new CartManager(window.tinyStepsApp);
    }
});