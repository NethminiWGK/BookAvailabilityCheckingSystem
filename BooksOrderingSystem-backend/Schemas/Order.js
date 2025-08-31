const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookshopOwner', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Books', required: true },
      title: String,
      coverImage: String,
      quantity: Number,
      price: Number,
      // add more fields as needed
    }
  ],
  address: {
    province: { type: String },
    district: { type: String },
    city: { type: String },
    street: { type: String },
    name: { type: String },
    mobileNo: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
});

const OrderModel = mongoose.model('Order', OrderSchema);

module.exports = OrderModel;
