require('dotenv').config({ path: require('node:path').resolve(__dirname, '../../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
module.exports = prisma;
