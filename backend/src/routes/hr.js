const express = require('express');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const multer = require('multer');
const prisma = require('../prisma/client');
const { authRequired, roles } = require('../middleware/auth');
const {
  attendanceTypes,
  catalogInput,
  dateRangeInput,
  employeeInput,
  leaveTypes,
  positiveInt,
  text,
  validDate,
} = require('../domain');
const router = express.Router();
const staffOnly = [authRequired, roles('ADMIN', 'RH')];
const uploadDir = path.resolve(__dirname, '../..', process.env.UPLOAD_DIR || './uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) =>
      cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowed = {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    };
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Boolean(allowed[file.mimetype]?.includes(ext)));
  },
});

async function audit(req, acao, entidade, entidadeId, details) {
  try {
    await prisma.auditoria.create({
      data: {
        usuarioId: Number(req.auth.sub),
        acao,
        entidade,
        entidadeId: entidadeId ? String(entidadeId) : null,
        detalhes: details ? JSON.stringify(details).slice(0, 1200) : null,
      },
    });
  } catch (error) {
    console.error('Falha ao gravar auditoria:', error.message);
  }
}
function handleDbError(error, res) {
  if (error.code === 'P2002')
    return res.status(409).json({ error: 'Já existe um registro com esses dados únicos.' });
  if (error.code === 'P2003')
    return res.status(400).json({ error: 'O registro relacionado não existe.' });
  if (error.code === 'P2025') return res.status(404).json({ error: 'Registro não encontrado.' });
  return null;
}
function reportError(error, res) {
  return (
    handleDbError(error, res) ||
    res.status(500).json({ error: 'Não foi possível concluir a operação.' })
  );
}
function csvCell(value) {
  let s = String(value ?? '').replace(/[\r\n]+/g, ' ');
  if (/^[=+@\-]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
function matchesFileSignature(file) {
  const bytes = fs.readFileSync(file.path);
  if (file.mimetype === 'application/pdf') return bytes.subarray(0, 5).toString() === '%PDF-';
  if (file.mimetype === 'image/jpeg')
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.mimetype === 'image/png')
    return bytes
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return false;
}

router.get('/dashboard', ...staffOnly, async (_req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [ativos, afastados, departamentos, cargos, hoje, pendentes, recentes] = await Promise.all(
      [
        prisma.funcionario.count({ where: { ativo: true, desligamentoEm: null } }),
        prisma.ausencia.count({
          where: { status: 'APROVADA', inicio: { lte: tomorrow }, fim: { gte: today } },
        }),
        prisma.departamento.count({ where: { ativo: true } }),
        prisma.cargo.count({ where: { ativo: true } }),
        prisma.ponto.count({ where: { ocorridoEm: { gte: today, lt: tomorrow } } }),
        prisma.ausencia.count({ where: { status: 'PENDENTE' } }),
        prisma.funcionario.findMany({
          where: { ativo: true },
          take: 6,
          orderBy: { criadoEm: 'desc' },
          include: { cargo: true, departamento: true },
        }),
      ],
    );
    res.json({
      resumo: {
        ativos,
        afastados,
        departamentos,
        cargos,
        registrosPontoHoje: hoje,
        solicitacoesPendentes: pendentes,
      },
      recentes,
    });
  } catch (error) {
    next(error);
  }
});

