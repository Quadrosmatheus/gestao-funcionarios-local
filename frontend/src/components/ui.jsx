export function Error({ text }) {
  return text ? <div className="alert error">{text}</div> : null;
}

export function Heading({ title, sub, action }) {
  return (
    <div className="page-heading">
      <div>
        <h2>{title}</h2>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  );
}

export function Empty({ children }) {
  return (
    <div className="empty">
      <span>◌</span>
      <strong>{children}</strong>
      <small>Os registros aparecerão aqui quando forem adicionados.</small>
    </div>
  );
}

export function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <label className="field">
      <span>
        {label}
        {required ? ' *' : ''}
      </span>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  );
}

export function Select({ label, value, options, onChange, required = false }) {
  return (
    <label className="field">
      <span>
        {label}
        {required ? ' *' : ''}
      </span>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)} required={required}>
        <option value="">Selecione…</option>
        {options.map((x) => (
          <option key={x.id} value={x.id}>
            {x.nome}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">GESTÃO DE PESSOAS</span>
            <h2>{title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Actions({ onCancel, busy }) {
  return (
    <div className="modal-actions">
      <button type="button" className="btn secondary" onClick={onCancel}>
        Cancelar
      </button>
      <button className="btn primary" disabled={busy}>
        {busy ? 'Salvando…' : 'Salvar'}
      </button>
    </div>
  );
}
