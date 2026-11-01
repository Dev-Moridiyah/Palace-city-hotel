import Room from '../models/Room.mjs';
import asyncHandler from '../middleware/asyncHandler.mjs';

// @desc    Get all rooms (supports ?type=, ?minPrice=, ?maxPrice=, ?guests=)
// @route   GET /api/rooms
// @access  Public
const getRooms = asyncHandler(async (req, res) => {
  const { type, minPrice, maxPrice, guests, featured } = req.query;
  const filter = {};

  if (type) filter.type = type;
  if (featured) filter.featured = featured === 'true';
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.gte = Number(minPrice);
    if (maxPrice) filter.price.lte = Number(maxPrice);
  }
  if (guests) filter['capacity.adults'] = { $gte: Number(guests) };

  const rooms = await Room.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: rooms.length, data: rooms });
});

// @desc    Get single room by id OR slug
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

  const room = isValidObjectId
    ? await Room.findById(id)
    : await Room.findOne({ slug: id });

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  res.status(200).json({ success: true, data: room });
});

// @desc    Create a room
// @route   POST /api/rooms
// @access  Private (admin)
const createRoom = asyncHandler(async (req, res) => {
  const room = await Room.create(req.body);
  res.status(201).json({ success: true, data: room });
});

// @desc    Update a room
// @route   PUT /api/rooms/:id
// @access  Private (admin)
const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  Object.assign(room, req.body);
  await room.save();

  res.status(200).json({ success: true, data: room });
});

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private (admin)
const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  await room.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

export { getRooms, getRoomById, createRoom, updateRoom, deleteRoom };

export default { getRooms, getRoomById, createRoom, updateRoom, deleteRoom };