const catalogues = [
  { route: 'departments', model: 'departamento', kind: 'catalog', entity: 'Departamento' },
  { route: 'roles', model: 'cargo', kind: 'catalog', entity: 'Cargo' },
  { route: 'schedules', model: 'horario', kind: 'schedule', entity: 'Horario' },
];
for (const item of catalogues) {
  const base = '/' + item.route;
  router.get(base, ...staffOnly, async (_req, res, next) => {
    try {
      res.json(await prisma[item.model].findMany({ orderBy: { nome: 'asc' } }));
    } catch (e) {
      next(e);
    }
  });
  router.post(base, ...staffOnly, async (req, res) => {
    const parsed = catalogInput(item.kind, req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    try {
      const record = await prisma[item.model].create({ data: parsed.data });
      await audit(req, 'CRIAR', item.entity, record.id, { nome: record.nome });
      res.status(201).json(record);
    } catch (e) {
      reportError(e, res);
    }
  });
  router.patch(`${base}/:id`, ...staffOnly, async (req, res) => {
    const id = positiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identificador inválido.' });
    const parsed = catalogInput(item.kind, req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    try {
      const record = await prisma[item.model].update({ where: { id }, data: parsed.data });
      await audit(req, 'ATUALIZAR', item.entity, id);
      res.json(record);
    } catch (e) {
      reportError(e, res);
    }
  });
  router.delete(`${base}/:id`, ...staffOnly, async (req, res) => {
    const id = positiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identificador inválido.' });
    try {
      const record = await prisma[item.model].update({ where: { id }, data: { ativo: false } });
      await audit(req, 'DESATIVAR', item.entity, id);
      res.json(record);
    } catch (e) {
      reportError(e, res);
    }
  });
}

router.get('/employees', ...staffOnly, async (req, res, next) => {
  try {
    const q = text(req.query.q, 100);
    const where = q
      ? {
          OR: [
            { nome: { contains: q } },
            { email: { contains: q } },
            { cpf: { contains: q.replace(/\D/g, '') } },
          ],
        }
      : {};
    if (req.query.ativo === 'true') where.ativo = true;
    if (req.query.ativo === 'false') where.ativo = false;
    const list = await prisma.funcionario.findMany({
      where,
      orderBy: { nome: 'asc' },
      include: { cargo: true, departamento: true, horario: true },
    });
    res.json(list);
  } catch (error) {
    next(error);
  }
});
router.post('/employees', ...staffOnly, async (req, res) => {
  const parsed = employeeInput(req.body);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  try {
    const record = await prisma.funcionario.create({
      data: parsed.data,
      include: { cargo: true, departamento: true, horario: true },
    });
    await audit(req, 'CRIAR', 'Funcionario', record.id, { nome: record.nome });
    res.status(201).json(record);
  } catch (e) {
    reportError(e, res);
  }
});
router.patch('/employees/:id', ...staffOnly, async (req, res) => {
  const id = positiveInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Identificador inválido.' });
  const parsed = employeeInput(req.body);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  try {
    const record = await prisma.funcionario.update({
      where: { id },
      data: parsed.data,
      include: { cargo: true, departamento: true, horario: true },
    });
    await audit(req, 'ATUALIZAR', 'Funcionario', id);
    res.json(record);
  } catch (e) {
    reportError(e, res);
  }
});
router.delete('/employees/:id', ...staffOnly, async (req, res) => {
  const id = positiveInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Identificador inválido.' });
  try {
    const record = await prisma.funcionario.update({
      where: { id },
      data: { ativo: false, desligamentoEm: new Date() },
    });
    await audit(req, 'DESLIGAR', 'Funcionario', id);
    res.json(record);
  } catch (e) {
    reportError(e, res);
  }
});
router.post(
  '/employees/:id/documents',
  ...staffOnly,
  (req, res, next) =>
    upload.single('arquivo')(req, res, (error) =>
      error
        ? res.status(400).json({
            error:
              error.code === 'LIMIT_FILE_SIZE'
                ? 'O arquivo excede 5 MB.'
                : 'Arquivo inválido. Envie PDF, JPG ou PNG.',
          })
        : next(),
    ),
  async (req, res) => {
    const funcionarioId = positiveInt(req.params.id);
    if (!funcionarioId || !req.file)
      return res
        .status(400)
        .json({ error: 'Selecione um funcionário e um arquivo PDF, JPG ou PNG.' });
    if (!matchesFileSignature(req.file)) {
      fs.rmSync(req.file.path, { force: true });
      return res
        .status(400)
        .json({ error: 'O conteúdo do arquivo não corresponde a um PDF, JPG ou PNG válido.' });
    }
    try {
      const doc = await prisma.documento.create({
        data: {
          funcionarioId,
          nomeOriginal: text(req.file.originalname, 180),
          nomeArquivo: req.file.filename,
          mimeType: req.file.mimetype,
          tamanho: req.file.size,
        },
      });
      await audit(req, 'ENVIAR_DOCUMENTO', 'Documento', doc.id);
      res.status(201).json({
        id: doc.id,
        nomeOriginal: doc.nomeOriginal,
        mimeType: doc.mimeType,
        tamanho: doc.tamanho,
        enviadoEm: doc.enviadoEm,
      });
    } catch (e) {
      fs.rmSync(req.file.path, { force: true });
      reportError(e, res);
    }
  },
);
router.get('/employees/:id/documents', ...staffOnly, async (req, res, next) => {
  try {
    const id = positiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identificador inválido.' });
    res.json(
      await prisma.documento.findMany({
        where: { funcionarioId: id },
        select: { id: true, nomeOriginal: true, mimeType: true, tamanho: true, enviadoEm: true },
        orderBy: { enviadoEm: 'desc' },
      }),
    );
  } catch (e) {
    next(e);
  }
});
router.get('/documents/:id/download', ...staffOnly, async (req, res, next) => {
  try {
    const id = positiveInt(req.params.id);
    const doc = await prisma.documento.findUnique({ where: { id } });
    if (!doc) return res.status(404).json({ error: 'Documento não encontrado.' });
    const file = path.join(uploadDir, doc.nomeArquivo);
    if (!fs.existsSync(file))
      return res.status(404).json({ error: 'Arquivo local não encontrado.' });
    res.download(file, doc.nomeOriginal);
  } catch (e) {
    next(e);
  }
});

router.get('/attendance', ...staffOnly, async (req, res, next) => {
  try {
    const where = {};
    const employeeId = positiveInt(req.query.funcionarioId);
    if (employeeId && !Number.isNaN(employeeId)) where.funcionarioId = employeeId;
    const from = validDate(req.query.de, true);
    const to = validDate(req.query.ate, true);
    if (from || to)
      where.ocorridoEm = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) };
    res.json(
      await prisma.ponto.findMany({
        where,
        include: { funcionario: { select: { id: true, nome: true } } },
        orderBy: { ocorridoEm: 'desc' },
        take: 500,
      }),
    );
  } catch (e) {
    next(e);
  }
});
router.post('/attendance', ...staffOnly, async (req, res) => {
  const funcionarioId = positiveInt(req.body.funcionarioId);
  const tipo = text(req.body.tipo, 30).toUpperCase();
  const ocorridoEm = validDate(req.body.ocorridoEm, true) || new Date();
  if (!funcionarioId || Number.isNaN(funcionarioId))
    return res.status(400).json({ error: 'Selecione um funcionário.' });
  if (!attendanceTypes.includes(tipo))
    return res.status(400).json({ error: 'Tipo de marcação inválido.' });
  if (req.body.ocorridoEm && !validDate(req.body.ocorridoEm))
    return res.status(400).json({ error: 'Data e hora inválidas.' });
  try {
    const row = await prisma.ponto.create({
      data: {
        funcionarioId,
        tipo,
        ocorridoEm,
        observacao: text(req.body.observacao, 300) || null,
        criadoPorId: Number(req.auth.sub),
      },
      include: { funcionario: { select: { nome: true } } },
    });
    await audit(req, 'REGISTRAR_PONTO', 'Ponto', row.id);
    res.status(201).json(row);
  } catch (e) {
    reportError(e, res);
  }
});

