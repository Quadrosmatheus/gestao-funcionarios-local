require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') });
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const bcrypt = require('bcryptjs');
const prisma = require('../src/prisma/client');

function hiddenQuestion(prompt) {
  return new Promise((resolve, reject) => {
    if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') return reject(new Error('Execute este comando em um terminal interativo para não exibir a senha.'));
    stdout.write(prompt);
    let value = '';
    const onData = (chunk) => {
      const key = chunk.toString();
      if (key === '\u0003') { cleanup(); reject(new Error('Operação cancelada.')); return; }
      if (key === '\r' || key === '\n') { stdout.write('\n'); cleanup(); resolve(value); return; }
      if (key === '\u007f' || key === '\b') { value = value.slice(0, -1); return; }
      if (key >= ' ') value += key;
    };
    function cleanup() { stdin.removeListener('data', onData); stdin.setRawMode(false); stdin.pause(); }
    stdin.setRawMode(true); stdin.resume(); stdin.on('data', onData);
  });
}

(async () => {
  try {
    if (await prisma.user.count()) throw new Error('Já existe pelo menos um usuário. Use a tela de administração para gerenciar acessos.');
    const rl = readline.createInterface({ input: stdin, output: stdout });
    let nome, email;
    try { nome = (await rl.question('Nome do administrador: ')).trim(); email = (await rl.question('E-mail: ')).trim().toLowerCase(); }
    finally { rl.close(); }
    const senha = await hiddenQuestion('Senha (mínimo 12 caracteres; não será exibida): ');
    if (nome.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || senha.length < 12) throw new Error('Confira nome, e-mail e senha (mínimo 12 caracteres).');
    await prisma.user.create({ data: { nome, email, senha: await bcrypt.hash(senha, 12), funcao: 'ADMIN' } });
    console.log('Administrador criado. A senha foi armazenada com hash.');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
  finally { await prisma.$disconnect(); }
})();
