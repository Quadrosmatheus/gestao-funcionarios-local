import { useEffect, useState } from 'react';
import { api, localDate } from '../services/api';
import { Empty, Error, Field, Heading, Select } from '../components/ui';

export function Attendance() {
  const [rows, setRows] = useState([]),
    [people, setPeople] = useState([]),
    [form, setForm] = useState({
      funcionarioId: '',
      tipo: 'ENTRADA',
      ocorridoEm: `${localDate()}T09:00`,
      observacao: '',
    }),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      const [a, e] = await Promise.all([api('/attendance'), api('/employees?ativo=true')]);
      setRows(a);
      setPeople(e);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/attendance', { method: 'POST', body: JSON.stringify(form) });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="Registro de ponto"
        sub="Lançamentos manuais para acompanhar a jornada da equipe."
      />
      <Error text={error} />
      <div className="panel form-panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">NOVA MARCAÇÃO</span>
            <h3>Registrar evento</h3>
          </div>
        </div>
        <form className="inline-form" onSubmit={save}>
          <Select
            label="Funcionário"
            value={form.funcionarioId}
            options={people}
            onChange={(v) => setForm({ ...form, funcionarioId: v })}
            required
          />
          <label className="field">
            <span>Tipo</span>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
              {[
                ['ENTRADA', 'Entrada'],
                ['SAIDA_INTERVALO', 'Saída para pausa'],
                ['VOLTA_INTERVALO', 'Volta da pausa'],
                ['SAIDA', 'Saída'],
              ].map((x) => (
                <option value={x[0]} key={x[0]}>
                  {x[1]}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Data e hora"
            type="datetime-local"
            value={form.ocorridoEm}
            onChange={(v) => setForm({ ...form, ocorridoEm: v })}
            required
          />
          <button className="btn primary" disabled={busy}>
            Registrar
          </button>
        </form>
      </div>
      <section className="panel table-panel">
        <div className="panel-title">
          <h3>Últimas marcações</h3>
        </div>
        {rows.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>FUNCIONÁRIO</th>
                  <th>EVENTO</th>
                  <th>DATA E HORA</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.id}>
                    <td>{x.funcionario.nome}</td>
                    <td>
                      <span className="tag blue-tag">{x.tipo.replaceAll('_', ' ')}</span>
                    </td>
                    <td>{new Date(x.ocorridoEm).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>Nenhuma marcação</Empty>
        )}
      </section>
    </>
  );
}
