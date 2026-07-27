import React, { useState } from 'react';
import { generateCodeSnippet } from '../utils/codeGenerators';
import { X, Copy, Check, Code } from 'lucide-react';

const LANGUAGES = [
  { id: 'curl', label: 'cURL' },
  { id: 'javascript-fetch', label: 'JavaScript (Fetch)' },
  { id: 'javascript-axios', label: 'JavaScript (Axios)' },
  { id: 'python', label: 'Python (Requests)' },
  { id: 'go', label: 'Go (net/http)' },
];

export const CodeSnippetModal = ({ request, envVariables = [], onClose }) => {
  const [selectedLang, setSelectedLang] = useState('curl');
  const [copied, setCopied] = useState(false);

  const snippet = generateCodeSnippet(request, selectedLang, envVariables);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '15px' }}>
            <Code color="var(--accent-primary)" size={18} />
            Generated Code Snippet
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '0' }}>
          {/* Language Selector Bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tab)' }}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                className={`sub-tab-btn ${selectedLang === lang.id ? 'active' : ''}`}
                onClick={() => setSelectedLang(lang.id)}
                style={{ padding: '10px 14px', fontSize: '12px' }}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Snippet Display */}
          <div style={{ padding: '16px', position: 'relative' }}>
            <button
              className="aether-btn sm"
              onClick={handleCopy}
              style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10 }}
            >
              {copied ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy Code'}
            </button>

            <pre style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-main)',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              margin: 0,
              lineHeight: '1.5'
            }}>
              {snippet}
            </pre>
          </div>
        </div>

        <div className="modal-footer">
          <button className="aether-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
