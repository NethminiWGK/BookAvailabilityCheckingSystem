const Book = require('../Schemas/Books.js');            // <-- your Book model
const Owner = require('../Schemas/BookshopOwner.js');   // to validate owner exists
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer config (same uploads/ folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now()  + path.extname(file.originalname)),
});
const upload = multer({ storage }); // export this for routes


// Create a book under an owner (expects ownerId param and coverImage file)
const createBook = async (req, res) => {
  const { ownerId } = req.params;
  const { title, author, price, stock, category,  isbn } = req.body;

  // require coverImage like your owner requires nicFile/bookshopImage
  if (!req.file) return res.status(400).send('coverImage is required.');

  try {
    // Ensure owner exists
    const owner = await Owner.findById(ownerId);
    if (!owner) return res.status(404).send('Owner not found.');

    const newBook = new Book({
      owner: ownerId,
      title,
      author,
      price: Number(price),
      stock: Number(stock) || 0,
      category,
      isbn,
      coverImage: req.file.path,
    });
    const savedBook = await newBook.save();
    res.status(201).send({ message: 'Book created', bookId: savedBook._id });
  } catch (err) {
    res.status(500).send({ error: 'Error creating book: ' + err.message });
  }
};

// Get all books for a particular owner
const getAllBooksByOwner = async (req, res) => {
  const { ownerId } = req.params;
  try {
    const owner = await Owner.findById(ownerId);
    if (!owner) return res.status(404).send('Owner not found.');

    const books = await Book.find({ owner: ownerId }).sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching books: ' + err.message });
  }
};

// Get a single book
const getBook = async (req, res) => {
  const { bookId } = req.params;
  try {
    const book = await Book.findById(bookId).populate('owner', 'bookShopName city district');
    if (!book) {
        return res.status(404).send('Book not found.');
    }
  // Return ownerId as a top-level field for easier frontend access
  const bookObj = book.toObject();
  bookObj.ownerId = book.owner?._id || book.owner || null;
  res.status(200).json(bookObj);
  } catch (err) {
    res.status(500).send({ error: 'Error fetching book: ' + err.message });
  }
};


// Add near your other requires (you already have these):
// const fs = require('fs');
// const path = require('path');

// Update book (optional new coverImage)
const updateBook = async (req, res) => {
  const { bookId } = req.params;
  const { title, author, price, stock, category, isbn } = req.body;

  try {
    // Find existing book
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).send('Book not found.');

    // Apply simple field updates if provided
    if (typeof title !== 'undefined')   book.title   = title;
    if (typeof author !== 'undefined')  book.author  = author;
    if (typeof price !== 'undefined')   book.price   = Number(price);
    if (typeof stock !== 'undefined')   book.stock   = Number(stock);
    if (typeof category !== 'undefined')book.category= category;
    if (typeof isbn !== 'undefined')    book.isbn    = isbn;

    // If a new cover image was uploaded, replace the old file
    if (req.file) {
      // delete old file if exists
      if (book.coverImage) {
        const oldPath = book.coverImage.replace(/\\/g, '/');
        const absOld = path.isAbsolute(oldPath) ? oldPath : path.join(process.cwd(), oldPath);
        try {
          if (fs.existsSync(absOld)) fs.unlinkSync(absOld);
        } catch (e) {
          console.warn('Could not delete old cover image:', e.message);
        }
      }
      // set new path
      book.coverImage = req.file.path;
    }

    const saved = await book.save();
    return res.status(200).json({ message: 'Book updated successfully.', book: saved });
  } catch (err) {
    return res.status(500).json({ error: 'Error updating book: ' + err.message });
  }
};


//delete book
const deleteBook = async (req, res) => {
  const { bookId } = req.params;

  try {
    // 1) Find the book first
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).send('Book not found.');

    // 2) Try to remove the cover image file (if it exists)
    //    Normalize to absolute path relative to project root
    if (book.coverImage) {
      const normalized = book.coverImage.replace(/\\/g, '/'); // windows -> posix
      // If you saved "uploads/xyz.jpg", make it absolute from your server root:
      const absolutePath = path.isAbsolute(normalized)
        ? normalized
        : path.join(process.cwd(), normalized);

      try {
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
          console.log('🗑️ Deleted cover image:', absolutePath);
        }
      } catch (fileErr) {
        console.warn('Could not delete cover image:', fileErr.message);
      }
    }

    // 3) Delete the record
    await Book.findByIdAndDelete(bookId);

    return res.status(200).json({ message: 'Book deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Error deleting book: ' + err.message });
  }
};



module.exports = {
  upload,
  createBook,
  getAllBooksByOwner,
  getBook,
  deleteBook, 
  updateBook
};