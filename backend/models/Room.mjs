import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    type: {
      type: String,
      required: [true, 'Room type is required'],
      enum: ['Standard', 'Deluxe', 'Executive Suite', 'Presidential Suite', 'Family Room'],
    },
    description: {
      type: String,
      required: [true, 'Room description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: 0,
    },
    capacity: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0, min: 0 },
    },
    bedType: {
      type: String,
      default: 'Queen Bed',
    },
    sizeSqm: {
      type: Number,
    },
    facilities: [
      {
        type: String,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    totalRooms: {
      type: Number,
      default: 5,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

// Auto-generate a URL-friendly slug from the room name before saving
roomSchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();
  this.slug = this.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  next();
});

export default mongoose.model('Room', roomSchema);
