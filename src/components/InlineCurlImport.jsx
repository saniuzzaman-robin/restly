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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>
          <Terminal size={16} color="var(--accent-primary)" />
          Import cURL Command
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
        >
          <X size={16} />
        </button>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: '1.5', flexShrink: 0 }}>
        Paste a cURL command below to automatically set Method, URL, Headers, and Request Body.
      </p>

      {/* Full-Height Textarea with Generous Boundary Padding & Zero Horizontal Scroll */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, marginBottom: '16px' }}>
        <textarea
          className="aether-input mono"
          placeholder={`curl -X POST "https://api.example.com/v1/users" \\\n  -H "Authorization: Bearer token123" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name": "Alice"}'`}
          value={curlText}
          onChange={(e) => {
            setCurlText(e.target.value);
            setError(null);
          }}
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            resize: 'none',
            fontSize: '12px',
            lineHeight: '1.6',
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            padding: '14px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-input)',
            color: 'var(--text-main)',
            overflowX: 'hidden',
            overflowY: 'auto',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            boxSizing: 'border-box',
          }}
          autoFocus
        />
      </div>

      {error && (
        <div style={{ color: '#DC2626', fontSize: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexShrink: 0 }}>
        <button type="button" className="aether-btn" onClick={onClose} style={{ padding: '6px 14px', fontSize: '12px' }}>
          Cancel
        </button>
        <button
          type="button"
          className="aether-btn primary"
          onClick={handleImport}
          disabled={!curlText.trim()}
          style={{ padding: '6px 16px', fontSize: '12px' }}
        >
          <Check size={14} /> Import Request
        </button>
      </div>
    </div>
  );
};
