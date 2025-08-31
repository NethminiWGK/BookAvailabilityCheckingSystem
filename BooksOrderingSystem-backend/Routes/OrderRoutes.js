const express = require('express');
const router = express.Router();
const {
  createOrder
} = require('../Controllers/OrderController.js'); 

router.post('/', createOrder);

module.exports = router;