require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('node:path');
const prisma = require('./prisma/client');
const authRoutes = require('./routes/auth');
const hrRoutes = require('./routes/hr');
const { authRequired } = require('./middleware/auth');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('Configure JWT_SECRET com pelo menos 32 caracteres em backend/.env.');
  process.exit(1);
}
const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: ['http://127.0.0.1:5173', 'http://localhost:5173'] }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false }));
app.get('/api/health', async (_req, res) => {
  try { await prisma.$queryRaw`SELECT 1`; res.json({ status: 'ok', storage: 'local' }); }
  catch { res.status(503).json({ status: 'degraded', storage: 'unavailable' }); }
});
app.use('/api/auth', authRoutes);
app.use('/api', authRequired, hrRoutes);
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist, { index: false }));
app.get('*', (_req, res, next) => {
  const index = path.join(frontendDist, 'index.html');
  require('node:fs').existsSync(index) ? res.sendFile(index) : next();
});
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Erro interno. Consulte o log local do servidor.' });
});
const server = app.listen(Number(process.env.PORT) || 5000, '127.0.0.1', () => console.log(`API local disponível em http://127.0.0.1:${process.env.PORT || 5000}`));
async function shutdown() { server.close(async () => { await prisma.$disconnect(); process.exit(0); }); }
process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
