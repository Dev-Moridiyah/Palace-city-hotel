import Service from '../models/Service.mjs';
import asyncHandler from '../middleware/asyncHandler.mjs';

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ isActive: true }).sort({ createdAt: 1 });
  res.status(200).json({ success: true, count: services.length, data: services });
});

// @desc    Create a service
// @route   POST /api/services
// @access  Private (admin)
const createService = asyncHandler(async (req, res) => {
  const service = await Service.create(req.body);
  res.status(201).json({ success: true, data: service });
});

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (admin)
const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  Object.assign(service, req.body);
  await service.save();

  res.status(200).json({ success: true, data: service });
});

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (admin)
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  await service.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

export { getServices, createService, updateService, deleteService };

export default { getServices, createService, updateService, deleteService };