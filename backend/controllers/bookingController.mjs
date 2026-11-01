import Booking from '../models/Booking.mjs';
import Customer from '../models/Customer.mjs';
import Room from '../models/Room.mjs';
import asyncHandler from '../middleware/asyncHandler.mjs';

// @desc    Create a booking (also creates/reuses the customer record)
// @route   POST /api/bookings
// @access  Public
const createBooking = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    phone,
    country,
    roomId,
    checkIn,
    checkOut,
    adults,
    children,
    specialRequests,
  } = req.body;

  if (!fullName || !email || !phone || !roomId || !checkIn || !checkOut) {
    res.status(400);
    throw new Error('Please fill in all required booking fields');
  }

  const room = await Room.findById(roomId);
  if (!room) {
    res.status(404);
    throw new Error('Selected room does not exist');
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkOutDate <= checkInDate) {
    res.status(400);
    throw new Error('Check-out date must be after check-in date');
  }

  // Reuse an existing customer by email, otherwise create a new one
  let customer = await Customer.findOne({ email: email.toLowerCase() });
  if (!customer) {
    customer = await Customer.create({ fullName, email, phone, country });
  } else {
    customer.fullName = fullName;
    customer.phone = phone;
    if (country) customer.country = country;
    await customer.save();
  }

  const nights = Math.max(
    1,
    Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
  );

  const booking = await Booking.create({
    room: room._id,
    customer: customer._id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests: { adults: adults || 1, children: children || 0 },
    nights,
    totalPrice: nights * room.price,
    specialRequests,
  });

  const populatedBooking = await booking.populate([
    { path: 'room', select: 'name type price images' },
    { path: 'customer', select: 'fullName email phone' },
  ]);

  res.status(201).json({ success: true, data: populatedBooking });
});

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (admin)
const getBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const bookings = await Booking.find(filter)
    .populate('room', 'name type price images')
    .populate('customer', 'fullName email phone')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private (admin)
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('room')
    .populate('customer');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  res.status(200).json({ success: true, data: booking });
});

// @desc    Update booking status / payment status
// @route   PUT /api/bookings/:id
// @access  Private (admin)
const updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  const { status, paymentStatus } = req.body;
  if (status) booking.status = status;
  if (paymentStatus) booking.paymentStatus = paymentStatus;

  await booking.save();
  res.status(200).json({ success: true, data: booking });
});

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private (admin)
const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  await booking.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

export {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
};

export default {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
};
