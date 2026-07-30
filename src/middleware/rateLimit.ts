import rateLimit from 'express-rate-limit';

// General API rate limiter (600 requests per 15 minutes)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Don't limit GET or analytics. req.path is relative to this middleware's
  // mount point ('/api/'), so the analytics route here is '/analytics/track',
  // not the full '/api/analytics/track'.
  skip: (req) => req.method === 'GET' || req.path === '/analytics/track',
});

// Auth rate limiter (10 POST attempts per 15 minutes)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET',
});

// Strict limiter for password reset (3 attempts per hour)
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload limiter (5 uploads per hour)
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
