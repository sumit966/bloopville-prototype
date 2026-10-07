// ============================================
// BLOOPVILLE - Main JavaScript (Upgraded)
// ============================================

let cart = [];
let wishlist = [];

const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');

// ---------- Cart ----------
function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    updateCart();
    openCart();
    showToast(name + ' added to cart!');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function updateCart() {
    const totalItems = cart.reduce((s, i) => s + i.qty, 0);
    if (cartCount) cartCount.textContent = totalItems;

    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
        cartItems.innerHTML = cart.map((item, i) =>
            '<div class="cart-item">' +
                '<div class="cart-item-info">' +
                    '<h4>' + item.name + ' x ' + item.qty + '</h4>' +
                    '<p>$' + (item.price * item.qty).toFixed(2) + '</p>' +
                '</div>' +
                '<button class="remove-item" onclick="removeFromCart(' + i + ')">&#x2715;</button>' +
            '</div>'
        ).join('');
    }

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    if (cartTotal) cartTotal.textContent = '$' + total.toFixed(2);
}

function openCart() {
    if (cartSidebar) cartSidebar.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('active');
}

function closeCartFn() {
    if (cartSidebar) cartSidebar.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('active');
}

if (cartBtn) cartBtn.addEventListener('click', openCart);
if (closeCart) closeCart.addEventListener('click', closeCartFn);
if (cartOverlay) cartOverlay.addEventListener('click', closeCartFn);

function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    closeCartFn();
    window.location.href = 'checkout.html';
}

// ---------- Toast ----------
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText =
        'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);' +
        'background:#2d2d3a;color:#fff;padding:14px 30px;border-radius:50px;' +
        'font-weight:700;font-family:Fredoka,sans-serif;z-index:3000;' +
        'box-shadow:0 10px 30px rgba(0,0,0,0.25);transition:opacity 0.3s;';

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2200);
}

// ---------- Dark Mode ----------
function initTheme() {
    const saved = localStorage.getItem('bloop-theme');
    if (saved === 'dark') {
        document.body.classList.add('dark-mode');
    }
    updateThemeIcon();

    const toggle = document.getElementById('themeToggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('bloop-theme', isDark ? 'dark' : 'light');
            updateThemeIcon();
        });
    }
}

function updateThemeIcon() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    const isDark = document.body.classList.contains('dark-mode');
    toggle.textContent = isDark ? '\u2600' : '\u{1F319}';
}

// ---------- Scroll Reveal ----------
function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
}

// ---------- Wishlist ----------
function toggleWishlist(btn, name) {
    btn.classList.toggle('active');
    const isActive = btn.classList.contains('active');

    if (isActive) {
        if (!wishlist.includes(name)) wishlist.push(name);
        showToast(name + ' added to wishlist');
    } else {
        wishlist = wishlist.filter(n => n !== name);
        showToast(name + ' removed from wishlist');
    }

    localStorage.setItem('bloop-wishlist', JSON.stringify(wishlist));
}

function loadWishlist() {
    const saved = localStorage.getItem('bloop-wishlist');
    if (saved) {
        try { wishlist = JSON.parse(saved); } catch(e) {}
    }
}

// ---------- Search + Filter ----------
function initShop() {
    const searchInput = document.getElementById('searchInput');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const cards = document.querySelectorAll('.product-card-wrapper');

    if (!searchInput || cards.length === 0) return;

    let activeCategory = 'all';

    function filterCards() {
        const query = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        cards.forEach(card => {
            const title = (card.dataset.title || '').toLowerCase();
            const category = (card.dataset.category || '').toLowerCase();
            const matchesSearch = title.includes(query) || category.includes(query);
            const matchesCategory = activeCategory === 'all' || category === activeCategory.toLowerCase();

            if (matchesSearch && matchesCategory) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        const grid = document.getElementById('productGrid');
        let noResults = document.getElementById('noResults');
        if (visibleCount === 0) {
            if (!noResults) {
                noResults = document.createElement('div');
                noResults.id = 'noResults';
                noResults.className = 'no-results';
                noResults.textContent = 'No products found. Try a different search.';
                grid.appendChild(noResults);
            }
            noResults.style.display = 'block';
        } else if (noResults) {
            noResults.style.display = 'none';
        }
    }

    searchInput.addEventListener('input', filterCards);

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeCategory = tab.dataset.category;
            filterCards();
        });
    });
}

