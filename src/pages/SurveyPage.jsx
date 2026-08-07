import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RankingPicker from '../components/RankingPicker.jsx';
import { getQuestions, createSubmission, isDemoMode } from '../api.js';
import { DEFAULT_QUESTIONS } from '../../shared/defaultQuestions.js';

export default function SurveyPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [meeting, setMeeting] = useState('');
  const [ranking, setRanking] = useState([]);
  const [customItems, setCustomItems] = useState([]); // [{id,label}]
  const [customText1, setCustomText1] = useState('');
  const [customText2, setCustomText2] = useState('');
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    getQuestions()
      .then((q) => setQuestions(q))
      .catch(() => setQuestions(DEFAULT_QUESTIONS))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !questions) {
    return (
      <div className="page">
        <p>Loading survey…</p>
      </div>
    );
  }

  const allItems = [...questions.rankingItems, ...customItems];
  const steps = ['intro', 'rank', 'followup', 'review'];
  const stepIndex = step;
  const progressPct = ((stepIndex + 1) / steps.length) * 100;

  function updateAnswer(id, val) {
    setAnswers((a) => ({ ...a, [id]: val }));
  }

  function addCustomItem(text, slot) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const id = `custom_${slot}`;
    setCustomItems((items) => {
      const withoutSlot = items.filter((i) => i.id !== id);
      return [...withoutSlot, { id, label: trimmed }];
    });
  }

  function canProceedFromIntro() {
    const requiredFields = questions.respondentFields.filter((f) => f.required);
    return requiredFields.every((f) => (f.id === 'name' ? name.trim() : true));
  }

  function canProceedFromRank() {
    return ranking.length >= Math.min(3, allItems.length);
  }

  function canProceedFromFollowup() {
    return questions.followUpQuestions.filter((q) => q.required).every((q) => (answers[q.id] || '').trim());
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const submission = await createSubmission({ name, meeting, ranking, customItems, answers });
      navigate(`/thank-you/${submission.id}`);
    } catch (e) {
      setError(e.message || 'Something went wrong submitting your answers.');
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      {isDemoMode() && (
        <div className="banner no-print">
          Demo mode — this is running without a connected backend, so your answers are only saved in this browser.
        </div>
      )}
      <div className="progress">
        <div style={{ width: `${progressPct}%` }} />
      </div>

      {step === 0 && (
        <div>
          <h1>{questions.introTitle}</h1>
          <p>{questions.introBody}</p>
          <div className="card">
            {questions.respondentFields.map((f) => (
              <div className="field" key={f.id}>
                <label htmlFor={f.id}>
                  {f.label}
                  {f.required ? ' *' : ''}
                </label>
                <input
                  id={f.id}
                  type="text"
                  value={f.id === 'name' ? name : meeting}
                  onChange={(e) => (f.id === 'name' ? setName(e.target.value) : setMeeting(e.target.value))}
                />
              </div>
            ))}
          </div>
          <div className="btn-row">
            <button className="btn" disabled={!canProceedFromIntro()} onClick={() => setStep(1)}>
              Next
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h1>Rank what matters to you</h1>
          <p>{questions.rankingPrompt}</p>
          <RankingPicker items={allItems} value={ranking} onChange={setRanking} />

          {questions.allowCustomItems && (
            <div className="card" style={{ marginTop: 20 }}>
              <p style={{ marginBottom: 12, fontWeight: 600 }}>Want to add your own? (optional)</p>
              {questions.maxCustomItems >= 1 && (
                <div className="field">
                  <input
                    type="text"
                    placeholder="Add a value of your own…"
                    value={customText1}
                    onChange={(e) => setCustomText1(e.target.value)}
                    onBlur={() => addCustomItem(customText1, 1)}
                  />
                </div>
              )}
              {questions.maxCustomItems >= 2 && (
                <div className="field">
                  <input
                    type="text"
                    placeholder="Add another value of your own…"
                    value={customText2}
                    onChange={(e) => setCustomText2(e.target.value)}
                    onBlur={() => addCustomItem(customText2, 2)}
                  />
                </div>
              )}
            </div>
          )}

          <div className="btn-row">
            <button className="btn btn--outline" onClick={() => setStep(0)}>
              Back
            </button>
            <button className="btn" disabled={!canProceedFromRank()} onClick={() => setStep(2)}>
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1>Tell us more</h1>
          <div className="card">
            {questions.followUpQuestions.map((q) => (
              <div className="field" key={q.id}>
                <label htmlFor={q.id}>
                  {q.label}
                  {q.required ? ' *' : ''}
                </label>
                <textarea
                  id={q.id}
                  placeholder={q.placeholder}
                  value={answers[q.id] || ''}
                  onChange={(e) => updateAnswer(q.id, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="btn-row">
            <button className="btn btn--outline" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn" disabled={!canProceedFromFollowup()} onClick={() => setStep(3)}>
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h1>Review your answers</h1>
          <div className="card">
            <p>
              <strong>Name:</strong> {name || '—'}
              {meeting ? ` · ${meeting}` : ''}
            </p>
            <p>
              <strong>Your order:</strong>{' '}
              {ranking.map((id) => allItems.find((i) => i.id === id)?.label).filter(Boolean).join(', ')}
            </p>
            {questions.followUpQuestions.map((q) =>
              answers[q.id] ? (
                <p key={q.id}>
                  <strong>{q.label}</strong>
                  <br />
                  {answers[q.id]}
                </p>
              ) : null
            )}
          </div>
          {error && <div className="banner banner--error">{error}</div>}
          <div className="btn-row">
            <button className="btn btn--outline" onClick={() => setStep(2)} disabled={submitting}>
              Back
            </button>
            <button className="btn" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit & Build My Brochure'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
