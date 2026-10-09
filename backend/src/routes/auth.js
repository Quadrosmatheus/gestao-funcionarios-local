const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const { authRequired, createToken } = require('../middleware/auth');
const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const senha = String(req.body.senha || '');
    if (!email || !senha) return res.status(400).json({ error: 'Informe e-mail e senha.' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.ativo || !(await bcrypt.compare(senha, user.senha))) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }
    const token = createToken(user);
    await prisma.auditoria.create({ data: { usuarioId: user.id, acao: 'LOGIN', entidade: 'User', entidadeId: String(user.id) } });
    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email, funcao: user.funcao } });
  } catch (error) { next(error); }
});

router.get('/me', authRequired, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.auth.sub) }, select: { id: true, nome: true, email: true, funcao: true, ativo: true } });
    if (!user?.ativo) return res.status(401).json({ error: 'Conta desativada.' });
    res.json(user);
  } catch (error) { next(error); }
});

module.exports = router;
