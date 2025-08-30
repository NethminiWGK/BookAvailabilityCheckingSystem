const express = require('express');

const {
  addToCart,
  getCart,
  updateItemQuantity,
  removeItemFromCart,
  deleteCart,
  updateCartAddress
} = require('../Controllers/CartController.js');  // Import CartController
// POST: Update address in cart


const verifyToken = require('../Middleware/VerifyToken'); 

const router = express.Router();

// POST: Add item to cart
router.post('/cart', addToCart);

// GET: Get the cart of a specific user
router.get('/cart/:userId', getCart);

router.post('/cart/address', updateCartAddress);

// POST: Update item quantity in cart
router.put('/cart/update', updateItemQuantity);

// POST: Remove item from cart
router.post('/cart/remove', removeItemFromCart);

// DELETE: Delete the entire cart for a user
router.delete('/cart/:userId', deleteCart);

module.exports = router;
