const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const backend = path.resolve(__dirname, '..');
const database = path.join(backend, 'data', 'integration-test.db');
process.env.DATABASE_URL = 'file:../data/integration-test.db';
process.env.JWT_SECRET = 'integration-test-secret-only-for-this-test';
const prisma = require('../src/prisma/client');
const request = require('supertest');

let server;

test('auth, password rotation, role permissions and session revocation', async () => {
  fs.rmSync(database, { force: true });
  await prisma.$queryRaw`SELECT 1`;
  await prisma.$disconnect();
  execFileSync(
    process.execPath,
    [path.join(backend, 'node_modules/prisma/build/index.js'), 'migrate', 'deploy'],
    {
      cwd: backend,
      env: process.env,
      stdio: 'pipe',
    },
  );
  const app = require('../src/app');
  server = app.listen(0, '127.0.0.1');

  const bcrypt = require('bcryptjs');
  const admin = await prisma.user.create({
    data: {
      nome: 'Administrador de Teste',
      email: 'admin@test.invalid',
      senha: await bcrypt.hash('Senha-inicial-forte-123', 12),
      funcao: 'ADMIN',
    },
  });

  assert.equal((await request(server).get('/api/dashboard')).status, 401);
  const login = await request(server)
    .post('/api/auth/login')
    .send({ email: admin.email, senha: 'Senha-inicial-forte-123' });
  assert.equal(login.status, 200);
  const oldToken = login.body.token;
  assert.equal(
    (await request(server).get('/api/audit').set('Authorization', `Bearer ${oldToken}`)).status,
    200,
  );

  const changed = await request(server)
    .patch('/api/auth/password')
    .set('Authorization', `Bearer ${oldToken}`)
    .send({ currentPassword: 'Senha-inicial-forte-123', newPassword: 'Senha-nova-segura-456' });
  assert.equal(changed.status, 200);
  assert.equal(
    (await request(server).get('/api/dashboard').set('Authorization', `Bearer ${oldToken}`)).status,
    401,
  );
  assert.equal(
    (
      await request(server)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${changed.body.token}`)
    ).status,
    200,
  );

  const rh = await request(server)
    .post('/api/users')
    .set('Authorization', `Bearer ${changed.body.token}`)
    .send({
      nome: 'RH de Teste',
      email: 'rh@test.invalid',
      senha: 'Senha-rh-teste-123',
      funcao: 'RH',
    });
  assert.equal(rh.status, 201);
  const rhLogin = await request(server)
    .post('/api/auth/login')
    .send({ email: rh.body.email, senha: 'Senha-rh-teste-123' });
  assert.equal(rhLogin.status, 200);
  assert.equal(
    (await request(server).get('/api/audit').set('Authorization', `Bearer ${rhLogin.body.token}`))
      .status,
    403,
  );

  const deactivated = await request(server)
    .patch(`/api/users/${rh.body.id}`)
    .set('Authorization', `Bearer ${changed.body.token}`)
    .send({ ativo: false });
  assert.equal(deactivated.status, 200);
  assert.equal(
    (
      await request(server)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${rhLogin.body.token}`)
    ).status,
    401,
  );
});

test.after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();
  for (const suffix of ['', '-journal', '-wal', '-shm'])
    fs.rmSync(`${database}${suffix}`, { force: true });
});
