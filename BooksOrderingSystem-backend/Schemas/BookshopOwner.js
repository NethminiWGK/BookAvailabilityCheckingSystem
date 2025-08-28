const mongoose = require('mongoose');

const OwnerSchema = new mongoose.Schema({
   
    fullName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    mobileNo: {
        type: String,
        required: true
    },
    bookShopName: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Not Approved', 'Approved','Rejected'], // Only these values allowed
        default: 'Not Approved',           // ✅ Default value
        required: true
    },
       
    nic: {
        type: String,
        required: true
    },
    nicFile: {
        type: String,  // Path to uploaded NIC file
        required: true
    },
    bookshopImage: {
        type: String,  // Path to uploaded Bookshop image
        required: true
    }
});

const OwnerModel = mongoose.model('Owner', OwnerSchema);
module.exports = OwnerModel;
