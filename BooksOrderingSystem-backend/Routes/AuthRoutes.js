// Routes/AuthRoutes.js
const express = require('express');
const { register, login, me, getAddress, updateAddress } = require('../Controllers/AuthController.js');

const auth = require('../Middleware/Auth.js');

const router = express.Router();
// Get user address
router.get('/user/:userId/address', getAddress);
// Update user address
router.put('/user/:userId/address', updateAddress);
router.post('/register', register); // body: {name,email,password,role}
router.post('/login', login);
router.get('/me', auth(), me);

module.exports = router;
