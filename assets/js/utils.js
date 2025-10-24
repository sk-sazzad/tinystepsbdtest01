// ===== TinyStepsBD - Utility Functions =====

// ===== FORMATTING UTILITIES =====
function formatPrice(price) {
    const numPrice = parseFloat(price) || 0;
    return `৳ ${numPrice.toLocaleString('bn-BD')}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'Asia/Dhaka'
    };
    return date.toLocaleDateString('bn-BD', options);
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Dhaka'
    };
    return date.toLocaleDateString('bn-BD', options);
}

// ===== STRING UTILITIES =====
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// ===== NUMBER UTILITIES =====
function generateOrderId() {
    const timestamp = new Date().getTime().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TS-${timestamp}-${random}`;
}

function calculateDeliveryFee(area) {
    if (!area) return 150;
    
    const dhakaAreas = ['ঢাকা', 'Dhaka', 'DHAKA', 'মিরপুর', 'উত্তরা', 'গুলশান', 'বনানী', 'ধানমন্ডি', 'মোহাম্মদপুর'];
    const isInsideDhaka = dhakaAreas.some(dhakaArea => 
        area.toLowerCase().includes(dhakaArea.toLowerCase())
    );
    
    return isInsideDhaka ? 80 : 150;
}

// ===== VALIDATION UTILITIES =====
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^(?:\+88|01)?(?:\d{11}|\d{13})$/;
    return re.test(phone.replace(/\s+/g, ''));
}

function validateBangladeshiPhone(phone) {
    const re = /^(?:\+88|88)?01[3-9]\d{8}$/;
    return re.test(phone.replace(/\s+/g, ''));
}

// ===== DOM UTILITIES =====
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

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function getScrollParent(element) {
    while (element.parentElement) {
        const style = getComputedStyle(element.parentElement);
        if (/(auto|scroll)/.test(style.overflow + style.overflowY + style.overflowX)) {
            return element.parentElement;
        }
        element = element.parentElement;
    }
    return document.documentElement;
}

// ===== STORAGE UTILITIES =====
function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

// ===== API UTILITIES =====
async function makeApiCall(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

function handleApiError(error) {
    if (error.name === 'TypeError') {
        return 'নেটওয়ার্ক সমস্যা। ইন্টারনেট কানেকশন চেক করুন।';
    } else if (error.message.includes('404')) {
        return 'ডেটা পাওয়া যায়নি।';
    } else if (error.message.includes('500')) {
        return 'সার্ভার সমস্যা। পরে আবার চেষ্টা করুন।';
    } else {
        return 'একটি অপ্রত্যাশিত সমস্যাoccurred হয়েছে।';
    }
}

// ===== URL UTILITIES =====
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function updateUrlParameter(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
}

function removeUrlParameter(key) {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.replaceState({}, '', url);
}

// ===== TIME UTILITIES =====
function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'এখনই';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} মিনিট আগে`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ঘন্টা আগে`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} দিন আগে`;
    
    return formatDate(dateString);
}

function isToday(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function isYesterday(dateString) {
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
}

// ===== ARRAY UTILITIES =====
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

function uniqueArray(array, key = null) {
    if (key) {
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    }
    return [...new Set(array)];
}

// ===== OBJECT UTILITIES =====
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    
    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

function mergeObjects(target, source) {
    const output = { ...target };
    
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (isObject(target[key]) && isObject(source[key])) {
                output[key] = mergeObjects(target[key], source[key]);
            } else {
                output[key] = source[key];
            }
        }
    }
    
    return output;
}

function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

// ===== EVENT UTILITIES =====
function onEvent(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
}

function onceEvent(element, event, handler) {
    const onceHandler = (...args) => {
        handler(...args);
        element.removeEventListener(event, onceHandler);
    };
    element.addEventListener(event, onceHandler);
}

// ===== PERFORMANCE UTILITIES =====
function measurePerformance(fn, name = 'Function') {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} executed in ${(end - start).toFixed(2)}ms`);
    return result;
}

async function measureAsyncPerformance(asyncFn, name = 'Async Function') {
    const start = performance.now();
    const result = await asyncFn();
    const end = performance.now();
    console.log(`${name} executed in ${(end - start).toFixed(2)}ms`);
    return result;
}

// ===== EXPORT FOR MODULES =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatPrice,
        formatDate,
        formatDateTime,
        truncateText,
        capitalizeFirst,
        sanitizeHTML,
        generateOrderId,
        calculateDeliveryFee,
        validateEmail,
        validatePhone,
        validateBangladeshiPhone,
        debounce,
        throttle,
        getScrollParent,
        setLocalStorage,
        getLocalStorage,
        removeLocalStorage,
        makeApiCall,
        handleApiError,
        getUrlParameter,
        updateUrlParameter,
        removeUrlParameter,
        getRelativeTime,
        isToday,
        isYesterday,
        shuffleArray,
        chunkArray,
        uniqueArray,
        deepClone,
        mergeObjects,
        isObject,
        onEvent,
        onceEvent,
        measurePerformance,
        measureAsyncPerformance
    };
}