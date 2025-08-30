const Owner = require('../Schemas/BookshopOwner.js');

const multer = require('multer');
const path = require('path');

// Multer configuration for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Store in 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    }
});



const upload = multer({ storage: storage });

// Register user and save details to the database
const registerOwner = async (req, res) => {
  const { fullName, address, mobileNo, bookShopName, district, city, nic, userId } = req.body;

  // expecting both files to be provided
  if (!req.files?.nicFile?.[0] || !req.files?.bookshopImage?.[0]) {
    return res.status(400).send('Both nicFile and bookshopImage are required.');
  }

  if (!userId) {
    return res.status(400).json({ message: 'userId is required to link owner to user.' });
  }

  try {
    const newOwner = new Owner({
      fullName,
      address,
      mobileNo,
      bookShopName,
      district,
      city,
      nic,
      user: userId,
      nicFile: req.files.nicFile[0].path,
      bookshopImage: req.files.bookshopImage[0].path,
    });

    const savedOwner = await newOwner.save();
    res.status(201).send({ message: 'Owner registered successfully!', ownerId: savedOwner._id });
  } catch (err) {
    res.status(500).send('Error saving user: ' + err.message);
  }
};
// Get all owner details
const getAllOwners = async (req, res) => {
    try {
        const owners = await Owner.find(); // Find all owners

        if (owners.length === 0) {
            return res.status(404).send("No owners found.");
        }

        res.status(200).json(owners); // Return all owners' details as JSON
    } catch (err) {
        res.status(500).send("Error retrieving owners: " + err.message);
    }
};

// Get owner details by ID
const getOwnerDetails = async (req, res) => {
    const { ownerId } = req.params; // Get ownerId from URL params

    try {
        const owner = await Owner.findById(ownerId); // Find the owner by ID

        if (!owner) {
            return res.status(404).send("Owner not found.");
        }

        res.status(200).json(owner); // Return the owner's details as JSON
    } catch (err) {
        res.status(500).send("Error retrieving owner details: " + err.message);
    }
};

// Get owner details by userId
const getOwnerByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const owner = await Owner.findOne({ user: userId });
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found.' });
    }
    res.status(200).json(owner);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving owner by userId: ' + err.message });
  }
};

// Update owner details by ID
const updateOwner = async (req, res) => {
    const { ownerId } = req.params; // Get ownerId from URL params
    const { fullName, address, mobileNo, bookShopName, district, city,status, nic } = req.body;

    // Check if a file is uploaded (optional update of the file, if necessary)
    let updatedFields = { fullName, address, mobileNo, bookShopName, district, city,status, nic };
    if (req.file) {
        updatedFields.nicFile = req.file.path; // Update NIC file if a new file is uploaded
    }

    try {
        const updatedOwner = await Owner.findByIdAndUpdate(ownerId, updatedFields, { new: true });

        if (!updatedOwner) {
            return res.status(404).send("Owner not found.");
        }

        res.status(200).json({
            message: "Owner details updated successfully!",
            updatedOwner
        });
    } catch (err) {
        res.status(500).send("Error updating owner details: " + err.message);
    }
};

// Delete owner by ID
const deleteOwner = async (req, res) => {
  const { ownerId } = req.params; // Get ownerId from URL params

  try {
    const deletedOwner = await Owner.findByIdAndDelete(ownerId); // Delete owner by ID

    if (!deletedOwner) {
      return res.status(404).send("Owner not found.");
    }

    res.status(200).json({
      message: "Owner deleted successfully!",
      deletedOwner
    });
  } catch (err) {
    res.status(500).send("Error deleting owner: " + err.message);
  }
};

module.exports = { registerOwner, upload, getAllOwners, getOwnerDetails, deleteOwner, updateOwner, getOwnerByUserId };


