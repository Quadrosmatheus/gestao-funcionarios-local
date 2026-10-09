const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const { createBackup, paths } = require('./local-storage');

async function restore() {
  const backupDirectory = path.resolve(process.argv[2] || '');
  const backupDatabase = path.join(backupDirectory, 'funcionarios.db');
  const backupUploads = path.join(backupDirectory, 'uploads');
  if (!process.argv[2] || !fs.existsSync(backupDatabase) || !stdin.isTTY) {
    throw new Error('Uso: npm run backup:restore -- <pasta-do-backup>, em terminal interativo.');
  }
  console.log(
    'A restauração substitui o banco e os anexos atuais. Feche o sistema antes de continuar.',
  );
  const rl = readline.createInterface({ input: stdin, output: stdout });
  let confirmation;
  try {
    confirmation = await rl.question('Digite RESTAURAR para confirmar: ');
  } finally {
    rl.close();
  }
  if (confirmation !== 'RESTAURAR') throw new Error('Restauração cancelada.');

  const safetyBackup = await createBackup('antes-da-restauracao');
  const { database, uploads } = paths();
  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    const current = `${database}${suffix}`;
    if (fs.existsSync(current)) fs.rmSync(current, { force: true });
  }
  fs.copyFileSync(backupDatabase, database);
  if (fs.existsSync(uploads)) fs.rmSync(uploads, { recursive: true, force: true });
  if (fs.existsSync(backupUploads)) fs.cpSync(backupUploads, uploads, { recursive: true });
  else fs.mkdirSync(uploads, { recursive: true });
  console.log(`Restauração concluída. Cópia de segurança anterior: ${safetyBackup}`);
}

restore().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
