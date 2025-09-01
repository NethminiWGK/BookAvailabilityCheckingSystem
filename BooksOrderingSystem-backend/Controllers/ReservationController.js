const Reservation = require('../Schemas/Reservation');

// Create a new reservation
const createReservation = async (req, res) => {
  try {
    const { userId, bookId, quantity, reservationFee } = req.body;
    if (!userId || !bookId || !quantity || !reservationFee) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const reservedAt = new Date();
    const pickupDeadline = new Date(reservedAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const reservation = await Reservation.create({
      userId,
      bookId,
      quantity,
      reservationFee,
      reservedAt,
      pickupDeadline,
      status: 'pending',
    });
    res.status(201).json({ message: 'Reservation created', reservation });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Get all reservations for a user
const getReservationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reservations = await Reservation.find({ userId }).populate('bookId').sort({ reservedAt: -1 });
    res.status(200).json({ reservations });
  } catch (e) {
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

module.exports = { createReservation, getReservationsByUser, cancelReservation };
