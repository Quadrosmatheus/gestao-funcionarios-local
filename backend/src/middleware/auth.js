const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');

function createToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET precisa ter pelo menos 32 caracteres.');
  return jwt.sign({ sub: user.id, role: user.funcao }, secret, { expiresIn: '8h', issuer: 'gestao-funcionarios-local' });
}

async function authRequired(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Faça login para continuar.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: 'gestao-funcionarios-local' });
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId <= 0) return res.status(401).json({ error: 'Sessão inválida ou expirada. Entre novamente.' });
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, funcao: true, ativo: true } });
    if (!user?.ativo) return res.status(401).json({ error: 'Conta desativada. Entre novamente.' });
    req.auth = { sub: user.id, role: user.funcao };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'NotBeforeError') {
      return res.status(401).json({ error: 'Sessão inválida ou expirada. Entre novamente.' });
    }
    next(error);
  }
}

function roles(...allowed) {
  return (req, res, next) => allowed.includes(req.auth?.role)
    ? next()
    : res.status(403).json({ error: 'Seu perfil não pode realizar esta ação.' });
}

module.exports = { authRequired, createToken, roles };
