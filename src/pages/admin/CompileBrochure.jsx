import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listSubmissions, listBrochures, saveBrochure, deleteBrochure, generatePdfBlob } from '../../api.js';
import { downloadBlob } from '../../lib/downloadBlob.js';

export default function CompileBrochure() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subs, setSubs] = useState(null);
  const [brochures, setBrochures] = useState(null);
  const [title, setTitle] = useState('');
  const [selected, setSelected] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    listSubmissions().then(setSubs);
    refreshBrochures();
  }, []);

  useEffect(() => {
    if (!id || !brochures) return;
    const b = brochures.find((x) => x.id === id);
    if (b) {
      setTitle(b.title || '');
      setSelected(b.submissionIds || []);
    }
  }, [id, brochures]);

  function refreshBrochures() {
    listBrochures().then(setBrochures);
  }

  function toggle(subId) {
    setSelected((prev) => {
      if (prev.includes(subId)) return prev.filter((x) => x !== subId);
      if (prev.length >= 3) return prev; // inside panels only fit 3 testimonies
      return [...prev, subId];
    });
  }

  async function handleSave() {
    setStatus('saving');
    setError('');
    try {
      const saved = await saveBrochure({ id, title, submissionIds: selected });
      setStatus('saved');
      refreshBrochures();
      if (!id) navigate(`/admin/compile/${saved.id}`, { replace: true });
      setTimeout(() => setStatus(''), 2000);
    } catch (e) {
      setError(e.message);
      setStatus('');
    }
  }

  async function handleDownload() {
    if (!id) return;
    setDownloading(true);
    try {
      const blob = await generatePdfBlob({ mode: 'compiled', brochureId: id });
      downloadBlob(blob, `brochure-${(title || 'compiled').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`);
    } catch (e) {
      setError(e.message);
    } finally {
      setDownloading(false);
    }
  }

  async function handleDelete(brochureId) {
    if (!window.confirm('Delete this compiled brochure?')) return;
    await deleteBrochure(brochureId);
    refreshBrochures();
    if (brochureId === id) navigate('/admin/compile');
  }

  if (!subs || !brochures) return <p>Loading…</p>;

  return (
    <div>
      <h1>Compile a Brochure</h1>
      <p>Combine up to 3 members' testimonies into one shared brochure for outreach.</p>

      {!id && brochures.length > 0 && (
        <div className="card">
          <h3>Existing compiled brochures</h3>
          <ul>
            {brochures.map((b) => (
              <li key={b.id} style={{ marginBottom: 8 }}>
                <Link to={`/admin/compile/${b.id}`}>{b.title || '(untitled)'}</Link>{' '}
                <button className="btn btn--outline btn--small" onClick={() => handleDelete(b.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <div className="field">
          <label>Brochure title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Testimonies from Our Meeting" />
        </div>

        <div className="field">
          <label>Choose up to 3 testimonies ({selected.length}/3 selected)</label>
          {subs.length === 0 && <p>No submissions yet.</p>}
          {subs.map((s) => (
            <div className="checkbox-row" key={s.id}>
              <input
                type="checkbox"
                id={`pick-${s.id}`}
                checked={selected.includes(s.id)}
                disabled={!selected.includes(s.id) && selected.length >= 3}
                onChange={() => toggle(s.id)}
              />
              <label htmlFor={`pick-${s.id}`} style={{ marginBottom: 0, fontWeight: 400 }}>
                {s.name} {s.meeting ? `(${s.meeting})` : ''} — “{(s.testimonyText || '').slice(0, 60)}…”
              </label>
            </div>
          ))}
        </div>

        {error && <div className="banner banner--error">{error}</div>}

        <div className="btn-row">
          <button className="btn" onClick={handleSave} disabled={status === 'saving' || selected.length === 0}>
            {status === 'saving' ? 'Saving…' : id ? 'Save Changes' : 'Create Brochure'}
          </button>
          {status === 'saved' && <span className="badge">Saved</span>}
          {id && (
            <button className="btn btn--secondary" onClick={handleDownload} disabled={downloading}>
              {downloading ? 'Building…' : 'Download PDF'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
