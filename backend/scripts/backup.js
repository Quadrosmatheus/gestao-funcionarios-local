const { createBackup } = require('./local-storage');

createBackup()
  .then((destination) => console.log(`Backup local criado em: ${destination}`))
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
