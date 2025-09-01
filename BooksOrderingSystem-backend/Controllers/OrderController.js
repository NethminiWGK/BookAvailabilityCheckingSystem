const Order = require('../Schemas/Order');

// POST /api/orders
async function createOrder(req, res) {
  try {
    console.log('createOrder called. req.body:', req.body);
  const { userId, items, address } = req.body;
  const order = await Order.create({ userId, items, address, createdAt: new Date() });
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

module.exports = { createOrder, getOrdersByUser };