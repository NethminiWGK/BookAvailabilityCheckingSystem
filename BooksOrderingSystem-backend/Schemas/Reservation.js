const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  quantity: { type: Number, required: true, default: 1 },
  reservationFee: { type: Number, required: true },
  reservedAt: { type: Date, default: Date.now },
  pickupDeadline: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'picked_up', 'expired'], default: 'pending' },
});

const ReservationModel = mongoose.model('Reservation', ReservationSchema);

module.exports = ReservationModel;
