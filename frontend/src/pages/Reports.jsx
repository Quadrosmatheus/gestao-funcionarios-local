import { useState } from 'react';
import { api } from '../services/api';
import { Error, Heading } from '../components/ui';

export function Reports() {
  const [error, setError] = useState('');
  async function download(path, file) {
    setError('');
    try {
      const r = await api(path);
      const url = URL.createObjectURL(await r.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = file;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    }
  }
  const reports = [
    [
      '▤',
      'EQUIPE',
      'Quadro de funcionários',
      'Nome, contato, cargo, departamento, jornada, admissão e situação.',
      '/reports/employees.csv',
      'funcionarios.csv',
    ],
    [
      '◷',
      'JORNADA',
      'Espelho de ponto',
      'Marcações por dia, horas líquidas estimadas e indicação de pontos incompletos.',
      '/reports/attendance.csv',
      'espelho-de-ponto.csv',
    ],
    [
      '✳',
      'AFASTAMENTOS',
      'Férias e ausências',
      'Períodos, tipos, situação e pessoa vinculada.',
      '/reports/leaves.csv',
      'ferias-e-ausencias.csv',
    ],
  ];
  return (
    <>
      <Heading title="Relatórios" sub="Exporte os dados locais para análise." />
      <Error text={error} />
      <div className="report-grid">
        {reports.map((x) => (
          <div className="report-card" key={x[2]}>
            <div className="report-icon">{x[0]}</div>
            <span className="eyebrow">{x[1]}</span>
            <h3>{x[2]}</h3>
            <p>{x[3]}</p>
            <button className="btn secondary" onClick={() => download(x[4], x[5])}>
              Baixar CSV ↓
            </button>
          </div>
        ))}
      </div>
      <p className="privacy-help">
        Os relatórios podem conter dados pessoais. Guarde-os em local protegido.
      </p>
    </>
  );
}
