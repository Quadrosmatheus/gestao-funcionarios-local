const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const attendanceTypes = ['ENTRADA', 'SAIDA_INTERVALO', 'VOLTA_INTERVALO', 'SAIDA'];
const leaveTypes = ['FERIAS', 'ATESTADO', 'FALTA', 'LICENCA', 'OUTRO'];

function text(value, max = 160) {
  return String(value ?? '').trim().slice(0, max);
}

function positiveInt(value) {
  if (value === null || value === undefined || value === '') return null;
  const result = Number(value);
  return Number.isInteger(result) && result > 0 ? result : NaN;
}

function validCpf(value) {
  if (!/^\d{11}$/.test(value) || /^([0-9])\1{10}$/.test(value)) return false;
  const digits = [...value].map(Number);
  const check = (length) => {
    const sum = digits.slice(0, length).reduce((total, digit, index) => total + digit * (length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return (remainder === 10 ? 0 : remainder) === digits[length];
  };
  return check(9) && check(10);
}

function validDate(value, optional = false) {
  if ((value === null || value === undefined || value === '') && optional) return null;
  const raw = String(value);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(raw + 'T12:00:00') : new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function employeeInput(body) {
  const nome = text(body.nome, 120);
  const email = text(body.email, 160).toLowerCase() || null;
  const cpf = text(body.cpf, 20).replace(/[^\d]/g, '') || null;
  const telefone = text(body.telefone, 32) || null;
  const dataNascimento = validDate(body.dataNascimento, true);
  const admissaoEm = validDate(body.admissaoEm, true) || new Date();
  const desligamentoEm = validDate(body.desligamentoEm, true);
  const cargoId = positiveInt(body.cargoId);
  const departamentoId = positiveInt(body.departamentoId);
  const horarioId = positiveInt(body.horarioId);
  const ativo = body.ativo === undefined ? true : body.ativo === true || body.ativo === 'true';

  if (nome.length < 2) return { error: 'Informe o nome completo.' };
  if (email && !emailPattern.test(email)) return { error: 'Informe um e-mail válido.' };
  if (cpf && !validCpf(cpf)) return { error: 'O CPF deve conter 11 dígitos válidos.' };
  if (body.dataNascimento && !dataNascimento) return { error: 'Data de nascimento inválida.' };
  if (body.admissaoEm && !validDate(body.admissaoEm)) return { error: 'Data de admissão inválida.' };
  if (body.desligamentoEm && !desligamentoEm) return { error: 'Data de desligamento inválida.' };
  for (const [label, id] of [['cargo', cargoId], ['departamento', departamentoId], ['horário', horarioId]]) {
    if (Number.isNaN(id)) return { error: `Selecione um ${label} válido.` };
  }
  return { data: { nome, email, cpf, telefone, dataNascimento, admissaoEm, desligamentoEm, cargoId, departamentoId, horarioId, ativo } };
}

function catalogInput(kind, body) {
  const nome = text(body.nome, 100);
  const descricao = text(body.descricao, 500) || null;
  if (nome.length < 2) return { error: 'Informe um nome com pelo menos 2 caracteres.' };
  if (kind !== 'schedule') return { data: { nome, descricao, ativo: body.ativo === undefined ? true : body.ativo === true || body.ativo === 'true' } };
  const entrada = text(body.entrada, 5);
  const saida = text(body.saida, 5);
  const pausaInicio = text(body.pausaInicio, 5) || null;
  const pausaFim = text(body.pausaFim, 5) || null;
  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!time.test(entrada) || !time.test(saida)) return { error: 'Informe entrada e saída no formato HH:MM.' };
  if ((pausaInicio && !time.test(pausaInicio)) || (pausaFim && !time.test(pausaFim))) return { error: 'Confira os horários de pausa.' };
  return { data: { nome, descricao, entrada, saida, pausaInicio, pausaFim, ativo: body.ativo === undefined ? true : body.ativo === true || body.ativo === 'true' } };
}

function dateRangeInput(body) {
  const inicio = validDate(body.inicio);
  const fim = validDate(body.fim);
  const funcionarioId = positiveInt(body.funcionarioId);
  const tipo = text(body.tipo, 30).toUpperCase();
  const motivo = text(body.motivo, 500) || null;
  if (!funcionarioId || Number.isNaN(funcionarioId)) return { error: 'Selecione um funcionário.' };
  if (!inicio || !fim || fim < inicio) return { error: 'Informe um período válido.' };
  if (!leaveTypes.includes(tipo)) return { error: 'Tipo de ausência inválido.' };
  return { data: { funcionarioId, inicio, fim, tipo, motivo } };
}

module.exports = { attendanceTypes, catalogInput, dateRangeInput, employeeInput, leaveTypes, positiveInt, text, validCpf, validDate };

