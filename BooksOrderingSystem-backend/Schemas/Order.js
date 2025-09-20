const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Books', required: true },
      ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookshopOwner', required: true },
      title: String,
      coverImage: String,
      quantity: Number,
      price: Number,
      // add more fields as needed
    }
  ],
  // Address for delivery, provided at payment
  address: {
    province: { type: String },
    district: { type: String },
    city: { type: String },
    street: { type: String },
    name: { type: String },
    mobileNo: { type: String }
  },
  status: { type: String, default: 'Not Completed' },
  createdAt: { type: Date, default: Date.now },
});

const OrderModel = mongoose.model('Order', OrderSchema);

module.exports = OrderModel;
