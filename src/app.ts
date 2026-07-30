import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/books.routes';
import uploadRoutes from './routes/upload.routes';
import analyticsRoutes from './routes/analytics.routes';
import widgetRoutes from './routes/widget.routes';
import statsRoutes from './routes/stats.routes';
import recommendationsRoutes from './routes/recommendations.routes';
import { authenticate } from './middleware/auth';
import { apiLimiter, authLimiter } from './middleware/rateLimit';
import { listAllHighlights } from './controllers/highlights.controller';
import { listAllNotes } from './controllers/notes.controller';
import { errorHandler } from './middleware/errorHandler';

const app: express.Application = express();

app.set('trust proxy', 1);

// ALLOWED_ORIGINS is a comma-separated allowlist (e.g. "https://vellum.app,https://staging.vellum.app").
// Left unset, cors() falls back to its permissive default (reflect any origin) — the same
// behavior as before this was added, so a missing/misconfigured env var doesn't lock out traffic.
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors(allowedOrigins && allowedOrigins.length > 0 ? { origin: allowedOrigins } : undefined));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

app.use('/api', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/widget', widgetRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.get('/api/highlights', authenticate, listAllHighlights);
app.get('/api/notes', authenticate, listAllNotes);

app.use(errorHandler);

export default app;
