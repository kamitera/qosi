import React, { useState } from 'react';
import { resizeImageFile } from '../lib/resizeImage.js';
import { searchUnsplash, trackUnsplashDownload } from '../api.js';

// Lets a member add one photo to their brochure — either from their own
// device, or by searching Unsplash. `value` / `onChange` hold a photo
// object shaped like:
//   { src, source: 'upload' }
//   { src, source: 'unsplash', photographer, photographerUrl }
// or null for "no photo".
export default function PhotoPicker({ value, onChange }) {
  const [tab, setTab] = useState('upload');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const [error, setError] = useState('');

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const dataUrl = await resizeImageFile(file, 900, { format: 'jpeg', quality: 0.82 });
      onChange({ src: dataUrl, source: 'upload' });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError('');
    try {
      const data = await searchUnsplash(query.trim());
      if (!data.configured) {
        setNotConfigured(true);
      } else {
        setResults(data.results);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  }

  function pickUnsplash(photo) {
    onChange({ src: photo.full, source: 'unsplash', photographer: photo.photographer, photographerUrl: photo.photographerUrl });
    trackUnsplashDownload(photo.downloadLocation);
  }

  if (value) {
    return (
      <div className="photo-preview">
        <img src={value.src} alt="" className="photo-preview-img" />
        {value.source === 'unsplash' && value.photographer && (
          <p className="hint">
            Photo by{' '}
            <a href={value.photographerUrl} target="_blank" rel="noreferrer">
              {value.photographer}
            </a>{' '}
            on Unsplash
          </p>
        )}
        <button type="button" className="btn btn--outline btn--small" onClick={() => onChange(null)}>
          Remove photo
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="tab-row">
        <button type="button" className={`tab-btn${tab === 'upload' ? ' active' : ''}`} onClick={() => setTab('upload')}>
          Upload from my device
        </button>
        <button type="button" className={`tab-btn${tab === 'unsplash' ? ' active' : ''}`} onClick={() => setTab('unsplash')}>
          Search Unsplash
        </button>
      </div>

      {tab === 'upload' && (
        <div className="field" style={{ marginBottom: 0 }}>
          <input type="file" accept="image/*" onChange={handleUpload} />
        </div>
      )}

      {tab === 'unsplash' &&
        (notConfigured ? (
          <p className="hint">Unsplash photo search isn't set up for this site yet — you can still upload your own photo.</p>
        ) : (
          <div>
            <form className="btn-row" onSubmit={handleSearch}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search photos, e.g. “sunrise”"
                style={{ flex: 1 }}
              />
              <button className="btn btn--secondary" type="submit" disabled={searching}>
                {searching ? 'Searching…' : 'Search'}
              </button>
            </form>
            {results && (
              <div className="photo-grid">
                {results.length === 0 && <p className="hint">No results — try another search.</p>}
                {results.map((p) => (
                  <button type="button" key={p.id} className="photo-grid-item" onClick={() => pickUnsplash(p)}>
                    <img src={p.thumb} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

      {error && <div className="banner banner--error">{error}</div>}
    </div>
  );
}
