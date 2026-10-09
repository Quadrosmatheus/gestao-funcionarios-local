import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Actions, Empty, Error, Field, Heading, Modal } from '../components/ui';

const catalogConfig = {
  departments: {
    path: 'departments',
    fields: [
      ['nome', 'Nome', true],
      ['descricao', 'Descrição', false],
    ],
  },
  roles: {
    path: 'roles',
    fields: [
      ['nome', 'Nome', true],
      ['descricao', 'Descrição', false],
    ],
  },
  schedules: {
    path: 'schedules',
    fields: [
      ['nome', 'Nome', true],
      ['entrada', 'Entrada', 'time'],
      ['saida', 'Saída', 'time'],
      ['pausaInicio', 'Pausa começa', 'time'],
      ['pausaFim', 'Pausa termina', 'time'],
      ['descricao', 'Descrição', false],
    ],
  },
};

export function CatalogPage({ kind, title, singular }) {
  const cfg = catalogConfig[kind],
    [rows, setRows] = useState([]),
    [form, setForm] = useState(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      setRows(await api(`/${cfg.path}`));
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, [kind]);
  function blank() {
    const x = { nome: '', descricao: '' };
    if (kind === 'schedules')
      Object.assign(x, {
        entrada: '09:00',
        saida: '18:00',
        pausaInicio: '12:00',
        pausaFim: '13:00',
      });
    return x;
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api(`/${cfg.path}${form.id ? `/${form.id}` : ''}`, {
        method: form.id ? 'PATCH' : 'POST',
        body: JSON.stringify(form),
      });
      setForm(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function deactivate(x) {
    if (!confirm(`Desativar ${x.nome}?`)) return;
    try {
      await api(`/${cfg.path}/${x.id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <>
      <Heading
        title={title}
        sub={`Cadastre e organize ${kind === 'schedules' ? 'os horários de trabalho' : 'a estrutura da equipe'}.`}
        action={
          <button className="btn primary" onClick={() => setForm(blank())}>
            ＋ Novo {singular}
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
                  <th>NOME</th>
                  {kind === 'schedules' && (
                    <>
                      <th>ENTRADA</th>
                      <th>SAÍDA</th>
                      <th>PAUSA</th>
                    </>
                  )}
                  <th>DESCRIÇÃO</th>
                  <th>STATUS</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.id}>
                    <td>
                      <strong>{x.nome}</strong>
                    </td>
                    {kind === 'schedules' && (
                      <>
                        <td>{x.entrada}</td>
                        <td>{x.saida}</td>
                        <td>
                          {x.pausaInicio && x.pausaFim ? `${x.pausaInicio}–${x.pausaFim}` : '—'}
                        </td>
                      </>
                    )}
                    <td>{x.descricao || '—'}</td>
                    <td>
                      <span className={`tag ${x.ativo ? 'green-tag' : 'gray-tag'}`}>
                        {x.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" onClick={() => setForm({ ...x })}>
                          ✎
                        </button>
                        {x.ativo && (
                          <button className="icon-btn danger-text" onClick={() => deactivate(x)}>
                            ⌑
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>Nenhum {singular} cadastrado</Empty>
        )}
      </section>
      {form && (
        <Modal title={`${form.id ? 'Editar' : 'Novo'} ${singular}`} onClose={() => setForm(null)}>
          <form className="form-grid" onSubmit={save}>
            {cfg.fields.map(([key, label, type]) => (
              <Field
                key={key}
                label={label}
                type={typeof type === 'string' ? type : 'text'}
                value={form[key] || ''}
                onChange={(v) => setForm({ ...form, [key]: v })}
                required={type === true}
              />
            ))}
            <Actions onCancel={() => setForm(null)} busy={busy} />
          </form>
        </Modal>
      )}
    </>
  );
}
