const Order = require('../Schemas/Order');

// POST /api/orders
async function createOrder(req, res) {
  try {
    console.log('createOrder called. req.body:', req.body);
  const { userId, items, address, status } = req.body;
  // Address is provided at payment, not from cart
  const order = await Order.create({
    userId,
    items,
    address,
    status: status || 'Not Completed',
    createdAt: new Date()
  });
    console.log('New order created:', order);
    res.status(201).json({ message: 'Order created', order });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// GET /api/orders/user/:userId - get all orders for a user
async function getOrdersByUser(req, res) {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function deleteOrder(req, res) {
  try {
    await Order.findByIdAndDelete(req.params.orderId);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
};

// GET /api/orders/owner/:ownerId - get all orders for an owner
async function getOrdersByOwner(req, res) {
  try {
    const { ownerId } = req.params;
    // Find orders where any item has matching ownerId
    const orders = await Order.find({ 'items.ownerId': ownerId }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { createOrder, getOrdersByUser, getOrdersByOwner, deleteOrder };