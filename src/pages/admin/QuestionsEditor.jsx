import React, { useEffect, useState } from 'react';
import { getQuestions, saveQuestions } from '../../api.js';
import { makeId } from '../../../shared/id.js';

export default function QuestionsEditor() {
  const [q, setQ] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    getQuestions().then(setQ);
  }, []);

  if (!q) return <p>Loading…</p>;

  function set(field, value) {
    setQ((prev) => ({ ...prev, [field]: value }));
  }

  function updateRankingItem(index, patch) {
    setQ((prev) => {
      const items = [...prev.rankingItems];
      items[index] = { ...items[index], ...patch };
      return { ...prev, rankingItems: items };
    });
  }

  function addRankingItem() {
    setQ((prev) => ({ ...prev, rankingItems: [...prev.rankingItems, { id: makeId('val_'), label: '', blurb: '' }] }));
  }

  function removeRankingItem(index) {
    setQ((prev) => ({ ...prev, rankingItems: prev.rankingItems.filter((_, i) => i !== index) }));
  }

  function updateFollowUp(index, patch) {
    setQ((prev) => {
      const items = [...prev.followUpQuestions];
      items[index] = { ...items[index], ...patch };
      return { ...prev, followUpQuestions: items };
    });
  }

  function addFollowUp() {
    setQ((prev) => ({
      ...prev,
      followUpQuestions: [...prev.followUpQuestions, { id: makeId('q_'), label: '', placeholder: '', required: false }],
    }));
  }

  function removeFollowUp(index) {
    setQ((prev) => ({ ...prev, followUpQuestions: prev.followUpQuestions.filter((_, i) => i !== index) }));
  }

  function updateRespondentField(index, patch) {
    setQ((prev) => {
      const items = [...prev.respondentFields];
      items[index] = { ...items[index], ...patch };
      return { ...prev, respondentFields: items };
    });
  }

  async function handleSave() {
    setStatus('saving');
    try {
      await saveQuestions(q);
      setStatus('saved');
      setTimeout(() => setStatus(''), 2000);
    } catch (e) {
      setStatus('error: ' + e.message);
    }
  }

  return (
    <div>
      <h1>Survey Questions</h1>
      <p>This controls what members see when they take the survey.</p>

      <div className="card">
        <h3>Introduction</h3>
        <div className="field">
          <label>Title</label>
          <input type="text" value={q.introTitle} onChange={(e) => set('introTitle', e.target.value)} />
        </div>
        <div className="field">
          <label>Intro text</label>
          <textarea value={q.introBody} onChange={(e) => set('introBody', e.target.value)} />
        </div>
        <div className="field">
          <label>Ranking step instructions</label>
          <input type="text" value={q.rankingPrompt} onChange={(e) => set('rankingPrompt', e.target.value)} />
        </div>
      </div>

      <div className="card">
        <h3>Who answers first (before ranking)</h3>
        {q.respondentFields.map((f, i) => (
          <div className="field" key={f.id}>
            <label>Field label</label>
            <input type="text" value={f.label} onChange={(e) => updateRespondentField(i, { label: e.target.value })} />
            <div className="checkbox-row">
              <input
                type="checkbox"
                id={`req-${f.id}`}
                checked={f.required}
                onChange={(e) => updateRespondentField(i, { required: e.target.checked })}
              />
              <label htmlFor={`req-${f.id}`} style={{ marginBottom: 0, fontWeight: 400 }}>
                Required
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Values to rank</h3>
        {q.rankingItems.map((item, i) => (
          <div key={item.id} className="field" style={{ borderTop: i > 0 ? '1px solid #eee' : 'none', paddingTop: i > 0 ? 16 : 0 }}>
            <label>Value name</label>
            <input type="text" value={item.label} onChange={(e) => updateRankingItem(i, { label: e.target.value })} />
            <label style={{ marginTop: 10 }}>Short description</label>
            <input type="text" value={item.blurb} onChange={(e) => updateRankingItem(i, { blurb: e.target.value })} />
            <div className="btn-row" style={{ marginTop: 10 }}>
              <button className="btn btn--outline btn--small" onClick={() => removeRankingItem(i)}>
                Remove
              </button>
            </div>
          </div>
        ))}
        <button className="btn btn--secondary btn--small" onClick={addRankingItem}>
          + Add a value
        </button>

        <div style={{ marginTop: 20, borderTop: '1px solid #eee', paddingTop: 16 }}>
          <div className="checkbox-row">
            <input
              type="checkbox"
              id="allowCustom"
              checked={q.allowCustomItems}
              onChange={(e) => set('allowCustomItems', e.target.checked)}
            />
            <label htmlFor="allowCustom" style={{ marginBottom: 0, fontWeight: 600 }}>
              Let members add their own value(s)
            </label>
          </div>
          {q.allowCustomItems && (
            <div className="field" style={{ maxWidth: 160 }}>
              <label>Max custom values</label>
              <select value={q.maxCustomItems} onChange={(e) => set('maxCustomItems', Number(e.target.value))}>
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Follow-up questions</h3>
        {q.followUpQuestions.map((fq, i) => (
          <div key={fq.id} className="field" style={{ borderTop: i > 0 ? '1px solid #eee' : 'none', paddingTop: i > 0 ? 16 : 0 }}>
            <label>Question</label>
            <input type="text" value={fq.label} onChange={(e) => updateFollowUp(i, { label: e.target.value })} />
            <label style={{ marginTop: 10 }}>Placeholder text</label>
            <input type="text" value={fq.placeholder} onChange={(e) => updateFollowUp(i, { placeholder: e.target.value })} />
            <div className="checkbox-row" style={{ marginTop: 10 }}>
              <input
                type="checkbox"
                id={`fq-req-${fq.id}`}
                checked={fq.required}
                onChange={(e) => updateFollowUp(i, { required: e.target.checked })}
              />
              <label htmlFor={`fq-req-${fq.id}`} style={{ marginBottom: 0, fontWeight: 400 }}>
                Required
              </label>
            </div>
            <div className="btn-row" style={{ marginTop: 10 }}>
              <button className="btn btn--outline btn--small" onClick={() => removeFollowUp(i)}>
                Remove
              </button>
            </div>
          </div>
        ))}
        <button className="btn btn--secondary btn--small" onClick={addFollowUp}>
          + Add a question
        </button>
      </div>

      <div className="btn-row">
        <button className="btn" onClick={handleSave} disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Save Changes'}
        </button>
        {status === 'saved' && <span className="badge">Saved</span>}
        {status.startsWith('error') && <span className="banner banner--error">{status}</span>}
      </div>
    </div>
  );
}
