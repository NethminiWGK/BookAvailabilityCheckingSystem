require('dotenv').config();
const express = require('express')
const connect = require('./Services/connection.js')
const bodyParser = require('body-parser');
const cors = require('cors');
const OwnerRoutes = require('./Routes/OwnerRoutes.js');
const BooksRoutes = require('./Routes/BooksRoutes.js');
const AuthRoutes = require('./Routes/AuthRoutes.js');
const CartRoutes = require('./Routes/CartRoutes.js');
const PaymentRoutes = require('./Routes/Payment.js');
const OrderRoutes = require('./Routes/OrderRoutes.js');
const ReservationRoutes = require('./Routes/ReservationRoutes.js');

console.log("JWT from env:", process.env.JWT_SECRET);

const path = require('path');

const port = 3001;
const host = 'localhost';

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // ✅ explicitly allow DELETE
  allowedHeaders: ['Content-Type','Authorization']
}));
 // To allow cross-origin requests from frontend
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));  // Serve uploaded files


connect();

const server = app.listen(port, () => {
    console.log(`Node server is listen to ${port}`)
});

// Register the routes

app.use('/api', BooksRoutes);
app.use('/api', CartRoutes);
app.use('/api/auth', AuthRoutes);
app.use('/api', OwnerRoutes);
app.use('/api/payments', PaymentRoutes);
app.use('/api/orders', OrderRoutes);
app.use('/api', ReservationRoutes);
