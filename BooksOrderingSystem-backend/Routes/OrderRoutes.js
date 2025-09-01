const express = require('express');
const router = express.Router();

const {
  createOrder,
  getOrdersByUser
} = require('../Controllers/OrderController.js');

// Create order
router.post('/', createOrder);

// Get all orders for a user
router.get('/user/:userId', getOrdersByUser);

module.exports = router;