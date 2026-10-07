// ============================================
// BLOOPVILLE - SHOP ENGINE
// Handles search, filter, sort, pagination
// for 2000+ products
// ============================================

let shopState = {
    search: '',
    category: 'all',
    sort: 'popular',
    perPage: 24,
    currentPage: 1,
    filtered: []
};

// ---------- Init ----------
function initShop() {
    if (typeof PRODUCTS === 'undefined') {
        console.error('products-data.js not loaded');
        document.getElementById('resultsInfo').textContent = 'Product data failed to load.';
        return;
    }

    console.log('Bloopville shop: ' + PRODUCTS.length + ' products loaded');

    // Build category tabs
    buildCategoryTabs();

    // Wire events
    document.getElementById('shopSearch').addEventListener('input', debounce((e) => {
        shopState.search = e.target.value.toLowerCase().trim();
        shopState.currentPage = 1;
        applyFilters();
    }, 250));

    document.getElementById('shopSort').addEventListener('change', (e) => {
        shopState.sort = e.target.value;
        shopState.currentPage = 1;
        applyFilters();
    });

    document.getElementById('shopPerPage').addEventListener('change', (e) => {
        shopState.perPage = parseInt(e.target.value);
        shopState.currentPage = 1;
        applyFilters();
    });

    // Initial render
    applyFilters();
}

// ---------- Category Tabs ----------
function buildCategoryTabs() {
    const wrap = document.getElementById('categoryTabs');
    if (!wrap || typeof CATEGORIES === 'undefined') return;

    wrap.innerHTML = CATEGORIES.map(cat => 
        '<button class="filter-tab ' + (cat.slug === 'all' ? 'active' : '') + '" data-cat="' + cat.slug + '">' + cat.name + '</button>'
    ).join('');

    wrap.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            wrap.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            shopState.category = tab.dataset.cat;
            shopState.currentPage = 1;
            applyFilters();
        });
    });
}

// ---------- Filter + Sort ----------
function applyFilters() {
    let list = PRODUCTS.slice();

    // Category filter
    if (shopState.category !== 'all') {
        list = list.filter(p => p.slug === shopState.category);
    }

    // Search filter
    if (shopState.search) {
        const q = shopState.search;
        list = list.filter(p => 
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.character.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
    }

    // Sort
    switch (shopState.sort) {
        case 'price-asc':
            list.sort((a, b) => a.finalPrice - b.finalPrice);
            break;
        case 'price-desc':
            list.sort((a, b) => b.finalPrice - a.finalPrice);
            break;
        case 'rating':
            list.sort((a, b) => b.rating - a.rating);
            break;
        case 'name':
            list.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default: // popular
            list.sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews));
    }

    shopState.filtered = list;
    renderPage();
}

// ---------- Render Page ----------
function renderPage() {
    const grid = document.getElementById('productGrid');
    const info = document.getElementById('resultsInfo');
    if (!grid) return;

    const total = shopState.filtered.length;
    const perPage = shopState.perPage;
    const totalPages = Math.ceil(total / perPage);
    const start = (shopState.currentPage - 1) * perPage;
    const end = start + perPage;
    const pageItems = shopState.filtered.slice(start, end);

    info.textContent = total === 0
        ? 'No products match your search.'
        : 'Showing ' + (start + 1) + '-' + Math.min(end, total) + ' of ' + total.toLocaleString() + ' products';

    if (total === 0) {
        grid.innerHTML = '<div class="no-results" style="grid-column:1/-1;text-align:center;padding:60px 20px;">No products found. Try a different search.</div>';
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    grid.innerHTML = pageItems.map(renderProductCard).join('');
    renderPagination(totalPages);
}

// ---------- Product Card HTML ----------
function renderProductCard(p) {
    const stars = renderStars(p.rating);
    const discountTag = p.discount > 0 
        ? '<span class="price-old">$' + p.price.toFixed(2) + '</span><span class="price-save">-' + p.discount + '%</span>'
        : '';
    const badgeClass = p.badge === 'Hot Deal' ? 'deal' : p.badge === 'Top Rated' ? 'top' : '';
    const badgeHtml = p.badge ? '<span class="product-badge ' + badgeClass + '">' + p.badge + '</span>' : '';
    const safeName = p.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');

    return '<div class="product-card">' +
        '<div class="product-img">' +
            '<img src="' + p.image + '" alt="' + p.name.replace(/"/g, '&quot;') + '" loading="lazy">' +
            badgeHtml +
            '<button class="wishlist-btn-mini" onclick="toggleWishlist(this, \'' + safeName + '\')" aria-label="Add to wishlist">&#x2661;</button>' +
        '</div>' +
        '<div class="product-info">' +
            '<p class="product-cat-mini">' + p.category + '</p>' +
            '<h3>' + p.name + '</h3>' +
            '<div class="product-stars">' + stars + ' <span>(' + p.reviews + ')</span></div>' +
            '<div class="price-row">' +
                '<span class="price-final">$' + p.finalPrice.toFixed(2) + '</span>' +
                discountTag +
            '</div>' +
            '<button class="btn btn-add" onclick="addToCart(\'' + safeName + '\', ' + p.finalPrice + ')">Add to Cart</button>' +
        '</div>' +
    '</div>';
}

function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '\u2605'.repeat(full) + (half ? '\u2606' : '') + '\u2606'.repeat(empty);
}

// ---------- Pagination ----------
function renderPagination(totalPages) {
    const wrap = document.getElementById('pagination');
    if (!wrap) return;

    if (totalPages <= 1) { wrap.innerHTML = ''; return; }

    const cur = shopState.currentPage;
    let html = '';

    html += '<button ' + (cur === 1 ? 'disabled' : '') + ' onclick="goToPage(' + (cur - 1) + ')">&#x2039;</button>';

    // Page number buttons (with ellipsis logic)
    const pages = getPageNumbers(cur, totalPages);
    pages.forEach(p => {
        if (p === '...') {
            html += '<button disabled>...</button>';
        } else {
            html += '<button class="' + (p === cur ? 'active' : '') + '" onclick="goToPage(' + p + ')">' + p + '</button>';
        }
    });

    html += '<button ' + (cur === totalPages ? 'disabled' : '') + ' onclick="goToPage(' + (cur + 1) + ')">&#x203A;</button>';

    wrap.innerHTML = html;
}

function getPageNumbers(current, total) {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i);
        }
    }

    for (let i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l > 2) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    }

    return rangeWithDots;
}

function goToPage(page) {
    shopState.currentPage = page;
    renderPage();
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

// ---------- Utility ----------
function debounce(fn, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// ---------- Start ----------
document.addEventListener('DOMContentLoaded', initShop);
