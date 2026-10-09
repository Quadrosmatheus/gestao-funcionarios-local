require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') });
process.env.APP_MODE = 'demo';
process.env.DATABASE_URL = 'file:../data/demo.db';

const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const prisma = require('../src/prisma/client');

const day = (offset = 0, hour = 12) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  date.setHours(hour, 0, 0, 0);
  return date;
};

async function seedDemo() {
  if ((await prisma.user.count()) > 0) {
    throw new Error('A base de demonstração já contém dados; ela não foi alterada.');
  }

  const password = crypto.randomBytes(18).toString('base64url');
  const admin = await prisma.user.create({
    data: {
      nome: 'Admin Demonstração',
      email: 'demo.admin@local.test',
      senha: await bcrypt.hash(password, 12),
      funcao: 'ADMIN',
    },
  });

  const [operations, people, technology] = await Promise.all([
    prisma.departamento.create({ data: { nome: 'Operações', descricao: 'Equipe de exemplo' } }),
    prisma.departamento.create({ data: { nome: 'Pessoas', descricao: 'Equipe de exemplo' } }),
    prisma.departamento.create({ data: { nome: 'Tecnologia', descricao: 'Equipe de exemplo' } }),
  ]);
  const [analyst, assistant, developer] = await Promise.all([
    prisma.cargo.create({ data: { nome: 'Analista', descricao: 'Cargo de demonstração' } }),
    prisma.cargo.create({ data: { nome: 'Assistente', descricao: 'Cargo de demonstração' } }),
    prisma.cargo.create({ data: { nome: 'Desenvolvedor', descricao: 'Cargo de demonstração' } }),
  ]);
  const schedule = await prisma.horario.create({
    data: {
      nome: 'Comercial',
      entrada: '09:00',
      saida: '18:00',
      pausaInicio: '12:00',
      pausaFim: '13:00',
    },
  });

  const fixtures = [
    ['Ana Exemplo', 'ana@exemplo.invalid', analyst.id, people.id],
    ['Bruno Demonstração', 'bruno@exemplo.invalid', developer.id, technology.id],
    ['Camila Fictícia', 'camila@exemplo.invalid', assistant.id, operations.id],
    ['Daniel Ilustrativo', 'daniel@exemplo.invalid', analyst.id, operations.id],
    ['Elisa Amostra', 'elisa@exemplo.invalid', developer.id, technology.id],
  ];
  const employees = await Promise.all(
    fixtures.map(([nome, email, cargoId, departamentoId], index) =>
      prisma.funcionario.create({
        data: {
          nome,
          email,
          cargoId,
          departamentoId,
          horarioId: schedule.id,
          admissaoEm: day(-90 - index * 34, 12),
          ativo: index !== 4,
          desligamentoEm: index === 4 ? day(-4, 12) : null,
        },
      }),
    ),
  );

  const now = new Date();
  const punch = new Date(now);
  punch.setHours(9, 0, 0, 0);
  await prisma.ponto.createMany({
    data: [
      { funcionarioId: employees[0].id, tipo: 'ENTRADA', ocorridoEm: punch, criadoPorId: admin.id },
      {
        funcionarioId: employees[1].id,
        tipo: 'ENTRADA',
        ocorridoEm: new Date(punch.getTime() + 4 * 60000),
        criadoPorId: admin.id,
      },
      {
        funcionarioId: employees[2].id,
        tipo: 'ENTRADA',
        ocorridoEm: new Date(punch.getTime() + 8 * 60000),
        criadoPorId: admin.id,
      },
    ],
  });
  await prisma.ausencia.createMany({
    data: [
      {
        funcionarioId: employees[0].id,
        tipo: 'FERIAS',
        inicio: day(5, 12),
        fim: day(14, 12),
        motivo: 'Exemplo fictício para demonstração',
        status: 'PENDENTE',
      },
      {
        funcionarioId: employees[1].id,
        tipo: 'ATESTADO',
        inicio: day(-1, 12),
        fim: day(1, 12),
        motivo: 'Exemplo fictício para demonstração',
        status: 'APROVADA',
        aprovadoPorId: admin.id,
      },
    ],
  });
  await prisma.auditoria.createMany({
    data: [
      { usuarioId: admin.id, acao: 'CRIAR_DADOS_DEMONSTRACAO', entidade: 'Sistema' },
      { usuarioId: admin.id, acao: 'LOGIN', entidade: 'User', entidadeId: String(admin.id) },
    ],
  });

  console.log('Base fictícia preparada para demonstração.');
  console.log('Usuário: demo.admin@local.test');
  console.log(`Senha temporária: ${password}`);
  console.log('Banco isolado: backend/data/demo.db');
}

seedDemo()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