router.get('/leaves', ...staffOnly, async (_req, res, next) => {
  try {
    res.json(
      await prisma.ausencia.findMany({
        include: {
          funcionario: { select: { id: true, nome: true } },
          aprovador: { select: { nome: true } },
        },
        orderBy: [{ status: 'asc' }, { inicio: 'desc' }],
      }),
    );
  } catch (e) {
    next(e);
  }
});
router.post('/leaves', ...staffOnly, async (req, res) => {
  const parsed = dateRangeInput(req.body);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  try {
    const row = await prisma.ausencia.create({
      data: parsed.data,
      include: { funcionario: { select: { nome: true } } },
    });
    await audit(req, 'CRIAR_SOLICITACAO', 'Ausencia', row.id);
    res.status(201).json(row);
  } catch (e) {
    reportError(e, res);
  }
});
router.patch('/leaves/:id/status', ...staffOnly, async (req, res) => {
  const id = positiveInt(req.params.id);
  const status = text(req.body.status, 20).toUpperCase();
  if (!id) return res.status(400).json({ error: 'Identificador inválido.' });
  if (!['APROVADA', 'REJEITADA', 'PENDENTE'].includes(status))
    return res.status(400).json({ error: 'Status inválido.' });
  try {
    const row = await prisma.ausencia.update({
      where: { id },
      data: { status, aprovadoPorId: status === 'PENDENTE' ? null : Number(req.auth.sub) },
    });
    await audit(req, 'ATUALIZAR_SOLICITACAO', 'Ausencia', id, { status });
    res.json(row);
  } catch (e) {
    reportError(e, res);
  }
});

