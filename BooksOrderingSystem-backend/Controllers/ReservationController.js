const mongoose = require('mongoose');
const Reservation = require('../Schemas/Reservation');
const Book = require('../Schemas/Books');


// Create a new reservation
const createReservation = async (req, res) => {
  try {
    console.log('createReservation - full req.body:', req.body);
  const { userId, bookId, quantity, reservationFee } = req.body;
    // Validate userId is a valid ObjectId
    if (!userId || !bookId || !quantity || !reservationFee) {
      console.error('Missing required fields:', { userId, bookId, quantity, reservationFee });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid userId ObjectId:', userId);
      return res.status(400).json({ error: 'Invalid userId ObjectId' });
    }
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      console.error('Invalid bookId ObjectId:', bookId);
      return res.status(400).json({ error: 'Invalid bookId ObjectId' });
    }
    // Fetch book to get ownerId
    const book = await Book.findById(bookId);
    if (!book || !book.owner) {
      console.error('Book not found or missing owner:', bookId);
      return res.status(400).json({ error: 'Book not found or missing owner' });
    }
    const ownerId = book.owner;
    const reservedAt = new Date();
    const pickupDeadline = new Date(reservedAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const reservation = await Reservation.create({
      userId,
      bookId,
      ownerId,
      quantity,
      reservationFee,
      reservedAt,
      pickupDeadline,
      status: 'pending',
    });
    console.log('Reservation created:', reservation);
    res.status(201).json({ message: 'Reservation created', reservation });
  } catch (e) {
    console.error('Error in createReservation:', e);
    res.status(500).json({ error: e.message });
  }
};


    // Get all reservations for an owner
const getReservationsByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    console.log('getReservationsByOwner - ownerId:', ownerId);
    const reservations = await Reservation.find({ ownerId: new mongoose.Types.ObjectId(ownerId) }).populate('bookId').sort({ reservedAt: -1 });
    console.log('Reservations found:', reservations.length);
    res.status(200).json({ reservations });
  } catch (e) {
    console.error('Error in getReservationsByOwner:', e);
    res.status(500).json({ error: e.message });
  }
};
  
// Get all reservations for a user
const getReservationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('getReservationsByUser - userId:', userId);
  const reservations = await Reservation.find({ userId: new mongoose.Types.ObjectId(userId) }).populate('bookId').sort({ reservedAt: -1 });
    console.log('Reservations found:', reservations.length);
    res.status(200).json({ reservations });
  } catch (e) {
    console.error('Error in getReservationsByUser:', e);
    res.status(500).json({ error: e.message });
  }
};

// (Optional) Cancel a reservation
const cancelReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const reservation = await Reservation.findByIdAndUpdate(reservationId, { status: 'expired' }, { new: true });
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    res.status(200).json({ message: 'Reservation cancelled', reservation });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

async function deleteReservation(req, res) {
  try {
    await Reservation.findByIdAndDelete(req.params.reservationId);
    res.json({ message: 'Reservation deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
};

module.exports = { createReservation, getReservationsByUser, getReservationsByOwner, cancelReservation, deleteReservation };
