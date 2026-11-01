import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler, notFound } from './middleware/errorHandler.mjs';

// Route imports
import roomRoutes from './routes/roomRoutes.mjs';
import bookingRoutes from './routes/bookingRoutes.mjs';
import customerRoutes from './routes/customerRoutes.mjs';
import serviceRoutes from './routes/serviceRoutes.mjs';
import contactRoutes from './routes/contactRoutes.mjs';
import authRoutes from './routes/authRoutes.mjs';

connectDB();

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ---------- REST API ----------
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Palace City Hotel API is running' });
});

// ---------- Static frontend ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Dynamic room details page: /rooms/:id -> serves room-details.html,
// which then fetches the actual room data from /api/rooms/:id via JS.
app.get('/rooms/:id', (req, res) => {
  res.sendFile(path.join(frontendPath, 'room-details.html'));
});

// Any other non-API, non-file route falls back to index.html
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// ---------- Error handling ----------
app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;
const server = app.listen(PORT, () => {
  console.log(`Palace City Hotel server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the running server or change PORT in your .env file.`);
    process.exit(1);
  }

  console.error('Server failed to start:', error);
  process.exit(1);
});
