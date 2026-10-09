import { useEffect, useState } from 'react';
import { api, localDate } from '../services/api';
import { Actions, Empty, Error, Field, Heading, Modal, Select } from '../components/ui';

export function Employees() {
  const [rows, setRows] = useState([]),
    [refs, setRefs] = useState({ departments: [], roles: [], schedules: [] }),
    [q, setQ] = useState(''),
    [inactive, setInactive] = useState(false),
    [form, setForm] = useState(null),
    [docs, setDocs] = useState(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      const [e, d, r, s] = await Promise.all([
        api(`/employees?q=${encodeURIComponent(q)}&ativo=${inactive ? 'false' : 'true'}`),
        api('/departments'),
        api('/roles'),
        api('/schedules'),
      ]);
      setRows(e);
      setRefs({
        departments: d.filter((x) => x.ativo),
        roles: r.filter((x) => x.ativo),
        schedules: s.filter((x) => x.ativo),
      });
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, [q, inactive]);
  function edit(x) {
    setError('');
    setForm(
      x
        ? {
            ...x,
            dataNascimento: x.dataNascimento?.slice(0, 10) || '',
            admissaoEm: x.admissaoEm?.slice(0, 10) || localDate(),
          }
        : {
            nome: '',
            email: '',
            cpf: '',
            telefone: '',
            dataNascimento: '',
            admissaoEm: localDate(),
            cargoId: '',
            departamentoId: '',
            horarioId: '',
          },
    );
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api(`/employees${form.id ? `/${form.id}` : ''}`, {
        method: form.id ? 'PATCH' : 'POST',
        body: JSON.stringify({
          ...form,
          cargoId: form.cargoId || null,
          departamentoId: form.departamentoId || null,
          horarioId: form.horarioId || null,
        }),
      });
      setForm(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function deactivate(x) {
    if (!confirm(`Desligar ${x.nome}? O histórico será mantido.`)) return;
    try {
      await api(`/employees/${x.id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <>
      <Heading
        title="Sua equipe"
        sub="Cadastros, vínculos e documentos em um só lugar."
        action={
          <button className="btn primary" onClick={() => edit(null)}>
            ＋ Novo funcionário
          </button>
        }
      />
      <Error text={error} />
      <div className="toolbar">
        <div className="search">
          <span>⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, e-mail ou CPF"
          />
        </div>
        <label className="check-label">
          <input
            type="checkbox"
            checked={inactive}
            onChange={(e) => setInactive(e.target.checked)}
          />{' '}
          Ver desligados
        </label>
      </div>
      <section className="panel table-panel">
        {rows.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>PESSOA</th>
                  <th>CARGO</th>
                  <th>DEPARTAMENTO</th>
                  <th>JORNADA</th>
                  <th>STATUS</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.id}>
                    <td>
                      <div className="person-cell">
                        <div className="avatar soft">{x.nome[0]}</div>
                        <div>
                          <strong>{x.nome}</strong>
                          <small>{x.email || 'Sem e-mail informado'}</small>
                        </div>
                      </div>
                    </td>
                    <td>{x.cargo?.nome || '—'}</td>
                    <td>{x.departamento?.nome || '—'}</td>
                    <td>{x.horario?.nome || '—'}</td>
                    <td>
                      <span className={`tag ${x.ativo ? 'green-tag' : 'gray-tag'}`}>
                        {x.ativo ? 'Ativo' : 'Desligado'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" title="Documentos" onClick={() => setDocs(x)}>
                          ▤
                        </button>
                        <button className="icon-btn" title="Editar" onClick={() => edit(x)}>
                          ✎
                        </button>
                        {x.ativo && (
                          <button
                            className="icon-btn danger-text"
                            title="Desligar"
                            onClick={() => deactivate(x)}
                          >
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
          <Empty>{q ? 'Nenhum resultado' : 'Nenhum funcionário cadastrado'}</Empty>
        )}
      </section>
      {form && (
        <Modal
          title={form.id ? 'Editar funcionário' : 'Adicionar funcionário'}
          onClose={() => setForm(null)}
        >
          <form className="form-grid" onSubmit={save}>
            <Field
              label="Nome completo"
              value={form.nome}
              onChange={(v) => setForm({ ...form, nome: v })}
              required
            />
            <Field
              label="E-mail"
              type="email"
              value={form.email || ''}
              onChange={(v) => setForm({ ...form, email: v })}
            />
            <Field
              label="CPF"
              value={form.cpf || ''}
              onChange={(v) => setForm({ ...form, cpf: v })}
            />
            <Field
              label="Telefone"
              value={form.telefone || ''}
              onChange={(v) => setForm({ ...form, telefone: v })}
            />
            <Field
              label="Nascimento"
              type="date"
              value={form.dataNascimento || ''}
              onChange={(v) => setForm({ ...form, dataNascimento: v })}
            />
            <Field
              label="Admissão"
              type="date"
              value={form.admissaoEm || ''}
              onChange={(v) => setForm({ ...form, admissaoEm: v })}
            />
            <Select
              label="Cargo"
              value={form.cargoId}
              options={refs.roles}
              onChange={(v) => setForm({ ...form, cargoId: v })}
            />
            <Select
              label="Departamento"
              value={form.departamentoId}
              options={refs.departments}
              onChange={(v) => setForm({ ...form, departamentoId: v })}
            />
            <Select
              label="Jornada"
              value={form.horarioId}
              options={refs.schedules}
              onChange={(v) => setForm({ ...form, horarioId: v })}
            />
            <Actions onCancel={() => setForm(null)} busy={busy} />
          </form>
        </Modal>
      )}
      {docs && <Documents employee={docs} onClose={() => setDocs(null)} />}
    </>
  );
}

export function Documents({ employee, onClose }) {
  const [rows, setRows] = useState([]),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      setRows(await api(`/employees/${employee.id}/documents`));
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, [employee.id]);
  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const body = new FormData();
    body.append('arquivo', file);
    try {
      await api(`/employees/${employee.id}/documents`, { method: 'POST', body });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }
  async function download(doc) {
    try {
      const r = await api(`/documents/${doc.id}/download`);
      const u = URL.createObjectURL(await r.blob());
      const a = document.createElement('a');
      a.href = u;
      a.download = doc.nomeOriginal;
      a.click();
      URL.revokeObjectURL(u);
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <Modal title={`Documentos · ${employee.nome}`} onClose={onClose}>
      <Error text={error} />
      <p className="privacy-help">Armazenamento local · PDF, JPG ou PNG · máximo 5 MB</p>
      <label className="upload-button">
        {busy ? 'Enviando…' : '＋ Enviar documento'}
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          onChange={upload}
          disabled={busy}
        />
      </label>
      {rows.length ? (
        <div className="document-list">
          {rows.map((d) => (
            <button key={d.id} onClick={() => download(d)}>
              <span>▤</span>
              <strong>{d.nomeOriginal}</strong>
              <small>{Math.ceil(d.tamanho / 1024)} KB</small>
            </button>
          ))}
        </div>
      ) : (
        <Empty>Nenhum documento anexado</Empty>
      )}
    </Modal>
  );
}
