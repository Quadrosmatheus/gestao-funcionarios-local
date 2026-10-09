const test = require('node:test');
const assert = require('node:assert/strict');
const {
  attendanceTypes,
  catalogInput,
  dateRangeInput,
  employeeInput,
  positiveInt,
  validCpf,
  validDate,
} = require('../src/domain');

test('ids accept only positive whole numbers', () => {
  assert.equal(positiveInt('3'), 3);
  assert.equal(Number.isNaN(positiveInt('0')), true);
  assert.equal(Number.isNaN(positiveInt('-2')), true);
  assert.equal(Number.isNaN(positiveInt('1.2')), true);
});
test('employee input trims fields and allows optional relationships', () => {
  const r = employeeInput({
    nome: ' Ana Silva ',
    email: ' ANA@EXAMPLE.COM ',
    telefone: ' 11999999999 ',
  });
  assert.equal(r.data.nome, 'Ana Silva');
  assert.equal(r.data.email, 'ana@example.com');
  assert.equal(r.data.cargoId, null);
  assert.equal(r.data.ativo, true);
});
test('employee input validates names and email', () => {
  assert.match(employeeInput({ nome: 'A' }).error, /nome/i);
  assert.match(employeeInput({ nome: 'Ana', email: 'wrong' }).error, /e-mail/i);
});
test('CPF check digits are validated', () => {
  assert.equal(validCpf('52998224725'), true);
  assert.equal(validCpf('52998224724'), false);
  assert.equal(validCpf('11111111111'), false);
});
test('catalog input validates schedules', () => {
  assert.equal(
    catalogInput('schedule', { nome: 'Comercial', entrada: '09:00', saida: '18:00' }).data.entrada,
    '09:00',
  );
  assert.match(
    catalogInput('schedule', { nome: 'Noite', entrada: '27:10', saida: '19:00' }).error,
    /HH:MM/,
  );
});
test('leave range requires employee, valid interval and supported kind', () => {
  assert.match(dateRangeInput({ tipo: 'FERIAS' }).error, /funcionário/);
  assert.match(
    dateRangeInput({ funcionarioId: 1, tipo: 'FERIAS', inicio: '2025-04-10', fim: '2025-04-01' })
      .error,
    /período/,
  );
  assert.equal(
    dateRangeInput({ funcionarioId: 1, tipo: 'FERIAS', inicio: '2025-04-01', fim: '2025-04-10' })
      .data.tipo,
    'FERIAS',
  );
});
test('date-only values stay on their calendar day', () => {
  const d = validDate('2025-04-15');
  assert.equal(d.getFullYear(), 2025);
  assert.equal(d.getMonth(), 3);
  assert.equal(d.getDate(), 15);
});
test('attendance event set is explicit', () => {
  assert.deepEqual(attendanceTypes, ['ENTRADA', 'SAIDA_INTERVALO', 'VOLTA_INTERVALO', 'SAIDA']);
});
