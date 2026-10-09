export const groups = [
  ['VISÃO GERAL', [['dashboard', 'Visão geral', '⌂']]],
  [
    'PESSOAS',
    [
      ['employees', 'Funcionários', '♙'],
      ['departments', 'Departamentos', '▦'],
      ['roles', 'Cargos', '◇'],
      ['schedules', 'Jornadas', '◷'],
    ],
  ],
  [
    'ROTINA',
    [
      ['attendance', 'Registro de ponto', '◉'],
      ['leaves', 'Férias e ausências', '▤'],
    ],
  ],
  [
    'GESTÃO',
    [
      ['users', 'Acessos', '♧'],
      ['reports', 'Relatórios', '▥'],
      ['audit', 'Auditoria', '◉'],
    ],
  ],
];
export const titleFor = Object.fromEntries(
  groups.flatMap((group) => group[1].map((item) => [item[0], item[1]])),
);
