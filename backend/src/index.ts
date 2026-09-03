import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mounting API routes
app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.json({
    name: 'AI Finance Controller API Server',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: '/docs',
  });
});

export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 AI Finance Controller Backend Server running on http://localhost:${PORT}`);
  });
}
