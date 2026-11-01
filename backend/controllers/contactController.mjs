import ContactMessage from '../models/ContactMessage.mjs';
import asyncHandler from '../middleware/asyncHandler.mjs';

// @desc    Submit a contact form message
// @route   POST /api/contact
// @access  Public
const sendMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Name, email and message are required');
  }

  const createdMessage = await ContactMessage.create({ name, email, subject, message });
  res.status(201).json({ success: true, data: createdMessage });
});

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private (admin)
const getMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: messages.length, data: messages });
});

// @desc    Mark a message as read
// @route   PUT /api/contact/:id/read
// @access  Private (admin)
const markAsRead = asyncHandler(async (req, res) => {
  const msg = await ContactMessage.findById(req.params.id);

  if (!msg) {
    res.status(404);
    throw new Error('Message not found');
  }

  msg.isRead = true;
  await msg.save();
  res.status(200).json({ success: true, data: msg });
});

// @desc    Delete a message
// @route   DELETE /api/contact/:id
// @access  Private (admin)
const deleteMessage = asyncHandler(async (req, res) => {
  const msg = await ContactMessage.findById(req.params.id);

  if (!msg) {
    res.status(404);
    throw new Error('Message not found');
  }

  await msg.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

export { sendMessage, getMessages, markAsRead, deleteMessage };

export default { sendMessage, getMessages, markAsRead, deleteMessage };
