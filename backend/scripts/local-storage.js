require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') });

const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');

function paths() {
  const url = process.env.DATABASE_URL || 'file:../data/funcionarios.db';
  if (!url.startsWith('file:')) throw new Error('Este comando requer o banco SQLite local.');
  const relativeDatabase = url.slice(5).split('?')[0];
  const database = path.resolve(__dirname, '../prisma', relativeDatabase);
  const isDemo = path.basename(database).toLowerCase() === 'demo.db';
  const uploads = path.resolve(
    __dirname,
    '..',
    isDemo ? './data/demo-uploads' : process.env.UPLOAD_DIR || './uploads',
  );
  const backups = path.resolve(__dirname, '../backups');
  return { database, uploads, backups };
}

function newPrismaClient() {
  return new PrismaClient();
}

async function createBackup(label = 'manual') {
  const { database, uploads, backups } = paths();
  if (!fs.existsSync(database)) throw new Error(`Banco não encontrado: ${database}`);
  fs.mkdirSync(backups, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const destination = path.join(backups, `${timestamp}-${label}`);
  fs.mkdirSync(destination, { recursive: false });
  const snapshotPath = path.join(destination, 'funcionarios.db');
  const quotedPath = snapshotPath.replace(/'/g, "''");
  const prisma = newPrismaClient();
  try {
    await prisma.$executeRawUnsafe(`VACUUM INTO '${quotedPath}'`);
  } finally {
    await prisma.$disconnect();
  }
  if (fs.existsSync(uploads))
    fs.cpSync(uploads, path.join(destination, 'uploads'), { recursive: true });
  fs.writeFileSync(
    path.join(destination, 'backup.json'),
    JSON.stringify(
      { createdAt: new Date().toISOString(), contains: ['SQLite database', 'uploads'] },
      null,
      2,
    ),
  );
  return destination;
}

module.exports = { createBackup, newPrismaClient, paths };
