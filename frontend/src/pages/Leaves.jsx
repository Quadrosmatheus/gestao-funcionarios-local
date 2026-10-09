import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Actions, Empty, Error, Field, Heading, Modal, Select } from '../components/ui';

export function Leaves() {
  const [rows, setRows] = useState([]),
    [people, setPeople] = useState([]),
    [form, setForm] = useState(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      const [l, e] = await Promise.all([api('/leaves'), api('/employees?ativo=true')]);
      setRows(l);
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
      await api('/leaves', { method: 'POST', body: JSON.stringify(form) });
      setForm(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function status(x, s) {
    try {
      await api(`/leaves/${x.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: s }) });
      load();
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <>
      <Heading
        title="Férias e ausências"
        sub="Registre períodos e acompanhe as solicitações."
        action={
          <button
            className="btn primary"
            onClick={() =>
              setForm({ funcionarioId: '', tipo: 'FERIAS', inicio: '', fim: '', motivo: '' })
            }
          >
            ＋ Nova solicitação
          </button>
        }
      />
      <Error text={error} />
      <section className="panel table-panel">
        {rows.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>FUNCIONÁRIO</th>
                  <th>TIPO</th>
                  <th>PERÍODO</th>
                  <th>MOTIVO</th>
                  <th>STATUS</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.id}>
                    <td>{x.funcionario.nome}</td>
                    <td>{x.tipo}</td>
                    <td>
                      {new Date(x.inicio).toLocaleDateString('pt-BR')} –{' '}
                      {new Date(x.fim).toLocaleDateString('pt-BR')}
                    </td>
                    <td>{x.motivo || '—'}</td>
                    <td>
                      <span
                        className={`tag ${x.status === 'APROVADA' ? 'green-tag' : x.status === 'REJEITADA' ? 'rose-tag' : 'amber-tag'}`}
                      >
                        {x.status}
                      </span>
                    </td>
                    <td>
                      {x.status === 'PENDENTE' && (
                        <div className="row-actions">
                          <button className="text-btn" onClick={() => status(x, 'APROVADA')}>
                            Aprovar
                          </button>
                          <button
                            className="text-btn danger-text"
                            onClick={() => status(x, 'REJEITADA')}
                          >
                            Recusar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>Nenhuma solicitação cadastrada</Empty>
        )}
      </section>
      {form && (
        <Modal title="Nova solicitação" onClose={() => setForm(null)}>
          <form className="form-grid" onSubmit={save}>
            <Select
              label="Funcionário"
              value={form.funcionarioId}
              options={people}
              onChange={(v) => setForm({ ...form, funcionarioId: v })}
              required
            />
            <label className="field">
              <span>Tipo</span>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              >
                {[
                  ['FERIAS', 'Férias'],
                  ['ATESTADO', 'Atestado'],
                  ['FALTA', 'Falta'],
                  ['LICENCA', 'Licença'],
                  ['OUTRO', 'Outro'],
                ].map((x) => (
                  <option value={x[0]} key={x[0]}>
                    {x[1]}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Início"
              type="date"
              value={form.inicio}
              onChange={(v) => setForm({ ...form, inicio: v })}
              required
            />
            <Field
              label="Fim"
              type="date"
              value={form.fim}
              onChange={(v) => setForm({ ...form, fim: v })}
              required
            />
            <Field
              label="Observação"
              value={form.motivo}
              onChange={(v) => setForm({ ...form, motivo: v })}
            />
            <Actions onCancel={() => setForm(null)} busy={busy} />
          </form>
        </Modal>
      )}
    </>
  );
}
