import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listSubmissions, deleteSubmission, generatePdfBlob, getQuestions } from '../../api.js';
import { downloadBlob } from '../../lib/downloadBlob.js';
import { rankedLabels } from '../../../shared/testimony.js';

export default function Submissions() {
  const [subs, setSubs] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  function refresh() {
    listSubmissions()
      .then(setSubs)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    refresh();
    getQuestions().then(setQuestions);
  }, []);

  async function handleDownload(sub) {
    setBusyId(sub.id);
    try {
      const blob = await generatePdfBlob({ mode: 'personal', submissionId: sub.id });
      downloadBlob(blob, `testimony-${sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId('');
    }
  }

  async function handleDelete(sub) {
    if (!window.confirm(`Delete ${sub.name}'s submission? This can't be undone.`)) return;
    await deleteSubmission(sub.id);
    refresh();
  }

  if (error) return <div className="banner banner--error">{error}</div>;
  if (!subs || !questions) return <p>Loading…</p>;

  return (
    <div>
      <h1>Submissions</h1>
      {subs.length === 0 ? (
        <p>No one has taken the survey yet. Share the link from the Dashboard.</p>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Meeting</th>
                <th>Top value</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link to={`/admin/submissions/${s.id}`}>{s.name}</Link>
                  </td>
                  <td>{s.meeting || '—'}</td>
                  <td>{s.ranking && s.ranking.length ? rankedLabels(s, questions)[0] : '—'}</td>
                  <td>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn--secondary btn--small" onClick={() => handleDownload(s)} disabled={busyId === s.id}>
                        {busyId === s.id ? 'Building…' : 'PDF'}
                      </button>
                      <button className="btn btn--outline btn--small" onClick={() => handleDelete(s)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
