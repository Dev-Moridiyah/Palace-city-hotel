import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.mjs';
import Admin from '../models/Admin.mjs';

// Protects admin routes. Expects: Authorization: Bearer <token>
const protectAdmin = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization) {
    const [scheme, ...tokenParts] = req.headers.authorization.split(' ');
    if (scheme && /^Bearer$/i.test(scheme) && tokenParts.length) {
      token = tokenParts.join(' ');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorised, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id).select('-password');

    if (!req.admin) {
      res.status(401);
      throw new Error('Not authorised, admin no longer exists');
    }

    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorised, token failed or expired');
  }
});

export { protectAdmin };

export default { protectAdmin };
