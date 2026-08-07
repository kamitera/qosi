import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSubmission, updateSubmission, deleteSubmission, generatePdfBlob, getQuestions } from '../../api.js';
import { downloadBlob } from '../../lib/downloadBlob.js';
import { rankedLabels } from '../../../shared/testimony.js';
import PhotoPicker from '../../components/PhotoPicker.jsx';

export default function SubmissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sub, setSub] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getSubmission(id)
      .then(setSub)
      .catch((e) => setError(e.message));
    getQuestions().then(setQuestions);
  }, [id]);

  if (error) return <div className="banner banner--error">{error}</div>;
  if (!sub || !questions) return <p>Loading…</p>;

  function set(field, value) {
    setSub((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setStatus('saving');
    try {
      await updateSubmission(id, { name: sub.name, meeting: sub.meeting, testimonyText: sub.testimonyText, photo: sub.photo || null });
      setStatus('saved');
      setTimeout(() => setStatus(''), 2000);
    } catch (e) {
      setStatus('error: ' + e.message);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await generatePdfBlob({ mode: 'personal', submissionId: id });
      downloadBlob(blob, `testimony-${sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`);
    } catch (e) {
      setError(e.message);
    } finally {
      setDownloading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete ${sub.name}'s submission? This can't be undone.`)) return;
    await deleteSubmission(id);
    navigate('/admin/submissions');
  }

  return (
    <div>
      <p>
        <Link to="/admin/submissions">← All submissions</Link>
      </p>
      <h1>{sub.name}</h1>

      <div className="card">
        <div className="field">
          <label>Name</label>
          <input type="text" value={sub.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div className="field">
          <label>Meeting</label>
          <input type="text" value={sub.meeting} onChange={(e) => set('meeting', e.target.value)} />
        </div>
        <div className="field">
          <label>Their ranking</label>
          <p>{rankedLabels(sub, questions).join(', ') || '—'}</p>
        </div>
        <div className="field">
          <label>Testimony text (edit before printing)</label>
          <textarea rows={6} value={sub.testimonyText} onChange={(e) => set('testimonyText', e.target.value)} />
          <span className="hint">This is what appears in the center inside panel of their brochure.</span>
        </div>
        <div className="field">
          <label>Photo</label>
          <PhotoPicker value={sub.photo || null} onChange={(photo) => set('photo', photo)} />
        </div>
        <div className="btn-row">
          <button className="btn" onClick={handleSave} disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving…' : 'Save Changes'}
          </button>
          {status === 'saved' && <span className="badge">Saved</span>}
        </div>
        {status.startsWith('error') && <div className="banner banner--error">{status}</div>}
      </div>

      <div className="btn-row">
        <button className="btn btn--secondary" onClick={handleDownload} disabled={downloading}>
          {downloading ? 'Building…' : 'Download Their Brochure (PDF)'}
        </button>
        <button className="btn btn--danger" onClick={handleDelete}>
          Delete Submission
        </button>
      </div>
    </div>
  );
}
