const { spawnSync } = require('node:child_process');
const path = require('node:path');

const backend = path.resolve(__dirname, '../backend');
const env = {
  ...process.env,
  APP_MODE: 'demo',
  DATABASE_URL: 'file:../data/demo.db',
  UPLOAD_DIR: './data/demo-uploads',
};
const npmCli = process.env.npm_execpath;

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32' && command.endsWith('.cmd'),
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

run(
  process.execPath,
  [
    '-e',
    "const db=require('./src/prisma/client'); db.$queryRaw`SELECT 1`.finally(()=>db.$disconnect())",
  ],
  backend,
);
if (!npmCli) {
  throw new Error(
    'Inicie a preparação com "npm run demo:setup" para localizar o npm corretamente.',
  );
}
run(process.execPath, [npmCli, 'run', 'db:deploy'], backend);
run(process.execPath, ['scripts/seed-demo.js'], backend);