// ---------- FAQ ----------
function initFaq() {
    const faqItems = document.querySelectorAll('.faq-question');
    faqItems.forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            item.classList.toggle('open');
        });
    });
}

// ---------- Newsletter ----------
function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Thanks for subscribing!');
        form.reset();
    });
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadWishlist();
    updateCart();
    initScrollReveal();
    initShop();
    initFaq();
    initNewsletter();
    console.log('Bloopville loaded with upgrades!');
});

// ============================================
// PREMIUM UPGRADE - Chat, Carousel, Tracking,
// Language, Admin
// ============================================

// ---------- Live Chat Widget ----------
const BOT_REPLIES = [
    'Hi! How can I help you today?',
    'Great question! Let me check that for you.',
    'We ship worldwide! Free over $50.',
    'Our plush toys are made with premium materials.',
    'You can return items within 30 days.',
    'Thanks for chatting with Bloopville!'
];
let botIndex = 0;

function initChat() {
    const fab = document.getElementById('chatFab');
    const panel = document.getElementById('chatPanel');
    const close = document.getElementById('chatClose');
    const input = document.getElementById('chatInput');
    const send = document.getElementById('chatSend');
    const body = document.getElementById('chatBody');

    if (!fab) return;

    fab.addEventListener('click', () => {
        panel.classList.toggle('open');
        const badge = fab.querySelector('.chat-fab-badge');
        if (badge) badge.remove();
        if (panel.classList.contains('open') && input) input.focus();
    });

    if (close) close.addEventListener('click', () => panel.classList.remove('open'));

    function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        addChatMsg(text, 'user');
        input.value = '';

        setTimeout(() => {
            const reply = BOT_REPLIES[botIndex % BOT_REPLIES.length];
            botIndex++;
            addChatMsg(reply, 'bot');
        }, 800);
    }

    if (send) send.addEventListener('click', sendMessage);
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
}

function addChatMsg(text, who) {
    const body = document.getElementById('chatBody');
    if (!body) return;
    const msg = document.createElement('div');
    msg.className = 'chat-msg ' + who;
    msg.textContent = text;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
}

// ---------- Best Sellers Carousel ----------
let carouselIndex = 0;
let carouselAutoPlay;

function initCarousel() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;

    const items = track.querySelectorAll('.carousel-item');
    const dots = document.querySelectorAll('.carousel-dot');
    const total = items.length;
    if (total === 0) return;

    function getVisible() {
        return window.innerWidth < 600 ? 1 : window.innerWidth < 968 ? 2 : 3;
    }

    function getMaxIndex() {
        return Math.max(0, total - getVisible());
    }

    function goTo(index) {
        const maxIndex = getMaxIndex();
        if (index < 0) index = maxIndex;
        if (index > maxIndex) index = 0;
        carouselIndex = index;

        const itemWidth = items[0].offsetWidth + 24;
        track.style.transform = 'translateX(-' + (carouselIndex * itemWidth) + 'px)';

        dots.forEach((d, i) => {
            d.classList.toggle('active', i === carouselIndex);
        });
    }

    document.querySelectorAll('.carousel-nav.prev').forEach(btn => {
        btn.addEventListener('click', () => goTo(carouselIndex - 1));
    });
    document.querySelectorAll('.carousel-nav.next').forEach(btn => {
        btn.addEventListener('click', () => goTo(carouselIndex + 1));
    });

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => goTo(i));
    });

    // Auto-play
    function startAuto() {
        stopAuto();
        carouselAutoPlay = setInterval(() => {
            goTo(carouselIndex + 1);
        }, 3500);
    }
    function stopAuto() {
        if (carouselAutoPlay) clearInterval(carouselAutoPlay);
    }

    const wrapper = track.closest('.carousel-wrapper');
    if (wrapper) {
        wrapper.addEventListener('mouseenter', stopAuto);
        wrapper.addEventListener('mouseleave', startAuto);
    }

    window.addEventListener('resize', () => {
        goTo(Math.min(carouselIndex, getMaxIndex()));
    });

    goTo(0);
    startAuto();
}

