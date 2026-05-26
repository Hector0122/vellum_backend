import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/books.routes';
import uploadRoutes from './routes/upload.routes';
import { errorHandler } from './middleware/errorHandler';

const app: express.Application = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/upload', uploadRoutes);

app.use(errorHandler);

export default app;
