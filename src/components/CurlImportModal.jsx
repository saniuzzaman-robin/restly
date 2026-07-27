import React, { useState } from 'react';
import { parseCurlCommand } from '../utils/curlParser';
import { X, Terminal, Check, AlertCircle } from 'lucide-react';

export const CurlImportModal = ({ onImportCurl, onClose }) => {
  const [curlText, setCurlText] = useState('');
  const [error, setError] = useState(null);

  const handleImport = () => {
    try {
      if (!curlText.trim()) return;
      const parsedRequest = parseCurlCommand(curlText);
      onImportCurl(parsedRequest);
      setError(null);
      onClose();
    } catch (err) {
      setError('Could not parse cURL command: ' + err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '15px' }}>
            <Terminal color="var(--accent-primary)" size={18} />
            Import / Paste cURL Command
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Paste a cURL command below to automatically extract the HTTP method, URL, headers, authorization, and request body.
          </div>

          <textarea
            className="aether-input mono"
            placeholder={`curl -X POST "https://api.example.com/v1/users" \\\n  -H "Authorization: Bearer token123" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name": "Alice"}'`}
            value={curlText}
            onChange={(e) => {
              setCurlText(e.target.value);
              setError(null);
            }}
            rows={8}
            style={{ width: '100%', resize: 'vertical', fontSize: '12px', lineHeight: '1.5' }}
            autoFocus
          />

          {error && (
            <div style={{ color: '#DC2626', fontSize: '12px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="aether-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="aether-btn primary" disabled={!curlText.trim()} onClick={handleImport}>
            <Check size={14} /> Import Request
          </button>
        </div>
      </div>
    </div>
  );
};