// ---------- Order Tracking ----------
function initTracking() {
    const form = document.getElementById('trackingForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input');
        const code = input.value.trim().toUpperCase();

        const timeline = document.getElementById('trackingTimeline');
        if (!timeline) return;

        if (!code) {
            showToast('Please enter an order number');
            return;
        }

        // Simulate steps
        const steps = [
            { title: 'Order Placed', desc: 'We received your order.', time: 'Today, 10:42 AM', status: 'completed' },
            { title: 'Processing', desc: 'Your items are being prepared.', time: 'Today, 2:15 PM', status: 'completed' },
            { title: 'Shipped', desc: 'Handed to carrier. Tracking active.', time: 'Tomorrow', status: 'current' },
            { title: 'Out for Delivery', desc: 'Arriving soon!', time: 'Pending', status: '' },
            { title: 'Delivered', desc: 'Enjoy your Bloop!', time: 'Pending', status: '' }
        ];

        timeline.innerHTML = steps.map(s =>
            '<div class="timeline-step ' + s.status + '">' +
                '<h4>' + s.title + '</h4>' +
                '<p>' + s.desc + '</p>' +
                '<p class="step-time">' + s.time + '</p>' +
            '</div>'
        ).join('');

        showToast('Order ' + code + ' found!');
    });
}

// ---------- Language Switcher ----------
const TRANSLATIONS = {
    en: {},
    es: {
        'Home': 'Inicio',
        'Characters': 'Personajes',
        'Shop': 'Tienda',
        'Our Story': 'Nuestra Historia',
        'Contact': 'Contacto',
        'Cart': 'Carrito'
    },
    fr: {
        'Home': 'Accueil',
        'Characters': 'Personnages',
        'Shop': 'Boutique',
        'Our Story': 'Notre Histoire',
        'Contact': 'Contact',
        'Cart': 'Panier'
    },
    hi: {
        'Home': '\u0939\u094B\u092E',
        'Characters': '\u092A\u093E\u0924\u094D\u0930',
        'Shop': '\u0926\u0941\u0915\u093E\u0928',
        'Our Story': '\u0939\u092E\u093E\u0930\u0940 \u0915\u0939\u093E\u0928\u0940',
        'Contact': '\u0938\u0902\u092A\u0930\u094D\u0915',
        'Cart': '\u0915\u093E\u0930\u094D\u091F'
    }
};

function initLanguage() {
    const btn = document.getElementById('langBtn');
    const menu = document.getElementById('langMenu');
    if (!btn || !menu) return;

    const current = localStorage.getItem('bloop-lang') || 'en';
    btn.querySelector('span:last-child').textContent = current.toUpperCase();

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('open');
    });

    document.addEventListener('click', () => menu.classList.remove('open'));

    menu.querySelectorAll('.lang-option').forEach(opt => {
        opt.addEventListener('click', () => {
            const lang = opt.dataset.lang;
            localStorage.setItem('bloop-lang', lang);
            btn.querySelector('span:last-child').textContent = lang.toUpperCase();
            applyLanguage(lang);
            menu.classList.remove('open');
        });
    });

    if (current !== 'en') applyLanguage(current);
}

function applyLanguage(lang) {
    const dict = TRANSLATIONS[lang] || {};
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    nodes.forEach(n => {
        const original = n.__bloopOriginal || n.textContent;
        if (!n.__bloopOriginal) n.__bloopOriginal = original;
        const trimmed = original.trim();
        if (dict[trimmed]) {
            n.textContent = original.replace(trimmed, dict[trimmed]);
        } else if (lang === 'en') {
            n.textContent = original;
        }
    });
}

// ---------- Admin Dashboard ----------
function initAdminDashboard() {
    const chart = document.getElementById('adminChart');
    if (!chart) return;

    const data = [42, 68, 55, 92, 78, 105, 88];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const max = Math.max.apply(null, data);

    chart.innerHTML = data.map((val, i) =>
        '<div class="chart-bar" style="height:' + (val / max * 100) + '%;">' +
            '<span class="chart-bar-value">$' + val + '0</span>' +
            '<span class="chart-bar-label">' + labels[i] + '</span>' +
        '</div>'
    ).join('');

    // Animate stat numbers
    document.querySelectorAll('.stat-value[data-target]').forEach(el => {
        const target = parseFloat(el.dataset.target);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const step = target / 40;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = prefix + Math.round(current).toLocaleString() + suffix;
        }, 25);
    });
}

