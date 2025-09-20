const express = require('express');
const router = express.Router();
const {
  createReservation,
  getReservationsByUser,
  getReservationsByOwner,
  cancelReservation,
  deleteReservation
} = require('../Controllers/ReservationController');

// Create a new reservation
router.post('/reservations', createReservation);

// Get all reservations for a user
router.get('/reservations/user/:userId', getReservationsByUser);

// Get all reservations for an owner
router.get('/reservations/owner/:ownerId', getReservationsByOwner);

// Cancel a reservation
router.put('/reservations/cancel/:reservationId', cancelReservation);

router.delete('/reservations/:reservationId', deleteReservation);

module.exports = router;
