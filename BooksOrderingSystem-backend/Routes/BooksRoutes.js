const express = require('express');
const {
  upload,
  createBook,
  getAllBooksByOwner,
  getBook,
  deleteBook,
  updateBook
} = require('../Controllers/BooksController.js');

const router = express.Router();

// POST request for add a book
router.post('/owners/:ownerId/books', upload.single('coverImage'), createBook);

// List all books for an owner
router.get('/owners/:ownerId/books', getAllBooksByOwner);

// Get one book
router.get('/books/:bookId', getBook);

// update one book
router.put('/books/:bookId', upload.single('coverImage'), updateBook);  

// DELETE /api/books/:bookId
router.delete('/books/:bookId', deleteBook);

module.exports = router;  