import { useState } from 'react';
import { Error } from '../components/ui';

export function Welcome({ onLogin, onCreateAccount, demoMode }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function enter() {
    setBusy(true);
    setError('');
    try {
      await onLogin();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="welcome-page">
      <header className="welcome-topbar">
        <div className="brand brand-login">
          <span className="brand-icon">g</span>
          <span>
            gestão<span className="brand-light">.local</span>
            <small>PESSOAS & ROTINA</small>
          </span>
        </div>
        <span className="welcome-local">● PRIVADO POR PADRÃO · EXECUTADO LOCALMENTE</span>
      </header>
      <section className="welcome-hero">
        <div className="welcome-copy">
          <div className="spark">✳</div>
          <span className="eyebrow">UM ESPAÇO PARA CUIDAR DE QUEM FAZ</span>
          <h1>
            O trabalho flui
            <br />
            quando as pessoas
            <br />
            <em>estão bem.</em>
          </h1>
          <p>
            Organize a equipe, acompanhe a rotina e tenha uma visão clara da operação — em um só
            lugar.
          </p>
          <div className="welcome-actions">
            <button className="btn primary" onClick={enter} disabled={busy}>
              {busy ? 'Abrindo painel…' : demoMode ? 'Entrar no painel' : 'Entrar no sistema'}{' '}
              <span>→</span>
            </button>
            <button className="btn welcome-secondary" onClick={onCreateAccount}>
              Criar conta
            </button>
          </div>
          <Error text={error} />
          <div className="secure-note">▣ Acesso protegido · Dados guardados neste computador</div>
        </div>
        <div className="welcome-visual" aria-label="Resumo das ferramentas de gestão">
          <div className="welcome-orbit orbit-one" />
          <div className="welcome-orbit orbit-two" />
          <div className="welcome-card welcome-card-main">
            <span className="welcome-card-label">VISÃO GERAL</span>
            <strong>Sua equipe, em equilíbrio.</strong>
            <div className="welcome-stats">
              <div>
                <b>♙</b>
                <span>Pessoas</span>
              </div>
              <div>
                <b>◷</b>
                <span>Rotina</span>
              </div>
              <div>
                <b>▤</b>
                <span>Relatórios</span>
              </div>
            </div>
            <div className="welcome-progress">
              <i />
            </div>
            <small>Informações organizadas para decisões melhores</small>
          </div>
          <div className="welcome-float float-top">
            ✳ <span>Equipe em foco</span>
          </div>
          <div className="welcome-float float-bottom">
            ✓ <span>Rotina mais simples</span>
          </div>
        </div>
      </section>
      <footer className="welcome-footer">
        <span>GESTÃO DE PESSOAS, SEM COMPLICAÇÃO</span>
        <span>Aplicação local · Seus dados permanecem no seu computador</span>
      </footer>
    </main>
  );
}