router.get('/reports/employees.csv', ...staffOnly, async (_req, res, next) => {
  try {
    const rows = await prisma.funcionario.findMany({
      orderBy: { nome: 'asc' },
      include: { cargo: true, departamento: true, horario: true },
    });
    const lines = [
      ['Nome', 'E-mail', 'Telefone', 'Cargo', 'Departamento', 'Jornada', 'Admissão', 'Status']
        .map(csvCell)
        .join(';'),
      ...rows.map((x) =>
        [
          x.nome,
          x.email,
          x.telefone,
          x.cargo?.nome,
          x.departamento?.nome,
          x.horario?.nome,
          x.admissaoEm.toISOString().slice(0, 10),
          x.ativo ? 'Ativo' : 'Desligado',
        ]
          .map(csvCell)
          .join(';'),
      ),
    ];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="funcionarios.csv"');
    res.send(`\uFEFF${lines.join('\r\n')}`);
  } catch (e) {
    next(e);
  }
});

router.get('/users', authRequired, roles('ADMIN'), async (_req, res, next) => {
  try {
    res.json(
      await prisma.user.findMany({
        select: { id: true, nome: true, email: true, funcao: true, ativo: true, criadoEm: true },
        orderBy: { nome: 'asc' },
      }),
    );
  } catch (e) {
    next(e);
  }
});

router.get('/audit', authRequired, roles('ADMIN'), async (req, res, next) => {
  try {
    const requested = Number(req.query.limit || 100);
    const limit = Number.isInteger(requested) ? Math.min(Math.max(requested, 1), 200) : 100;
    const rows = await prisma.auditoria.findMany({
      take: limit,
      orderBy: { ocorridoEm: 'desc' },
      include: { usuario: { select: { nome: true, email: true } } },
    });
    res.json(rows);
  } catch (error) {
    next(error);
  }
});
router.post('/users', authRequired, roles('ADMIN'), async (req, res) => {
  const nome = text(req.body.nome, 120);
  const email = text(req.body.email, 160).toLowerCase();
  const senha = String(req.body.senha || '');
  const funcao = text(req.body.funcao, 20).toUpperCase();
  if (
    nome.length < 2 ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    senha.length < 12 ||
    !['ADMIN', 'RH'].includes(funcao)
  )
    return res
      .status(400)
      .json({ error: 'Confira nome, e-mail, perfil e senha (mínimo 12 caracteres).' });
  try {
    const bcrypt = require('bcryptjs');
    const record = await prisma.user.create({
      data: { nome, email, senha: await bcrypt.hash(senha, 12), funcao },
      select: { id: true, nome: true, email: true, funcao: true, ativo: true },
    });
    await audit(req, 'CRIAR_ACESSO', 'User', record.id);
    res.status(201).json(record);
  } catch (e) {
    reportError(e, res);
  }
});
router.patch('/users/:id', authRequired, roles('ADMIN'), async (req, res) => {
  const id = positiveInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Identificador inválido.' });
  if (id === Number(req.auth.sub) && req.body.ativo === false)
    return res.status(400).json({ error: 'Você não pode desativar seu próprio acesso.' });
  try {
    const record = await prisma.user.update({
      where: { id },
      data: { ativo: req.body.ativo === true },
      select: { id: true, nome: true, email: true, funcao: true, ativo: true },
    });
    await audit(req, 'ATUALIZAR_ACESSO', 'User', id);
    res.json(record);
  } catch (e) {
    reportError(e, res);
  }
});

