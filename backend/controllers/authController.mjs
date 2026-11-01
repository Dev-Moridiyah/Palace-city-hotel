import jwt from 'jsonwebtoken';
import asyncHandler from '../middleware/asyncHandler.mjs';
import Admin from '../models/Admin.mjs';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

  if (!admin || !(await admin.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.status(200).json({
    success: true,
    data: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id),
    },
  });
});

// @desc    Get logged-in admin's profile
// @route   GET /api/auth/me
// @access  Private (admin)
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.admin });
});

export { loginAdmin, getMe };

export default { loginAdmin, getMe };
