import { useState } from 'react';
import { api } from '../services/api';
import { Actions, Error, Field, Modal } from '../components/ui';

export function PasswordChange({ onClose, onChanged }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function save(event) {
    event.preventDefault();
    setError('');
    if (form.newPassword !== form.confirmPassword) {
      setError('A confirmação não corresponde à nova senha.');
      return;
    }
    setBusy(true);
    try {
      const result = await api('/auth/password', {
        method: 'PATCH',
        body: JSON.stringify(form),
      });
      sessionStorage.setItem('rh_token', result.token);
      onChanged(result.user);
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Alterar senha" onClose={onClose}>
      <Error text={error} />
      <form className="form-grid" onSubmit={save}>
        <Field
          label="Senha atual"
          type="password"
          value={form.currentPassword}
          onChange={(value) => setForm({ ...form, currentPassword: value })}
          required
        />
        <Field
          label="Nova senha · mínimo 12 caracteres"
          type="password"
          value={form.newPassword}
          onChange={(value) => setForm({ ...form, newPassword: value })}
          required
        />
        <Field
          label="Confirme a nova senha"
          type="password"
          value={form.confirmPassword}
          onChange={(value) => setForm({ ...form, confirmPassword: value })}
          required
        />
        <Actions onCancel={onClose} busy={busy} />
      </form>
    </Modal>
  );
}
