import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/books.routes';
import uploadRoutes from './routes/upload.routes';
import analyticsRoutes from './routes/analytics.routes';
import { authenticate } from './middleware/auth';
import { apiLimiter, authLimiter } from './middleware/rateLimit';
import { listAllHighlights } from './controllers/highlights.controller';
import { listAllNotes } from './controllers/notes.controller';
import { errorHandler } from './middleware/errorHandler';

const app: express.Application = express();

app.use(cors());
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
app.get('/api/highlights', authenticate, listAllHighlights);
app.get('/api/notes', authenticate, listAllNotes);

app.use(errorHandler);

export default app;