// ---------- Inject Chat Widget HTML ----------
function injectChatWidget() {
    if (document.getElementById('chatFab')) return;

    const html = 
        '<div class="chat-widget">' +
            '<button class="chat-fab" id="chatFab" aria-label="Open chat">' +
                '\u{1F4AC}' +
                '<span class="chat-fab-badge"></span>' +
            '</button>' +
            '<div class="chat-panel" id="chatPanel">' +
                '<div class="chat-header-bar">' +
                    '<div class="chat-header-info">' +
                        '<div class="chat-avatar-bot">\u{1F43E}</div>' +
                        '<div>' +
                            '<h4>Bloop Assistant</h4>' +
                            '<p><span class="chat-status-dot"></span> Online now</p>' +
                        '</div>' +
                    '</div>' +
                    '<button class="chat-close" id="chatClose">\u2715</button>' +
                '</div>' +
                '<div class="chat-body" id="chatBody">' +
                    '<div class="chat-msg bot">Hi there! \u{1F44B} Welcome to Bloopville. How can I help you today?</div>' +
                '</div>' +
                '<div class="chat-footer">' +
                    '<input type="text" id="chatInput" placeholder="Type a message...">' +
                    '<button class="chat-send" id="chatSend">\u27A4</button>' +
                '</div>' +
            '</div>' +
        '</div>';

    document.body.insertAdjacentHTML('beforeend', html);
}

// ---------- Inject Language Switcher ----------
function injectLangSwitcher() {
    const actions = document.querySelector('.header-actions');
    if (!actions || document.getElementById('langBtn')) return;

    const html = 
        '<div class="lang-switcher">' +
            '<button class="lang-btn" id="langBtn">' +
                '\u{1F310} <span>EN</span>' +
            '</button>' +
            '<div class="lang-menu" id="langMenu">' +
                '<div class="lang-option active" data-lang="en">\u{1F1FA}\u{1F1F8} English</div>' +
                '<div class="lang-option" data-lang="es">\u{1F1EA}\u{1F1F8} Espa\u00F1ol</div>' +
                '<div class="lang-option" data-lang="fr">\u{1F1EB}\u{1F1F7} Fran\u00E7ais</div>' +
                '<div class="lang-option" data-lang="hi">\u{1F1EE}\u{1F1F3} \u0939\u093F\u0928\u094D\u0926\u0940</div>' +
            '</div>' +
        '</div>';

    actions.insertAdjacentHTML('afterbegin', html);
}

// ---------- Re-init on load ----------
document.addEventListener('DOMContentLoaded', () => {
    injectChatWidget();
    injectLangSwitcher();
    initChat();
    initLanguage();
    initCarousel();
    initTracking();
    initAdminDashboard();
});

// ============================================
// FLASH SALE COUNTDOWN TIMER
// ============================================
function initFlashSale() {
    const timerEl = document.getElementById('flashSaleTimer');
    if (!timerEl) return;

    // Set target: 3 days from now (replace with real date for production)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);

    function updateTimer() {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) {
            timerEl.innerHTML = '<p style="font-size:1.2rem;font-weight:700;">Sale Ended</p>';
            const saleSection = document.getElementById('flashSale');
            if (saleSection) saleSection.classList.add('expired');
            clearInterval(timerInterval);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const pad = (n) => String(n).padStart(2, '0');

        document.getElementById('countdownDays').textContent = pad(days);
        document.getElementById('countdownHours').textContent = pad(hours);
        document.getElementById('countdownMins').textContent = pad(minutes);
        document.getElementById('countdownSecs').textContent = pad(seconds);
    }

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
}

// ============================================
// SPIN TO WIN WHEEL
// ============================================
let wheelSpinning = false;

const WHEEL_PRIZES = [
    { label: '10% OFF', value: 'BLOOP10', color: '#7c5cff' },
    { label: 'Free Ship', value: 'FREESHIP', color: '#ff8c42' },
    { label: '5% OFF', value: 'BLOOP5', color: '#4ecdc4' },
    { label: 'Try Again', value: '', color: '#ff6b9d' },
    { label: '20% OFF', value: 'BLOOP20', color: '#ffe066' },
    { label: 'Free Ship', value: 'FREESHIP', color: '#9d7bff' },
    { label: '15% OFF', value: 'BLOOP15', color: '#ffa566' },
    { label: 'Try Again', value: '', color: '#6ee7de' }
];

