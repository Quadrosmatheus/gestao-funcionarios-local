import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Actions, Empty, Error, Field, Heading, Modal } from '../components/ui';

export function Users({ current }) {
  const [rows, setRows] = useState([]),
    [form, setForm] = useState(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      setRows(await api('/users'));
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
      await api('/users', { method: 'POST', body: JSON.stringify(form) });
      setForm(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function toggle(x) {
    try {
      await api(`/users/${x.id}`, { method: 'PATCH', body: JSON.stringify({ ativo: !x.ativo }) });
      load();
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <>
      <Heading
        title="Acessos ao sistema"
        sub="Contas administrativas; conceda acesso apenas a pessoas autorizadas."
        action={
          <button
            className="btn primary"
            onClick={() => setForm({ nome: '', email: '', senha: '', funcao: 'RH' })}
          >
            ＋ Novo acesso
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
                  <th>PESSOA</th>
                  <th>PERFIL</th>
                  <th>STATUS</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.id}>
                    <td>
                      <strong>{x.nome}</strong>
                      <small className="block">{x.email}</small>
                    </td>
                    <td>{x.funcao === 'ADMIN' ? 'Administrador' : 'RH'}</td>
                    <td>{x.ativo ? 'Ativo' : 'Inativo'}</td>
                    <td>
                      {x.id !== current.id && (
                        <button className="text-btn danger-text" onClick={() => toggle(x)}>
                          {x.ativo ? 'Desativar' : 'Reativar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>Carregando acessos…</Empty>
        )}
      </section>
      {form && (
        <Modal title="Criar acesso" onClose={() => setForm(null)}>
          <form className="form-grid" onSubmit={save}>
            <Field
              label="Nome"
              value={form.nome}
              onChange={(v) => setForm({ ...form, nome: v })}
              required
            />
            <Field
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              required
            />
            <Field
              label="Senha inicial · mínimo 12 caracteres"
              type="password"
              value={form.senha}
              onChange={(v) => setForm({ ...form, senha: v })}
              required
            />
            <label className="field">
              <span>Perfil</span>
              <select
                value={form.funcao}
                onChange={(e) => setForm({ ...form, funcao: e.target.value })}
              >
                <option value="RH">RH</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </label>
            <Actions onCancel={() => setForm(null)} busy={busy} />
          </form>
        </Modal>
      )}
    </>
  );
}
