const express = require('express');
const router = express.Router();

const {
  createOrder,
  getOrdersByUser,
  getOrdersByOwner,
  deleteOrder
} = require('../Controllers/OrderController.js');

// Create order (expects address in body)
router.post('/', createOrder);


// Get all orders for a user
router.get('/user/:userId', getOrdersByUser);

// Get all orders for an owner
router.get('/owner/:ownerId', getOrdersByOwner);

router.delete('/:orderId', deleteOrder);

module.exports = router;