function initSpinWheel() {
    const trigger = document.getElementById('spinTrigger');
    const overlay = document.getElementById('spinOverlay');
    const closeBtn = document.getElementById('closeSpin');
    const spinBtn = document.getElementById('spinBtn');
    const resultDiv = document.getElementById('spinResult');

    if (!trigger || !overlay) return;

    // Show popup after 5 seconds or on button click
    setTimeout(() => {
        if (!localStorage.getItem('bloop-spun')) {
            overlay.classList.add('open');
            drawWheel();
        }
    }, 5000);

    trigger.addEventListener('click', () => {
        overlay.classList.add('open');
        drawWheel();
    });

    closeBtn.addEventListener('click', () => {
        overlay.classList.remove('open');
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('open');
    });

    spinBtn.addEventListener('click', spinWheel);

    function drawWheel() {
        const canvas = document.getElementById('wheelCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const size = canvas.width;
        const center = size / 2;
        const radius = center - 10;
        const arc = (Math.PI * 2) / WHEEL_PRIZES.length;

        ctx.clearRect(0, 0, size, size);

        WHEEL_PRIZES.forEach((prize, i) => {
            const angle = i * arc - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.arc(center, center, radius, angle, angle + arc);
            ctx.closePath();
            ctx.fillStyle = prize.color;
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Draw text
            ctx.save();
            ctx.translate(center, center);
            ctx.rotate(angle + arc / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = 'white';
            ctx.font = 'bold 13px Fredoka, sans-serif';
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 4;
            ctx.fillText(prize.label, radius - 20, 5);
            ctx.restore();
        });

        // Center circle
        ctx.beginPath();
        ctx.arc(center, center, 28, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#7c5cff';
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    function spinWheel() {
        if (wheelSpinning) return;
        wheelSpinning = true;
        spinBtn.disabled = true;
        spinBtn.textContent = 'Spinning...';
        resultDiv.classList.remove('show');

        const canvas = document.getElementById('wheelCanvas');
        const totalRotation = 360 * (5 + Math.random() * 3) + Math.random() * 360;
        let currentRotation = 0;
        const duration = 4000;
        const startTime = Date.now();

        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            currentRotation = eased * totalRotation;

            const wheelContainer = document.getElementById('wheelContainer');
            if (wheelContainer) {
                wheelContainer.style.transform = 'rotate(' + currentRotation + 'deg)';
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                finishSpin(totalRotation);
            }
        }

        animate();
    }

    function finishSpin(rotation) {
        wheelSpinning = false;
        spinBtn.disabled = false;
        spinBtn.textContent = 'Spin Again';

        const segmentAngle = 360 / WHEEL_PRIZES.length;
        const normalizedRotation = rotation % 360;
        const pointerAngle = (360 - normalizedRotation) % 360;
        const index = Math.floor(pointerAngle / segmentAngle) % WHEEL_PRIZES.length;
        const prize = WHEEL_PRIZES[index];

        if (prize.value) {
            localStorage.setItem('bloop-spun', 'true');
            localStorage.setItem('bloop-prize', prize.value);
            resultDiv.innerHTML = 
                '<h3>You Won!</h3>' +
                '<p style="color:#6b6b7b;margin-bottom:12px;">Your discount code:</p>' +
                '<div class="prize-code">' + prize.value + '</div>' +
                '<p style="color:#6b6b7b;font-size:0.9rem;margin-top:12px;">Use at checkout for ' + prize.label + '</p>' +
                '<button class="btn btn-primary" onclick="closeSpinPopup()">Claim & Shop</button>';
        } else {
            resultDiv.innerHTML = 
                '<h3>Try Again!</h3>' +
                '<p style="color:#6b6b7b;margin-bottom:16px;">No prize this time, but thanks for playing!</p>' +
                '<button class="btn btn-primary" onclick="resetSpinWheel()">Spin Again</button>';
        }
        resultDiv.classList.add('show');
    }
}

function closeSpinPopup() {
    document.getElementById('spinOverlay').classList.remove('open');
    showToast('Discount applied at checkout!');
}

function resetSpinWheel() {
    document.getElementById('spinResult').classList.remove('show');
    document.getElementById('spinBtn').textContent = 'Spin the Wheel!';
    document.getElementById('wheelContainer').style.transform = 'rotate(0deg)';
}

// ============================================
// INSTAGRAM FEED (Mock Data)
// ============================================
function initInstagram() {
    const grid = document.getElementById('instagramGrid');
    if (!grid) return;

    const posts = [
        { seed: 'bloop-insta1', likes: 234, comments: 18 },
        { seed: 'bloop-insta2', likes: 512, comments: 42 },
        { seed: 'bloop-insta3', likes: 189, comments: 12 },
        { seed: 'bloop-insta4', likes: 678, comments: 55 },
        { seed: 'bloop-insta5', likes: 321, comments: 28 },
        { seed: 'bloop-insta6', likes: 445, comments: 33 }
    ];

    grid.innerHTML = posts.map(p => 
        '<div class="insta-post">' +
            '<img src="https://picsum.photos/seed/' + p.seed + '/500/500" alt="Bloopville post" loading="lazy">' +
            '<div class="insta-overlay">' +
                '<div class="insta-icon">\u2764\uFE0F</div>' +
                '<div class="insta-stats">' +
                    '<span>\u2764 ' + p.likes + '</span>' +
                    '<span>\uD83D\uDCAC ' + p.comments + '</span>' +
                '</div>' +
            '</div>' +
        '</div>'
    ).join('');
}

// ============================================
// INJECT SPIN TRIGGER + POPUP
// ============================================
function injectSpinWheel() {
    if (document.getElementById('spinTrigger')) return;

    // Trigger button
    const triggerHtml = '<button class="spin-trigger" id="spinTrigger" aria-label="Spin to win">\uD83C\uDF81</button>';
    document.body.insertAdjacentHTML('beforeend', triggerHtml);

    // Popup
    const popupHtml = 
        '<div class="spin-popup-overlay" id="spinOverlay">' +
            '<div class="spin-popup">' +
                '<button class="close-spin" id="closeSpin">\u2715</button>' +
                '<h2>Spin & Win!</h2>' +
                '<p>Try your luck for a discount code</p>' +
                '<div class="wheel-container" id="wheelContainer">' +
                    '<div class="wheel-pointer">\uD83D\uDD3B</div>' +
                    '<canvas class="wheel-canvas" id="wheelCanvas" width="300" height="300"></canvas>' +
                '</div>' +
                '<button class="spin-btn" id="spinBtn">Spin the Wheel!</button>' +
                '<div class="spin-result" id="spinResult"></div>' +
            '</div>' +
        '</div>';

    document.body.insertAdjacentHTML('beforeend', popupHtml);
}

// ---------- Re-init ----------
document.addEventListener('DOMContentLoaded', () => {
    injectSpinWheel();
    initFlashSale();
    initSpinWheel();
    initInstagram();
});

// ============================================
// FLOATING JELLY BEANS BACKGROUND
// ============================================
function injectJellyBeans() {
    if (document.querySelector('.jelly-bean-bg')) return;

    const bg = document.createElement('div');
    bg.className = 'jelly-bean-bg';
    bg.innerHTML = '<span></span><span></span><span></span><span></span><span></span>';
    document.body.insertBefore(bg, document.body.firstChild);
}

// ============================================
// JELLY BEAN SPARKLE CURSOR
// ============================================
function initSparkleCursor() {
    if (window.matchMedia('(hover: none)').matches) return; // Skip on touch

    let lastSparkle = 0;
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastSparkle < 80) return;
        lastSparkle = now;

        const sparkle = document.createElement('span');
        sparkle.textContent = '✨';
        sparkle.style.cssText = 
            'position:fixed;left:' + e.clientX + 'px;top:' + e.clientY + 'px;' +
            'font-size:12px;pointer-events:none;z-index:9999;' +
            'animation:sparkleFade 0.8s ease-out forwards;transform:translate(-50%,-50%);';
        document.body.appendChild(sparkle);

        setTimeout(() => sparkle.remove(), 800);
    });

    // Add keyframes if not present
    if (!document.getElementById('sparkleStyles')) {
        const style = document.createElement('style');
        style.id = 'sparkleStyles';
        style.textContent = '@keyframes sparkleFade{0%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(0) translateY(-20px)}}';
        document.head.appendChild(style);
    }
}

