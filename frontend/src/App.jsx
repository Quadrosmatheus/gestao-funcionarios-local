import { useEffect, useState } from 'react';
import { groups, titleFor } from './constants/navigation';
import { Attendance } from './pages/Attendance';
import { Audit } from './pages/Audit';
import { CatalogPage } from './pages/CatalogPage';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { Leaves } from './pages/Leaves';
import { Login } from './pages/Login';
import { Welcome } from './pages/Welcome';
import { CreateAccount } from './pages/CreateAccount';
import { Reports } from './pages/Reports';
import { PasswordChange } from './pages/PasswordChange';
import { Users } from './pages/Users';
import { api } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [boot, setBoot] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [publicPage, setPublicPage] = useState('welcome');
  const [theme, setTheme] = useState(() => localStorage.getItem('gestao-theme') || 'light');
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('gestao-theme', theme);
  }, [theme]);

  useEffect(() => {
    const token = sessionStorage.getItem('rh_token');
    const status = api('/auth/register/status').catch(() => ({ demo: false }));
    const currentUser = token
      ? api('/auth/me').catch(() => {
          sessionStorage.removeItem('rh_token');
          return null;
        })
      : Promise.resolve(null);
    Promise.all([status, currentUser])
      .then(([authStatus, sessionUser]) => {
        setDemoMode(authStatus.demo === true);
        setUser(sessionUser);
      })
      .finally(() => setBoot(false));
  }, []);

  async function login(email, senha) {
    const result = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    sessionStorage.setItem('rh_token', result.token);
    setUser(result.user);
  }

  async function register(nome, email, senha) {
    const result = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha }),
    });
    sessionStorage.setItem('rh_token', result.token);
    setUser(result.user);
  }

  async function enterDemo() {
    const result = await api('/auth/demo', { method: 'POST', body: JSON.stringify({}) });
    sessionStorage.setItem('rh_token', result.token);
    setUser(result.user);
  }

  function logout() {
    sessionStorage.removeItem('rh_token');
    setUser(null);
  }

  if (boot) return <div className="loading">Abrindo seu espaço de gestão…</div>;
  if (!user) {
    return (
      <div className="public-app" data-theme={theme}>
        <button
          className="theme-toggle"
          type="button"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          aria-label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
        >
          {theme === 'light' ? '☾ Tema escuro' : '☀ Tema claro'}
        </button>
        {publicPage === 'welcome' && (
          <Welcome
            onLogin={() => (demoMode ? enterDemo() : setPublicPage('login'))}
            onCreateAccount={() => setPublicPage('register')}
            demoMode={demoMode}
          />
        )}
        {publicPage === 'login' && (
          <Login
            onLogin={login}
            demoMode={demoMode}
            onEnterDemo={enterDemo}
            onBack={() => setPublicPage('welcome')}
            onCreateAccount={() => setPublicPage('register')}
          />
        )}
        {publicPage === 'register' && (
          <CreateAccount
            onRegister={register}
            onBack={() => setPublicPage('welcome')}
            onLogin={() => setPublicPage('login')}
          />
        )}
      </div>
    );
  }

  const pages = {
    dashboard: <Dashboard go={setPage} />,
    employees: <Employees />,
    departments: <CatalogPage kind="departments" title="Departamentos" singular="departamento" />,
    roles: <CatalogPage kind="roles" title="Cargos" singular="cargo" />,
    schedules: <CatalogPage kind="schedules" title="Jornadas" singular="jornada" />,
    attendance: <Attendance />,
    leaves: <Leaves />,
    users: <Users current={user} />,
    reports: <Reports />,
    audit: <Audit />,
  };

  return (
    <div className="shell" data-theme={theme}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">g</span>
          <span>
            gestão<span className="brand-light">.local</span>
            <small>PESSOAS & ROTINA</small>
          </span>
        </div>
        <nav className="nav-scroll" aria-label="Navegação principal">
          {groups
            .filter((group) => group[0] !== 'GESTÃO' || user.funcao === 'ADMIN')
            .map(([groupName, items]) => (
              <div className="nav-group" key={groupName}>
                <p>{groupName}</p>
                {items.map(([key, label, icon]) => (
                  <button
                    key={key}
                    className={`nav-item ${page === key ? 'selected' : ''}`}
                    aria-current={page === key ? 'page' : undefined}
                    onClick={() => setPage(key)}
                  >
                    <span>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="local-badge">
            <i /> Dados armazenados neste computador
          </div>
          <div className="user-mini">
            <div className="avatar">{user.nome[0]?.toUpperCase()}</div>
            <div className="user-info">
              <strong>{user.nome}</strong>
              <small>{user.funcao === 'ADMIN' ? 'Administrador' : 'RH'}</small>
            </div>
            <button className="text-btn" onClick={() => setShowPassword(true)}>
              Senha
            </button>
            <button className="icon-btn" title="Sair" onClick={logout}>
              ↗
            </button>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">GESTÃO DE PESSOAS</span>
            <h1>{titleFor[page]}</h1>
          </div>
          <div className="top-actions">
            <button
              className="theme-toggle-panel"
              type="button"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
            >
              {theme === 'light' ? '☾ Modo escuro' : '☀ Modo claro'}
            </button>
            <span className="local-chip">● Ambiente local</span>
            <span className="date-chip">
              {new Intl.DateTimeFormat('pt-BR', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }).format(new Date())}
            </span>
          </div>
        </header>
        <div className="content">{pages[page] || pages.dashboard}</div>
        <footer className="app-footer">
          Gestão local · Dados pessoais ficam no banco deste computador
        </footer>
      </main>
      {showPassword && (
        <PasswordChange
          onClose={() => setShowPassword(false)}
          onChanged={(updatedUser) => setUser(updatedUser)}
        />
      )}
    </div>
  );
}

export default App;
