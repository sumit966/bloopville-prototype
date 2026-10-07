// ============================================
// BLOOPVILLE - Product Detail Page
// Loads product from PRODUCTS database
// ============================================

function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('id'));
}

let currentQty = 1;
let currentProduct = null;

function loadProduct() {
    if (typeof PRODUCTS === 'undefined') {
        console.error('Product data not loaded');
        return;
    }

    const id = getProductId();
    const product = PRODUCTS.find(p => p.id === id);

    if (!product) {
        document.getElementById('pdTitle').textContent = 'Product Not Found';
        document.getElementById('pdDesc').textContent = 'Sorry, this product is no longer available.';
        document.getElementById('pdAddBtn').disabled = true;
        return;
    }

    currentProduct = product;

    document.title = product.name + ' - Bloopville';
    document.getElementById('pdImage').src = product.image;
    document.getElementById('pdImage').alt = product.name;
    document.getElementById('pdCategory').textContent = product.category;
    document.getElementById('pdTitle').textContent = product.name;
    document.getElementById('pdPrice').textContent = '$' + product.finalPrice.toFixed(2);
    document.getElementById('pdDesc').textContent = product.description;

    const addBtn = document.getElementById('pdAddBtn');
    addBtn.textContent = 'Add to Cart - $' + product.finalPrice.toFixed(2);

    // Show rating if there's a slot
    const ratingEl = document.getElementById('pdRating');
    if (ratingEl) {
        ratingEl.innerHTML = '\u2605 ' + product.rating + ' (' + product.reviews + ' reviews)';
    }
}

function changeQty(delta) {
    currentQty = Math.max(1, currentQty + delta);
    document.getElementById('pdQty').textContent = currentQty;
    if (currentProduct) {
        document.getElementById('pdAddBtn').textContent = 
            'Add ' + currentQty + ' to Cart - $' + (currentProduct.finalPrice * currentQty).toFixed(2);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProduct();

    const addBtn = document.getElementById('pdAddBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (!currentProduct) return;
            for (let i = 0; i < currentQty; i++) {
                addToCart(currentProduct.name, currentProduct.finalPrice);
            }
            currentQty = 1;
            document.getElementById('pdQty').textContent = 1;
        });
    }
});