router.get('/reports/attendance.csv', ...staffOnly, async (req, res, next) => {
  try {
    const de = validDate(req.query.de, true);
    const ate = validDate(req.query.ate, true);
    if ((req.query.de && !de) || (req.query.ate && !ate))
      return res.status(400).json({ error: 'Período inválido.' });
    const rows = await prisma.ponto.findMany({
      where: { ocorridoEm: { ...(de ? { gte: de } : {}), ...(ate ? { lte: ate } : {}) } },
      include: { funcionario: { select: { nome: true } } },
      orderBy: [{ funcionarioId: 'asc' }, { ocorridoEm: 'asc' }],
    });
    const groups = new Map();
    for (const row of rows) {
      const day = row.ocorridoEm.toISOString().slice(0, 10);
      const key = `${row.funcionarioId}:${day}`;
      if (!groups.has(key)) groups.set(key, { nome: row.funcionario.nome, data: day, events: [] });
      groups.get(key).events.push(row);
    }
    const fmt = (ms) =>
      ms > 0
        ? `${Math.floor(ms / 3600000)}h${String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0')}`
        : '—';
    const out = [
      [
        'Funcionário',
        'Data',
        'Entrada',
        'Saída para pausa',
        'Volta da pausa',
        'Saída',
        'Horas líquidas',
        'Marcações incompletas',
      ]
        .map(csvCell)
        .join(';'),
    ];
    for (const g of groups.values()) {
      const first = (t) => g.events.find((x) => x.tipo === t)?.ocorridoEm;
      const start = first('ENTRADA'),
        breakStart = first('SAIDA_INTERVALO'),
        breakEnd = first('VOLTA_INTERVALO'),
        end = [...g.events].reverse().find((x) => x.tipo === 'SAIDA')?.ocorridoEm;
      const gross = start && end ? end - start : 0;
      const pause = breakStart && breakEnd ? breakEnd - breakStart : 0;
      const net = gross > pause ? gross - pause : 0;
      out.push(
        [
          g.nome,
          g.data,
          start?.toLocaleTimeString('pt-BR') || '',
          breakStart?.toLocaleTimeString('pt-BR') || '',
          breakEnd?.toLocaleTimeString('pt-BR') || '',
          end?.toLocaleTimeString('pt-BR') || '',
          fmt(net),
          !start || !end ? 'Sim' : 'Não',
        ]
          .map(csvCell)
          .join(';'),
      );
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="espelho-de-ponto.csv"');
    res.send(`\uFEFF${out.join('\r\n')}`);
  } catch (e) {
    next(e);
  }
});
router.get('/reports/leaves.csv', ...staffOnly, async (_req, res, next) => {
  try {
    const rows = await prisma.ausencia.findMany({
      include: { funcionario: { select: { nome: true } } },
      orderBy: { inicio: 'desc' },
    });
    const out = [
      ['Funcionário', 'Tipo', 'Início', 'Fim', 'Status', 'Motivo'].map(csvCell).join(';'),
      ...rows.map((x) =>
        [
          x.funcionario.nome,
          x.tipo,
          x.inicio.toISOString().slice(0, 10),
          x.fim.toISOString().slice(0, 10),
          x.status,
          x.motivo,
        ]
          .map(csvCell)
          .join(';'),
      ),
    ];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="ferias-e-ausencias.csv"');
    res.send(`\uFEFF${out.join('\r\n')}`);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
