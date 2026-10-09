const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const { authRequired, createToken } = require('../middleware/auth');
const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();
    const senha = String(req.body.senha || '');
    if (!email || !senha) return res.status(400).json({ error: 'Informe e-mail e senha.' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.ativo || !(await bcrypt.compare(senha, user.senha))) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }
    const token = createToken(user);
    await prisma.auditoria.create({
      data: { usuarioId: user.id, acao: 'LOGIN', entidade: 'User', entidadeId: String(user.id) },
    });
    res.json({
      token,
      user: { id: user.id, nome: user.nome, email: user.email, funcao: user.funcao },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/register/status', async (_req, res, next) => {
  try {
    res.json({ open: (await prisma.user.count()) === 0, demo: process.env.APP_MODE === 'demo' });
  } catch (error) {
    next(error);
  }
});

router.post('/demo', async (_req, res, next) => {
  try {
    if (process.env.APP_MODE !== 'demo')
      return res.status(404).json({ error: 'Rota não encontrada.' });
    const user = await prisma.user.findUnique({ where: { email: 'demo.admin@local.test' } });
    if (!user?.ativo)
      return res.status(409).json({ error: 'A conta de demonstração não está pronta.' });
    const token = createToken(user);
    await prisma.auditoria.create({
      data: {
        usuarioId: user.id,
        acao: 'ENTRAR_DEMONSTRACAO',
        entidade: 'User',
        entidadeId: String(user.id),
      },
    });
    res.json({
      token,
      user: { id: user.id, nome: user.nome, email: user.email, funcao: user.funcao },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const nome = String(req.body.nome || '').trim();
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();
    const senha = String(req.body.senha || '');
    if (nome.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || senha.length < 12)
      return res
        .status(400)
        .json({ error: 'Informe nome, e-mail válido e senha com pelo menos 12 caracteres.' });

    const user = await prisma.$transaction(async (tx) => {
      if (await tx.user.count()) {
        const error = new Error(
          'Já existe uma conta neste computador. Peça ao administrador para criar seu acesso.',
        );
        error.status = 409;
        throw error;
      }
      return tx.user.create({
        data: { nome, email, senha: await bcrypt.hash(senha, 12), funcao: 'ADMIN' },
      });
    });
    await prisma.auditoria.create({
      data: {
        usuarioId: user.id,
        acao: 'CRIAR_CONTA_INICIAL',
        entidade: 'User',
        entidadeId: String(user.id),
      },
    });
    res.status(201).json({
      token: createToken(user),
      user: { id: user.id, nome: user.nome, email: user.email, funcao: user.funcao },
    });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    if (error.code === 'P2002')
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    next(error);
  }
});

router.patch('/password', authRequired, async (req, res, next) => {
  try {
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');
    if (newPassword.length < 12)
      return res.status(400).json({ error: 'A nova senha precisa ter pelo menos 12 caracteres.' });
    const user = await prisma.user.findUnique({ where: { id: Number(req.auth.sub) } });
    if (!user || !(await bcrypt.compare(currentPassword, user.senha)))
      return res.status(401).json({ error: 'Senha atual incorreta.' });
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { senha: await bcrypt.hash(newPassword, 12), sessionVersion: { increment: 1 } },
    });
    await prisma.auditoria.create({
      data: {
        usuarioId: user.id,
        acao: 'ALTERAR_SENHA',
        entidade: 'User',
        entidadeId: String(user.id),
      },
    });
    res.json({
      token: createToken(updated),
      user: { id: updated.id, nome: updated.nome, email: updated.email, funcao: updated.funcao },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authRequired, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.auth.sub) },
      select: { id: true, nome: true, email: true, funcao: true, ativo: true },
    });
    if (!user?.ativo) return res.status(401).json({ error: 'Conta desativada.' });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
