// Schemas/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, enum: ['BOOKSEEKER', 'BOOKSELLER','ADMIN'], required: true },
  address: {
    province: { type: String },
    district: { type: String },
    city: { type: String },
    street: { type: String },
    name: { type: String },
    mobileNo: { type: String }
  }
}, { timestamps: true });

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;

