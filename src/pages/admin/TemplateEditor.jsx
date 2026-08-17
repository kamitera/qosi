import React, { useEffect, useState } from 'react';
import { getTemplate, saveTemplate } from '../../api.js';
import { resizeImageFile } from '../../lib/resizeImage.js';
import { COLOR_THEMES } from '../../../shared/colorThemes.js';

// Reusable "optional panel image" control — used on every panel below so
// each one can carry its own accent image, not just text.
function PanelImageField({ template, field, onChange }) {
  const [error, setError] = useState('');
  const value = template[field];

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const dataUrl = await resizeImageFile(file, 900, { format: 'jpeg', quality: 0.82 });
      onChange(field, dataUrl);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="field">
      <label>Panel image (optional)</label>
      {value && <img src={value} alt="" className="logo-preview" style={{ width: 100, height: 70, objectFit: 'cover', marginBottom: 10 }} />}
      <input type="file" accept="image/*" onChange={handleUpload} />
      {error && <span className="hint" style={{ color: '#b6543c' }}>{error}</span>}
      {value && (
        <div style={{ marginTop: 8 }}>
          <button type="button" className="btn btn--outline btn--small" onClick={() => onChange(field, '')}>
            Remove image
          </button>
        </div>
      )}
    </div>
  );
}

export default function TemplateEditor() {
  const [t, setT] = useState(null);
  const [status, setStatus] = useState('');
  const [logoError, setLogoError] = useState('');

  useEffect(() => {
    getTemplate().then(setT);
  }, []);

  if (!t) return <p>Loading…</p>;

  function set(field, value) {
    setT((prev) => ({ ...prev, [field]: value }));
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError('');
    try {
      const dataUrl = await resizeImageFile(file);
      set('logoDataUrl', dataUrl);
    } catch (err) {
      setLogoError(err.message);
    }
  }

  async function handleSave() {
    setStatus('saving');
    try {
      await saveTemplate(t);
      setStatus('saved');
      setTimeout(() => setStatus(''), 2000);
    } catch (e) {
      setStatus('error: ' + e.message);
    }
  }

  return (
    <div>
      <h1>Brochure Template</h1>
      <p>
        This is the fixed text, images, and color scheme for each of the brochure's 6 panels. Each panel can have
        its own optional image plus its own heading and body text.
      </p>

      <div className="card">
        <h3>Identity</h3>
        <div className="field">
          <label>Meeting / organization name</label>
          <input type="text" value={t.orgName} onChange={(e) => set('orgName', e.target.value)} />
        </div>
        <div className="field">
          <label>Tagline</label>
          <input type="text" value={t.tagline} onChange={(e) => set('tagline', e.target.value)} />
        </div>
        <div className="field">
          <label>Logo</label>
          {t.logoDataUrl && <img src={t.logoDataUrl} alt="Logo preview" className="logo-preview" style={{ marginBottom: 10 }} />}
          <input type="file" accept="image/*" onChange={handleLogoUpload} />
          {logoError && <span className="hint" style={{ color: '#b6543c' }}>{logoError}</span>}
          {t.logoDataUrl && (
            <div style={{ marginTop: 8 }}>
              <button className="btn btn--outline btn--small" onClick={() => set('logoDataUrl', '')}>
                Remove logo
              </button>
            </div>
          )}
        </div>
        <div className="field">
          <label>Color theme</label>
          <div className="theme-swatches">
            {COLOR_THEMES.map((theme) => (
              <button
                type="button"
                key={theme.id}
                className={`theme-swatch${t.themeId === theme.id ? ' selected' : ''}`}
                onClick={() => set('themeId', theme.id)}
              >
                <div className="chip-row">
                  <div style={{ background: theme.primary }} />
                  <div style={{ background: theme.secondary }} />
                  <div style={{ background: theme.tertiary }} />
                </div>
                {theme.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Panel 1 — Front cover</h3>
        <div className="field">
          <label>Title</label>
          <input type="text" value={t.frontCoverTitle} onChange={(e) => set('frontCoverTitle', e.target.value)} />
        </div>
        <PanelImageField template={t} field="frontImage" onChange={set} />
      </div>

      <div className="card">
        <h3>Panel 2 — Inside left</h3>
        <div className="field">
          <label>Heading</label>
          <input type="text" value={t.insideLeftHeading} onChange={(e) => set('insideLeftHeading', e.target.value)} />
        </div>
        <div className="field">
          <label>Body text</label>
          <textarea value={t.insideLeftBody} onChange={(e) => set('insideLeftBody', e.target.value)} />
        </div>
        <PanelImageField template={t} field="insideLeftImage" onChange={set} />
      </div>

      <div className="card">
        <h3>Panel 3 — Inside center (testimony)</h3>
        <p className="hint">
          This panel's heading and text come from each member's own answers — there's nothing to set here. The
          image below is only used as a fallback when a member didn't add their own photo.
        </p>
        <PanelImageField template={t} field="insideCenterImage" onChange={set} />
      </div>

      <div className="card">
        <h3>Panel 4 — Inside right</h3>
        <div className="field">
          <label>Heading</label>
          <input type="text" value={t.insideRightHeading} onChange={(e) => set('insideRightHeading', e.target.value)} />
        </div>
        <div className="field">
          <label>Body text</label>
          <textarea value={t.insideRightBody} onChange={(e) => set('insideRightBody', e.target.value)} />
        </div>
        <div className="field">
          <label>Meeting schedule</label>
          <textarea
            value={t.meetingSchedule}
            onChange={(e) => set('meetingSchedule', e.target.value)}
            placeholder={'One line per item, e.g.\nSundays, 10:00 AM — Meeting for Worship'}
          />
          <span className="hint">One line per item.</span>
        </div>
        <PanelImageField template={t} field="insideRightImage" onChange={set} />
      </div>

      <div className="card">
        <h3>Panel 5 — Back flap (contact)</h3>
        <div className="field">
          <label>Heading</label>
          <input type="text" value={t.backFlapHeading} onChange={(e) => set('backFlapHeading', e.target.value)} />
        </div>
        <div className="field">
          <label>Address</label>
          <input type="text" value={t.address} onChange={(e) => set('address', e.target.value)} />
        </div>
        <div className="field">
          <label>Website</label>
          <input type="text" value={t.website} onChange={(e) => set('website', e.target.value)} />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="text" value={t.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
        </div>
        <div className="field">
          <label>Phone</label>
          <input type="text" value={t.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} />
        </div>
        <PanelImageField template={t} field="backFlapImage" onChange={set} />
      </div>

      <div className="card">
        <h3>Panel 6 — Back cover</h3>
        <div className="field">
          <label>Blurb</label>
          <textarea value={t.backCoverBlurb} onChange={(e) => set('backCoverBlurb', e.target.value)} />
        </div>
        <PanelImageField template={t} field="backImage" onChange={set} />
      </div>

      <div className="card">
        <h3>Compiled brochure defaults</h3>
        <div className="field">
          <label>Default title</label>
          <input type="text" value={t.compiledTitle} onChange={(e) => set('compiledTitle', e.target.value)} />
        </div>
        <div className="field">
          <label>Intro text</label>
          <textarea value={t.compiledIntro} onChange={(e) => set('compiledIntro', e.target.value)} />
        </div>
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
