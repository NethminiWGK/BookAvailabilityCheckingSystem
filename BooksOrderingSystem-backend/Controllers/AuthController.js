// GET /api/user/:userId/address
const getAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ address: user.address || null });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// PUT /api/user/:userId/address
const updateAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    const address = req.body.address;
    if (!address) return res.status(400).json({ message: 'Address required' });
    const user = await User.findByIdAndUpdate(userId, { address }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ message: 'Address updated', address: user.address });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Schemas/User.js');

const ensureSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Server misconfigured: JWT_SECRET is missing');
  return secret;
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (role === 'ADMIN') {
      return res.status(403).json({ message: 'Admin registration is not allowed.' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'User already exists. Please log in.' });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hash, role });

    try {
      const token = jwt.sign(
        { uid: user._id, role: user.role },
        ensureSecret(),
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        message: 'Registered successfully',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } catch (signErr) {
      // rollback the created user if signing fails
      await User.findByIdAndDelete(user._id);
      throw signErr;
    }
  } catch (e) {
    const msg = e.message.includes('JWT_SECRET')
      ? 'Server configuration error. Please try again later.'
      : e.message;
    return res.status(500).json({ message: msg });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found. Please register first.' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { uid: user._id, role: user.role },
      ensureSecret(),
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    const msg = e.message.includes('JWT_SECRET')
      ? 'Server configuration error. Please try again later.'
      : e.message;
    return res.status(500).json({ message: msg });
  }
};


const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.uid).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { register, login, me, getAddress, updateAddress };