// ---------- Init jelly extras ----------
document.addEventListener('DOMContentLoaded', () => {
    injectJellyBeans();
    initSparkleCursor();
});

// ============================================
// PWA REGISTRATION
// ============================================
function initPWA() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => console.log('Bloopville PWA: Registered', reg.scope))
                .catch(err => console.log('Bloopville PWA: Failed', err));
        });
    }

    // Install prompt
    let deferredPrompt;
    const installBanner = document.createElement('div');
    installBanner.id = 'pwaInstallBanner';
    installBanner.style.cssText = 
        'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);' +
        'background:linear-gradient(135deg,#E32636,#9B59B6);color:white;' +
        'padding:16px 28px;border-radius:50px;font-weight:700;' +
        'font-family:Fredoka,sans-serif;z-index:9999;display:none;' +
        'box-shadow:0 10px 40px rgba(227,38,54,0.4);cursor:pointer;' +
        'align-items:center;gap:12px;';
    installBanner.innerHTML = '📱 Install Bloopville App <span style="background:white;color:#E32636;padding:4px 12px;border-radius:20px;font-size:0.85rem;">Add</span>';
    document.body.appendChild(installBanner);

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBanner.style.display = 'flex';
    });

    installBanner.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Bloopville PWA: User choice', outcome);
        deferredPrompt = null;
        installBanner.style.display = 'none';
    });

    window.addEventListener('appinstalled', () => {
        console.log('Bloopville PWA: Installed');
        installBanner.style.display = 'none';
        showToast('Bloopville installed! 🎉');
    });
}

