// ============================================
// BLOOPVILLE - ORDER MANAGER
// ============================================

const ORDER_KEY = 'bloop-orders';

function saveOrder(order) {
    const orders = getOrders();
    order.id = generateOrderId();
    order.createdAt = new Date().toISOString();
    order.status = 'pending';
    orders.unshift(order);
    localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
    return order;
}

function getOrders() {
    try {
        const raw = localStorage.getItem(ORDER_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
}

function generateOrderId() {
    const orders = getOrders();
    const year = new Date().getFullYear();
    const count = orders.length + 1;
    return 'BLV-' + year + '-' + String(count).padStart(4, '0');
}

function updateOrderStatus(orderId, newStatus) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
        return true;
    }
    return false;
}

function deleteOrder(orderId) {
    const orders = getOrders().filter(o => o.id !== orderId);
    localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
}

function getOrderStats() {
    const orders = getOrders();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    const todayOrders = orders.filter(o => o.createdAt >= todayStart).length;
    const todayRevenue = orders.filter(o => o.createdAt >= todayStart).reduce((s, o) => s + (o.total || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const pending = orders.filter(o => o.status === 'pending').length;
    const shipped = orders.filter(o => o.status === 'shipped').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;

    return { totalOrders, totalRevenue, todayOrders, todayRevenue, avgOrderValue, pending, shipped, delivered };
}

function getTopProducts(limit = 5) {
    const orders = getOrders();
    const counts = {};
    orders.forEach(order => {
        (order.items || []).forEach(item => {
            if (!counts[item.name]) counts[item.name] = { name: item.name, qty: 0, revenue: 0 };
            counts[item.name].qty += item.qty;
            counts[item.name].revenue += item.price * item.qty;
        });
    });
    return Object.values(counts).sort((a, b) => b.qty - a.qty).slice(0, limit);
}

function seedDemoOrders() {
    if (getOrders().length > 0) return;
    const demos = [
        { customer: { name: 'Sarah M.', email: 'sarah@example.com' }, items: [{ name: 'Pip Plush Toy', price: 24.99, qty: 2 }, { name: 'Zip Coffee Mug', price: 14.99, qty: 1 }] },
        { customer: { name: 'James T.', email: 'james@example.com' }, items: [{ name: 'Luna Night Light', price: 34.99, qty: 1 }] },
        { customer: { name: 'Priya N.', email: 'priya@example.com' }, items: [{ name: 'Bumble T-Shirt', price: 19.99, qty: 3 }, { name: 'Cosmo Keychain', price: 9.99, qty: 2 }] }
    ];
    demos.forEach((d, i) => {
        const total = d.items.reduce((s, it) => s + it.price * it.qty, 0);
        const order = saveOrder(Object.assign({}, d, { total: total }));
        if (i === 0) updateOrderStatus(order.id, 'delivered');
        if (i === 1) updateOrderStatus(order.id, 'shipped');
    });
}
