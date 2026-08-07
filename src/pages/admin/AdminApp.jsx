import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { getCurrentUser, openLogin, logout, onAuthChange } from '../../identity.js';
import { ensureBackendChecked, isDemoMode } from '../../api.js';
import Dashboard from './Dashboard.jsx';
import QuestionsEditor from './QuestionsEditor.jsx';
import TemplateEditor from './TemplateEditor.jsx';
import Submissions from './Submissions.jsx';
import SubmissionDetail from './SubmissionDetail.jsx';
import CompileBrochure from './CompileBrochure.jsx';

export default function AdminApp() {
  const [user, setUser] = useState(getCurrentUser());
  const [checkedBackend, setCheckedBackend] = useState(false);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    onAuthChange(() => setUser(getCurrentUser()));
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

  const signedIn = demo || !!user;

  if (!signedIn) {
    return (
      <div className="page">
        <h1>Admin sign-in</h1>
        <p>Sign in with your invited admin account to edit the survey, brochure, and review submissions.</p>
        <button className="btn" onClick={openLogin}>
          Log In
        </button>
        <p className="hint" style={{ marginTop: 20, color: '#777' }}>
          Not seeing a login box? This site's Netlify Identity may not be enabled yet — see the README's
          "Turn on Identity" step.
        </p>
      </div>
    );
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
            <button className="btn btn--outline btn--small" onClick={logout}>
              {user?.user_metadata?.full_name || user?.email} — Log Out
            </button>
          )}
        </div>
      </div>
      <div className="page page--wide">
        {demo && (
          <div className="banner no-print">
            Demo mode — no backend connected, so admin sign-in is skipped and everything here saves to this
            browser only. Deploy to Netlify and turn on Identity to require real admin logins.
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
