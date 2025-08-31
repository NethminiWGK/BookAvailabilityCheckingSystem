const Order = require('../Schemas/Order');

// POST /api/orders
async function createOrder(req, res) {
  try {
    console.log('createOrder called. req.body:', req.body);
    const { ownerId, userId, items, address } = req.body;
    const order = await Order.create({ ownerId, userId, items, address, createdAt: new Date() });
    console.log('New order created:', order);
    res.status(201).json({ message: 'Order created', order });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { createOrder };