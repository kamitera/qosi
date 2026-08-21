import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { loginAdmin, logoutAdmin, isAdminLoggedIn } from '../../adminAuth.js';
import { ensureBackendChecked, isDemoMode } from '../../api.js';
import Dashboard from './Dashboard.jsx';
import QuestionsEditor from './QuestionsEditor.jsx';
import TemplateEditor from './TemplateEditor.jsx';
import Submissions from './Submissions.jsx';
import SubmissionDetail from './SubmissionDetail.jsx';
import CompileBrochure from './CompileBrochure.jsx';

function LoginScreen({ onLoggedIn }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await loginAdmin(password);
      onLoggedIn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <h1>Admin sign-in</h1>
      <p>Enter the admin password to edit the survey, brochure, and review submissions.</p>
      <form className="card" onSubmit={handleSubmit} style={{ maxWidth: 360 }}>
        <div className="field">
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        {error && <div className="banner banner--error">{error}</div>}
        <button className="btn" type="submit" disabled={busy || !password}>
          {busy ? 'Checking…' : 'Log In'}
        </button>
      </form>
      <p className="hint" style={{ marginTop: 20, color: '#777' }}>
        This site's admin password isn't set up yet? See the README's "Set an admin password" step — it's a
        `ADMIN_PASSWORD` environment variable in Netlify.
      </p>
    </div>
  );
}

export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(isAdminLoggedIn());
  const [checkedBackend, setCheckedBackend] = useState(false);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    ensureBackendChecked().then((d) => {
      setDemo(d);
      setCheckedBackend(true);
    });
  }, []);

  if (!checkedBackend) {
    return (
      <div className="page">
        <p>Loading…</p>
      </div>
    );
  }

  const signedIn = demo || loggedIn;

  if (!signedIn) {
    return <LoginScreen onLoggedIn={() => setLoggedIn(true)} />;
  }

  function handleLogout() {
    logoutAdmin();
    setLoggedIn(false);
  }

  return (
    <div>
      <div className="topbar no-print">
        <strong>Testimony Brochure — Admin</strong>
        <nav>
          <NavLink to="/admin" end>
            Dashboard
          </NavLink>
          <NavLink to="/admin/questions">Survey Questions</NavLink>
          <NavLink to="/admin/template">Brochure Template</NavLink>
          <NavLink to="/admin/submissions">Submissions</NavLink>
          <NavLink to="/admin/compile">Compile Brochure</NavLink>
        </nav>
        <div>
          {demo ? (
            <span className="badge">Demo mode</span>
          ) : (
            <button className="btn btn--outline btn--small" onClick={handleLogout}>
              Log Out
            </button>
          )}
        </div>
      </div>
      <div className="page page--wide">
        {demo && (
          <div className="banner no-print">
            Demo mode — no backend connected, so admin sign-in is skipped and everything here saves to this
            browser only.
          </div>
        )}
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="questions" element={<QuestionsEditor />} />
          <Route path="template" element={<TemplateEditor />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="submissions/:id" element={<SubmissionDetail />} />
          <Route path="compile" element={<CompileBrochure />} />
          <Route path="compile/:id" element={<CompileBrochure />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
}
