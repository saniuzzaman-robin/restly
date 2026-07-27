import React, { useState } from 'react';
import { generateCodeSnippet } from '../utils/codeGenerators';
import { Code, Copy, Check, X } from 'lucide-react';

const LANGUAGES = [
  { id: 'curl', label: 'cURL' },
  { id: 'javascript-fetch', label: 'JS Fetch' },
  { id: 'javascript-axios', label: 'Axios' },
  { id: 'python', label: 'Python' },
  { id: 'go', label: 'Go' },
];

export const InlineCodeSnippet = ({ request, envVariables = [], onClose }) => {
  const [selectedLang, setSelectedLang] = useState('curl');
  const [copied, setCopied] = useState(false);

  const snippet = generateCodeSnippet(request, selectedLang, envVariables);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px', color: 'var(--text-main)' }}>
          <Code size={15} color="var(--accent-primary)" />
          Code Snippet
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Language Pills & Copy Button Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setSelectedLang(lang.id)}
              style={{
                padding: '3px 8px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                background: selectedLang === lang.id ? 'var(--bg-card)' : 'transparent',
                color: selectedLang === lang.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontWeight: selectedLang === lang.id ? '600' : '400',
                cursor: 'pointer'
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="aether-btn sm"
          onClick={handleCopy}
          style={{ fontSize: '11px', padding: '3px 8px' }}
        >
          {copied ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Code Display */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <pre style={{
          flex: 1,
          background: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          padding: '12px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-main)',
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          margin: 0,
          lineHeight: '1.5'
        }}>
          {snippet}
        </pre>
      </div>
    </div>
  );
};
