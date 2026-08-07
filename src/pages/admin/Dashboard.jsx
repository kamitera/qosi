import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listSubmissions, listBrochures } from '../../api.js';

export default function Dashboard() {
  const [count, setCount] = useState(null);
  const [brochureCount, setBrochureCount] = useState(null);
  const [copied, setCopied] = useState(false);
  const surveyUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : '';

  useEffect(() => {
    listSubmissions().then((s) => setCount(s.length));
    listBrochures().then((b) => setBrochureCount(b.length));
  }, []);

  function copyLink() {
    navigator.clipboard?.writeText(surveyUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="card">
        <h3>Share the survey</h3>
        <p>Send this link to members so they can take the survey and get their own brochure:</p>
        <div className="btn-row">
          <input type="text" readOnly value={surveyUrl} style={{ flex: 1, minWidth: 200 }} />
          <button className="btn btn--secondary" onClick={copyLink}>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      <div className="btn-row" style={{ alignItems: 'stretch' }}>
        <Link to="/admin/submissions" className="card" style={{ flex: 1, minWidth: 200, textDecoration: 'none', color: 'inherit' }}>
          <h3>Submissions</h3>
          <p>{count === null ? '…' : count} member response{count === 1 ? '' : 's'} so far.</p>
        </Link>
        <Link to="/admin/compile" className="card" style={{ flex: 1, minWidth: 200, textDecoration: 'none', color: 'inherit' }}>
          <h3>Compiled Brochures</h3>
          <p>{brochureCount === null ? '…' : brochureCount} combined brochure{brochureCount === 1 ? '' : 's'} built.</p>
        </Link>
      </div>

      <div className="btn-row" style={{ alignItems: 'stretch', marginTop: 16 }}>
        <Link to="/admin/questions" className="card" style={{ flex: 1, minWidth: 200, textDecoration: 'none', color: 'inherit' }}>
          <h3>Survey Questions</h3>
          <p>Edit what the survey asks members.</p>
        </Link>
        <Link to="/admin/template" className="card" style={{ flex: 1, minWidth: 200, textDecoration: 'none', color: 'inherit' }}>
          <h3>Brochure Template</h3>
          <p>Edit the logo, colors, and fixed text on every brochure.</p>
        </Link>
      </div>
    </div>
  );
}
