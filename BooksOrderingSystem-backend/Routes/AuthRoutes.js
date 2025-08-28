// Routes/AuthRoutes.js
const express = require('express');
const { register, login, me } = require('../Controllers/AuthController.js');
const auth = require('../Middleware/Auth.js');

const router = express.Router();

router.post('/register', register); // body: {name,email,password,role}
router.post('/login', login);
router.get('/me', auth(), me);

module.exports = router;
