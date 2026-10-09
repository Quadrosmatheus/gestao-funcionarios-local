require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') });
const app = require('./app');
const prisma = require('./prisma/client');

const server = app.listen(Number(process.env.PORT) || 5000, '127.0.0.1', () =>
  console.log(`API local disponível em http://127.0.0.1:${process.env.PORT || 5000}`),
);

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
