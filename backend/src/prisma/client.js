require('dotenv').config({ path: require('node:path').resolve(__dirname, '../../.env') });
if (process.env.APP_MODE === 'demo') {
  process.env.DATABASE_URL = 'file:../data/demo.db';
  process.env.UPLOAD_DIR = './data/demo-uploads';
}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
module.exports = prisma;
