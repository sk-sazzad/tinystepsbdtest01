// ===== TinyStepsBD - Checkout Process JavaScript =====

class CheckoutProcess {
    constructor(app) {
        this.app = app;
        this.cart = app.cart;
        this.formData = {};
        this.isSubmitting = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadOrderSummary();
        this.setupFormValidation();
        this.setupPaymentMethods();
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Form submission
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission();
            });
        }

        // Delivery area change
        const deliveryArea = document.getElementById('delivery-area');
        if (deliveryArea) {
            deliveryArea.addEventListener('change', () => {
                this.updateOrderSummary();
            });
        }

        // Payment method change
        const paymentMethods = document.querySelectorAll('input[name="payment_method"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', (e) => {
                this.handlePaymentMethodChange(e.target.value);
            });
        });

        // Real-time form validation
        this.setupRealTimeValidation();
    }

    // ===== FORM VALIDATION =====
    setupFormValidation() {
        const form = document.getElementById('checkout-form');
        if (!form) return;

        // Add input event listeners for real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    setupRealTimeValidation() {
        // Phone number formatting
        const phoneInput = document.getElementById('customer-phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        }

        // Email validation
        const emailInput = document.getElementById('customer-email');
        if (emailInput) {
            emailInput.addEventListener('blur', (e) => {
                this.validateEmail(e.target);
            });
        }
    }

    // ===== FORM FIELD VALIDATION =====
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'customer_name':
                if (!value) {
                    errorMessage = 'নাম আবশ্যক';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'নাম খুব ছোট';
                    isValid = false;
                }
                break;

            case 'customer_phone':
                if (!value) {
                    errorMessage = 'মোবাইল নম্বর আবশ্যক';
                    isValid = false;
                } else if (!this.validateBangladeshiPhone(value)) {
                    errorMessage = 'সঠিক মোবাইল নম্বর দিন';
                    isValid = false;
                }
                break;

            case 'customer_email':
                if (value && !this.validateEmail(value)) {
                    errorMessage = 'সঠিক ইমেইল ঠিকানা দিন';
                    isValid = false;
                }
                break;

            case 'delivery_address':
                if (!value) {
                    errorMessage = 'ঠিকানা আবশ্যক';
                    isValid = false;
                } else if (value.length < 10) {
                    errorMessage = 'সম্পূর্ণ ঠিকানা লিখুন';
                    isValid = false;
                }
                break;

            case 'delivery_area':
                if (!value) {
                    errorMessage = 'এলাকা নির্বাচন করুন';
                    isValid = false;
                }
                break;

            case 'delivery_city':
                if (!value) {
                    errorMessage = 'শহর/জেলা লিখুন';
                    isValid = false;
                }
                break;

            case 'payment_number':
                if (this.isDigitalPaymentSelected() && !value) {
                    errorMessage = 'মোবাইল নম্বর আবশ্যক';
                    isValid = false;
                } else if (value && !this.validateBangladeshiPhone(value)) {
                    errorMessage = 'সঠিক মোবাইল নম্বর দিন';
                    isValid = false;
                }
                break;

            case 'transaction_id':
                if (this.isDigitalPaymentSelected() && !value) {
                    errorMessage = 'ট্রানজেকশন আইডি আবশ্যক';
                    isValid = false;
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    validateForm() {
        const form = document.getElementById('checkout-form');
        const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        // Validate all required fields
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Validate terms agreement
        const termsCheckbox = document.getElementById('agree-terms');
        if (termsCheckbox && !termsCheckbox.checked) {
            this.showFieldError(termsCheckbox, 'আপনাকে Terms and Conditions সাথে সম্মত হতে হবে');
            isValid = false;
        } else {
            this.clearFieldError(termsCheckbox);
        }

        // Validate digital payment fields if selected
        if (this.isDigitalPaymentSelected()) {
            const paymentNumber = document.getElementById('payment-number');
            const transactionId = document.getElementById('transaction-id');

            if (!this.validateField(paymentNumber) || !this.validateField(transactionId)) {
                isValid = false;
            }
        }

        return isValid;
    }

    // ===== FIELD VALIDATION HELPERS =====
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validateBangladeshiPhone(phone) {
        const re = /^(?:\+88|88)?01[3-9]\d{8}$/;
        return re.test(phone.replace(/\s+/g, ''));
    }

    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.startsWith('88')) {
            value = value.substring(2);
        }
        
        if (value.startsWith('+88')) {
            value = value.substring(3);
        }
        
        if (value.length > 0 && !value.startsWith('01')) {
            value = '01' + value;
        }
        
        if (value.length > 11) {
            value = value.substring(0, 11);
        }
        
        input.value = value;
    }

    // ===== ERROR HANDLING =====
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error show';
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        
        const existingError = field.parentNode.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }
    }

    // ===== ORDER SUMMARY =====
    loadOrderSummary() {
        this.updateOrderItems();
        this.updateOrderSummary();
    }

    updateOrderItems() {
        const orderItemsContainer = document.getElementById('order-items');
        if (!orderItemsContainer) return;

        if (this.cart.length === 0) {
            orderItemsContainer.innerHTML = `
                <div class="empty-order">
                    <i class="fas fa-shopping-cart"></i>
                    <p>আপনার কার্ট খালি</p>
                </div>
            `;
            return;
        }

        const itemsHTML = this.cart.map(item => this.createOrderItemHTML(item)).join('');
        orderItemsContainer.innerHTML = itemsHTML;
    }

    createOrderItemHTML(item) {
        const subtotal = item.price * item.quantity;
        
        return `
            <div class="order-item" data-product-id="${item.id}">
                <div class="order-item__image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="order-item__details">
                    <h4 class="order-item__name">${item.name}</h4>
                    <div class="order-item__meta">
                        <span class="quantity">পরিমাণ: ${item.quantity}</span>
                        ${item.color ? `<span class="color">রং: ${item.color}</span>` : ''}
                        ${item.size ? `<span class="size">সাইজ: ${item.size}</span>` : ''}
                    </div>
                </div>
                <div class="order-item__price">
                    ${formatPrice(subtotal)}
                </div>
            </div>
        `;
    }

    updateOrderSummary() {
        this.updateSubtotal();
        this.updateDeliveryFee();
        this.updateTotal();
        this.updateDeliveryEstimate();
    }

    updateSubtotal() {
        const subtotalElement = document.getElementById('order-subtotal');
        if (!subtotalElement) return;

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        subtotalElement.textContent = formatPrice(subtotal);
    }

    updateDeliveryFee() {
        const deliveryElement = document.getElementById('order-delivery');
        if (!deliveryElement) return;

        const deliveryFee = this.getDeliveryFee();
        deliveryElement.textContent = formatPrice(deliveryFee);
    }

    updateTotal() {
        const totalElement = document.getElementById('order-total');
        if (!totalElement) return;

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = this.getDeliveryFee();
        const total = subtotal + deliveryFee;

        totalElement.textContent = formatPrice(total);
    }

    updateDeliveryEstimate() {
        const estimateElement = document.getElementById('delivery-estimate');
        if (!estimateElement) return;

        const deliveryArea = document.getElementById('delivery-area');
        if (deliveryArea && deliveryArea.value === 'inside-dhaka') {
            estimateElement.textContent = '২-৩ কার্যদিবস';
        } else {
            estimateElement.textContent = '৩-৫ কার্যদিবস';
        }
    }

    getDeliveryFee() {
        const deliveryArea = document.getElementById('delivery-area');
        if (deliveryArea && deliveryArea.value === 'inside-dhaka') {
            return 80;
        }
        return 150;
    }

    // ===== PAYMENT METHODS =====
    setupPaymentMethods() {
        // Set default payment method to COD
        const codMethod = document.querySelector('input[value="cash_on_delivery"]');
        if (codMethod) {
            codMethod.checked = true;
        }
    }

    handlePaymentMethodChange(method) {
        const digitalPaymentSection = document.getElementById('digital-payment-details');
        
        if (method === 'cash_on_delivery') {
            if (digitalPaymentSection) {
                digitalPaymentSection.style.display = 'none';
            }
        } else {
            if (digitalPaymentSection) {
                digitalPaymentSection.style.display = 'block';
            }
        }
    }

    isDigitalPaymentSelected() {
        const selectedMethod = document.querySelector('input[name="payment_method"]:checked');
        return selectedMethod && selectedMethod.value !== 'cash_on_delivery';
    }

    // ===== FORM SUBMISSION =====
    async handleFormSubmission() {
        if (this.isSubmitting) return;

        // Validate form
        if (!this.validateForm()) {
            this.app.showNotification('দয়া করে সমস্ত প্রয়োজনীয় তথ্য সঠিকভাবে পূরণ করুন', 'error');
            return;
        }

        // Validate cart
        if (this.cart.length === 0) {
            this.app.showNotification('আপনার কার্ট খালি', 'error');
            return;
        }

        this.isSubmitting = true;
        this.showLoadingState();

        try {
            const orderData = this.prepareOrderData();
            const result = await this.submitOrder(orderData);
            
            if (result.success) {
                await this.handleOrderSuccess(result);
            } else {
                throw new Error(result.error || 'অর্ডার জমা দিতে সমস্যা হয়েছে');
            }
        } catch (error) {
            this.handleOrderError(error);
        } finally {
            this.isSubmitting = false;
            this.hideLoadingState();
        }
    }

    prepareOrderData() {
        const form = document.getElementById('checkout-form');
        const formData = new FormData(form);
        
        const orderData = {
            customer_name: formData.get('customer_name'),
            customer_phone: formData.get('customer_phone'),
            customer_email: formData.get('customer_email') || '',
            delivery_address: formData.get('delivery_address'),
            delivery_area: formData.get('delivery_area'),
            delivery_city: formData.get('delivery_city'),
            delivery_notes: formData.get('delivery_notes') || '',
            payment_method: formData.get('payment_method'),
            products: this.cart.map(item => ({
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                price: item.price,
                color: item.color,
                size: item.size,
                main_image: item.image
            })),
            special_notes: formData.get('delivery_notes') || ''
        };

        // Add digital payment details if applicable
        if (this.isDigitalPaymentSelected()) {
            orderData.payment_number = formData.get('payment_number');
            orderData.transaction_id = formData.get('transaction_id');
        }

        return orderData;
    }

    async submitOrder(orderData) {
        const response = await fetch(this.app.API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async handleOrderSuccess(result) {
        // Clear cart
        this.cart = [];
        this.app.saveCart();
        this.app.updateCartCount();

        // Store order details for success page
        localStorage.setItem('last_order_details', JSON.stringify({
            order_id: result.data.order_id,
            customer_name: result.data.customer_name,
            total_amount: result.data.total_amount,
            delivery_fee: result.data.delivery_fee,
            payment_method: result.data.payment_method
        }));

        // Redirect to success page
        window.location.href = `success.html?order_id=${result.data.order_id}`;
    }

    handleOrderError(error) {
        console.error('Order submission error:', error);
        
        let errorMessage = 'অর্ডার জমা দিতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।';
        
        if (error.message.includes('Network')) {
            errorMessage = 'নেটওয়ার্ক সমস্যা। ইন্টারনেট কানেকশন চেক করুন।';
        } else if (error.message.includes('500')) {
            errorMessage = 'সার্ভার সমস্যা। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।';
        }

        this.showErrorModal(errorMessage);
    }

    // ===== UI STATES =====
    showLoadingState() {
        const overlay = document.getElementById('loading-overlay');
        const submitBtn = document.getElementById('place-order-btn');
        
        if (overlay) overlay.style.display = 'flex';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>প্রসেস হচ্ছে...</span>';
        }
    }

    hideLoadingState() {
        const overlay = document.getElementById('loading-overlay');
        const submitBtn = document.getElementById('place-order-btn');
        
        if (overlay) overlay.style.display = 'none';
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-shopping-bag"></i><span>অর্ডার কনফার্ম করুন</span>';
        }
    }

    showErrorModal(message) {
        const modal = document.getElementById('error-modal');
        const errorMessage = document.getElementById('error-message');
        const closeBtn = document.getElementById('error-close');
        
        if (modal && errorMessage) {
            errorMessage.textContent = message;
            modal.style.display = 'flex';

            if (closeBtn) {
                closeBtn.onclick = () => {
                    modal.style.display = 'none';
                };
            }

            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        } else {
            // Fallback alert
            alert(message);
        }
    }

    // ===== ORDER SUMMARY CALCULATIONS =====
    getOrderSummary() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = this.getDeliveryFee();
        const total = subtotal + deliveryFee;

        return {
            subtotal,
            deliveryFee,
            total,
            itemCount: this.cart.reduce((sum, item) => sum + item.quantity, 0)
        };
    }

    // ===== ADDRESS AUTO-COMPLETION =====
    setupAddressAutocomplete() {
        // This would integrate with a maps API for address autocomplete
        // For now, we'll implement a simple version that suggests cities
        
        const cityInput = document.getElementById('delivery-city');
        if (cityInput) {
            const commonCities = ['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ'];
            
            cityInput.addEventListener('input', debounce((e) => {
                this.showCitySuggestions(e.target, commonCities);
            }, 300));
        }
    }

    showCitySuggestions(input, cities) {
        // Remove existing suggestions
        const existingList = input.parentNode.querySelector('.suggestions-list');
        if (existingList) {
            existingList.remove();
        }

        const value = input.value.toLowerCase();
        if (!value) return;

        const filteredCities = cities.filter(city => 
            city.toLowerCase().includes(value)
        );

        if (filteredCities.length === 0) return;

        const suggestionsList = document.createElement('ul');
        suggestionsList.className = 'suggestions-list';
        
        filteredCities.forEach(city => {
            const li = document.createElement('li');
            li.textContent = city;
            li.addEventListener('click', () => {
                input.value = city;
                suggestionsList.remove();
            });
            suggestionsList.appendChild(li);
        });

        input.parentNode.appendChild(suggestionsList);
    }

    // ===== FORM PERSISTENCE =====
    setupFormPersistence() {
        // Save form data to localStorage on input
        const form = document.getElementById('checkout-form');
        if (!form) return;

        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', debounce(() => {
                this.saveFormData();
            }, 500));
        });

        // Load saved form data
        this.loadFormData();
    }

    saveFormData() {
        const form = document.getElementById('checkout-form');
        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        localStorage.setItem('checkout_form_data', JSON.stringify(data));
    }

    loadFormData() {
        const savedData = localStorage.getItem('checkout_form_data');
        if (!savedData) return;

        const data = JSON.parse(savedData);
        const form = document.getElementById('checkout-form');

        Object.keys(data).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = data[key];
                
                // Trigger change event for select elements
                if (input.tagName === 'SELECT') {
                    input.dispatchEvent(new Event('change'));
                }
            }
        });
    }

    clearFormData() {
        localStorage.removeItem('checkout_form_data');
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    if (window.tinyStepsApp && document.getElementById('checkout-form')) {
        window.checkoutProcess = new CheckoutProcess(window.tinyStepsApp);
    }
});

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CheckoutProcess };
}