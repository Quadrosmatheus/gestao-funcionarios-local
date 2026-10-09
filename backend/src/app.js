require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('node:path');
const fs = require('node:fs');
const prisma = require('./prisma/client');
const authRoutes = require('./routes/auth');
const hrRoutes = require('./routes/hr');
const { authRequired } = require('./middleware/auth');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('Configure JWT_SECRET com pelo menos 32 caracteres em backend/.env.');
}

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: ['http://127.0.0.1:5173', 'http://localhost:5173'] }));
app.use(express.json({ limit: '1mb' }));
app.use(
  '/api/auth/login',
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false }),
);
app.use(
  '/api/auth/register',
  rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method !== 'POST',
  }),
);
app.use(
  '/api/auth/demo',
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false }),
);
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', storage: process.env.APP_MODE === 'demo' ? 'demo' : 'local' });
  } catch {
    res.status(503).json({ status: 'degraded', storage: 'unavailable' });
  }
});
app.use('/api/auth', authRoutes);
app.use('/api', authRequired, hrRoutes);
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist, { index: false }));
app.get('*', (_req, res, next) => {
  const index = path.join(frontendDist, 'index.html');
  fs.existsSync(index) ? res.sendFile(index) : next();
});
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Erro interno. Consulte o log local do servidor.' });
});

module.exports = app;
