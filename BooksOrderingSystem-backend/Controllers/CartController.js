// Controllers/CartController.js
const mongoose = require('mongoose');
const Cart = require('../Schemas/Cart.js');    // your CartModel
const Book = require('../Schemas/Books.js');
const User = require('../Schemas/User.js')
const path = require('path');
const fs = require('fs');

const isId = (v) => mongoose.isValidObjectId(v);

// POST /api/cart  (body: { userId, bookId, quantity })
async function addToCart(req, res) {
  try {
    const { userId, bookId, quantity } = req.body;

    if (!isId(userId)) return res.status(400).json({ error: 'Invalid userId' });
    if (!isId(bookId)) return res.status(400).json({ error: 'Invalid bookId' });

    const qty = Math.max(1, Number(quantity) || 1);

    const book = await Book.findById(bookId).lean();
    if (!book) return res.status(404).json({ error: 'Book not found' });

    // upsert cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      const created = await Cart.create({
        userId,
        items: [{ bookId, title: book.title, price: book.price, quantity: qty }],
      });
      return res.json({ message: 'Item added', cart: created.items });
    }

    // item exists?
    const idx = cart.items.findIndex(i => String(i.bookId) === String(bookId));
    if (idx === -1) {
      cart.items.push({ bookId, title: book.title, price: book.price, quantity: qty });
    } else {
      cart.items[idx].quantity += qty;
      cart.items[idx].price = book.price;   // keep in sync
      cart.items[idx].title = book.title;
    }

    await cart.save();
    return res.json({ message: 'Cart updated', cart: cart.items });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// GET /api/cart/:userId
async function getCart(req, res) {
  try {
    const { userId } = req.params;
    if (!isId(userId)) return res.status(400).json({ error: 'Invalid userId' });

    const cart = await Cart.findOne({ userId }).lean();
    return res.json({ cart: cart?.items || [] });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// PUT /api/cart/update  (body: { userId, bookId, quantity })
async function updateItemQuantity(req, res) {
  try {
    const { userId, bookId, quantity } = req.body;
    if (!isId(userId) || !isId(bookId)) return res.status(400).json({ error: 'Invalid ids' });

    const qty = Math.max(1, Number(quantity) || 1);

    const cart = await Cart.findOneAndUpdate(
      { userId, 'items.bookId': bookId },
      { $set: { 'items.$.quantity': qty } },
      { new: true }
    );
    if (!cart) return res.status(404).json({ error: 'Cart or item not found' });

    return res.json({ message: 'Quantity updated', cart: cart.items });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// POST /api/cart/remove  (body: { userId, bookId })
async function removeItemFromCart(req, res) {
  try {
    const { userId, bookId } = req.body;
    if (!isId(userId) || !isId(bookId)) return res.status(400).json({ error: 'Invalid ids' });

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { bookId } } },
      { new: true }
    );
    return res.json({ message: 'Item removed', cart: cart?.items || [] });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// DELETE /api/cart/:userId
async function deleteCart(req, res) {
  try {
    const { userId } = req.params;
    if (!isId(userId)) return res.status(400).json({ error: 'Invalid userId' });

    await Cart.findOneAndDelete({ userId });
    return res.json({ message: 'Cart deleted' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

module.exports = { addToCart, getCart, updateItemQuantity, removeItemFromCart, deleteCart };
