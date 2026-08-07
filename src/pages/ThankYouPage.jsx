import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubmission, generatePdfBlob, isDemoMode } from '../api.js';

export default function ThankYouPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getSubmission(id)
      .then(setSubmission)
      .catch((e) => setError(e.message || 'We could not find that submission.'));
  }, [id]);

  async function handleDownload() {
    setDownloading(true);
    setError('');
    try {
      const blob = await generatePdfBlob({ mode: 'personal', submissionId: id });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `testimony-${(submission?.name || 'brochure').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message || 'Could not generate the PDF.');
    } finally {
      setDownloading(false);
    }
  }

  if (error) {
    return (
      <div className="page">
        <div className="banner banner--error">{error}</div>
        <Link to="/">Back to the survey</Link>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="page">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="page">
      {isDemoMode() && (
        <div className="banner no-print">
          Demo mode — this brochure was generated entirely in your browser, no server involved.
        </div>
      )}
      <h1>Thank you, {submission.name}.</h1>
      <p>Here's a preview of your testimony. Your meeting's admin may lightly edit this before it's printed for outreach.</p>
      <div className="card">
        <p style={{ fontStyle: 'italic' }}>“{submission.testimonyText}”</p>
      </div>
      <div className="btn-row">
        <button className="btn" onClick={handleDownload} disabled={downloading}>
          {downloading ? 'Building your PDF…' : 'Download My Tri-Fold Brochure (PDF)'}
        </button>
      </div>
      <p className="hint" style={{ marginTop: 24, color: '#777' }}>
        Bookmark this page to come back and download your brochure again later.
      </p>
    </div>
  );
}
