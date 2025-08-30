const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,  // Reference to User model
    required: true,
    ref: 'User',  // Assuming you have a 'User' model
  },
  items: [
    {
      bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
      title: String,
      coverImage: String,
      quantity: { type: Number, default: 1 },
      price: Number,
    }
  ],
  address: {
    province: { type: String },
    district: { type: String },
    city: { type: String },
    street: { type: String },
    name: { type: String },
    mobileNo: { type: String }
  }
});

const CartModel = mongoose.model('Cart', cartSchema);

module.exports = CartModel;
