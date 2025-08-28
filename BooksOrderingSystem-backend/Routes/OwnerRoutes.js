const express = require('express');
const { registerOwner, upload ,getAllOwners,getOwnerDetails ,deleteOwner,updateOwner   } = require('../Controllers/OwnerController.js');

const router = express.Router();


// POST request for user registration
router.post('/register', upload.fields([
  { name: 'nicFile', maxCount: 1 },
  { name: 'bookshopImage', maxCount: 1 }
]), registerOwner);


// GET request to retrieve all owner details
router.get('/owners', getAllOwners);


// PUT request to update owner details by ID
router.put('/owner/:ownerId', upload.single('nicFile'), updateOwner); // Use PUT for updates

// GET request to retrieve owner details by ID
router.get('/owner/:ownerId', getOwnerDetails);

router.delete('/owner/:ownerId', deleteOwner);



module.exports = router;
