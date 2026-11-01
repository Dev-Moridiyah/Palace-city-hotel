import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    guests: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0, min: 0 },
    },
    nights: {
      type: Number,
    },
    totalPrice: {
      type: Number,
    },
    specialRequests: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
  },
  { timestamps: true }
);

bookingSchema.pre('validate', function (next) {
  if (this.checkIn && this.checkOut) {
    const oneDay = 1000 * 60 * 60 * 24;
    this.nights = Math.max(1, Math.round((this.checkOut - this.checkIn) / oneDay));
  }
  next();
});

export default mongoose.model('Booking', bookingSchema);
