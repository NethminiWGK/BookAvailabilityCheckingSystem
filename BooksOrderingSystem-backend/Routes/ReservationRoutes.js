const express = require('express');
const router = express.Router();
const {
  createReservation,
  getReservationsByUser,
  cancelReservation
} = require('../Controllers/ReservationController');

// Create a new reservation
router.post('/reservations', createReservation);

// Get all reservations for a user
router.get('/reservations/user/:userId', getReservationsByUser);

// Cancel a reservation
router.put('/reservations/cancel/:reservationId', cancelReservation);

module.exports = router;