// Auto-init
document.addEventListener('DOMContentLoaded', initPWA);

// ============================================
// GOOGLE ANALYTICS (GA4)
// ============================================
// Replace G-XXXXXXXXXX with your actual Measurement ID
// Get it from: analytics.google.com → Admin → Data Streams
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

function initGoogleAnalytics() {
    if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
        console.log('Bloopville GA: Add your Measurement ID to enable');
        return;
    }

    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(script);

    // Initialize
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href
    });

    // Track events
    trackEvents();
}

function trackEvents() {
    // Track Add to Cart
    const originalAddToCart = window.addToCart;
    window.addToCart = function(name, price) {
        if (typeof originalAddToCart === 'function') {
            originalAddToCart(name, price);
        }
        if (typeof gtag === 'function') {
            gtag('event', 'add_to_cart', {
                currency: 'USD',
                value: price,
                items: [{ item_name: name, price: price }]
            });
        }
    };

    // Track Checkout
    const originalCheckout = window.checkout;
    window.checkout = function() {
        if (typeof originalCheckout === 'function') {
            originalCheckout();
        }
        if (typeof gtag === 'function') {
            gtag('event', 'begin_checkout', {
                currency: 'USD',
                value: cart.reduce((s, i) => s + i.price * i.qty, 0)
            });
        }
    };
}

document.addEventListener('DOMContentLoaded', initGoogleAnalytics);

// ============================================
// HOMEPAGE - Featured Products from DB
// ============================================
function initHomeFeatured() {
    if (typeof PRODUCTS === 'undefined') return;

    const grid = document.querySelector('.products-section .product-grid');
    if (!grid) return;

    // Pick 4 popular products
    const featured = PRODUCTS
        .slice()
        .sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews))
        .slice(0, 4);

    grid.innerHTML = featured.map(p => {
        const safeName = p.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const discountTag = p.discount > 0 
            ? '<s style="color:#999;font-size:0.85rem;margin-right:6px;">$' + p.price.toFixed(2) + '</s>' 
            : '';
        const badge = p.badge ? '<span class="product-tag">' + p.badge + '</span>' : '';
        return '<div class="product-card">' +
            '<div class="product-img">' +
                '<img src="' + p.image + '" alt="' + p.name.replace(/"/g, '&quot;') + '" loading="lazy">' +
                badge +
            '</div>' +
            '<div class="product-info">' +
                '<h3>' + p.name + '</h3>' +
                '<p class="product-category">' + p.category + '</p>' +
                '<p class="product-price">' + discountTag + '$' + p.finalPrice.toFixed(2) + '</p>' +
                '<button class="btn btn-add" onclick="addToCart(\'' + safeName + '\', ' + p.finalPrice + ')">Add to Cart</button>' +
            '</div>' +
        '</div>';
    }).join('');
}

document.addEventListener('DOMContentLoaded', initHomeFeatured);
