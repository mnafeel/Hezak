import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import { router } from './routes';

const app = express();

app.use(
  cors({
    origin: env.NODE_ENV === 'development' ? 'http://localhost:5173' : '*',
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', router);

export { app };

