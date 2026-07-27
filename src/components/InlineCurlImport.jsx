import React, { useState } from 'react';
import { parseCurlCommand } from '../utils/curlParser';
import { Terminal, Check, AlertCircle, X } from 'lucide-react';

export const InlineCurlImport = ({ onImport, onClose }) => {
  const [curlText, setCurlText] = useState('');
  const [error, setError] = useState(null);

  const handleImport = (e) => {
    e?.preventDefault();
    try {
      if (!curlText.trim()) return;
      const parsed = parseCurlCommand(curlText);
      onImport(parsed);
      setError(null);
    } catch (err) {
      setError('Failed to parse cURL: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px', color: 'var(--text-main)' }}>
          <Terminal size={15} color="var(--accent-primary)" />
          Import cURL Command
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
        >
          <X size={15} />
        </button>
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 10px 0', lineHeight: '1.4' }}>
        Paste a cURL command below to automatically set Method, URL, Headers, and Request Body.
      </p>

      {/* Textarea */}
      <textarea
        className="aether-input mono"
        placeholder={`curl -X POST "https://api.example.com/users" \\\n  -H "Authorization: Bearer token123" \\\n  -d '{"name": "Alice"}'`}
        value={curlText}
        onChange={(e) => {
          setCurlText(e.target.value);
          setError(null);
        }}
        rows={7}
        style={{ width: '100%', resize: 'vertical', fontSize: '11px', lineHeight: '1.5', marginBottom: '10px' }}
        autoFocus
      />

      {error && (
        <div style={{ color: '#DC2626', fontSize: '11px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={13} /> {error}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: 'auto' }}>
        <button type="button" className="aether-btn sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="aether-btn primary sm"
          onClick={handleImport}
          disabled={!curlText.trim()}
        >
          <Check size={13} /> Import Request
        </button>
      </div>
    </div>
  );
};
