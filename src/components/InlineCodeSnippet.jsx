import React, { useState } from 'react';
import { generateCodeSnippet } from '../utils/codeGenerators';
import { CodeSyntaxHighlighter } from './CodeSyntaxHighlighter';
import { ScrollableTabsContainer } from './ScrollableTabsContainer';
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>
          <Code size={16} color="var(--accent-primary)" />
          Code Snippet
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Language Pills & Copy Button Toolbar with Scroll Arrows */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px', flexShrink: 0, minWidth: 0, width: '100%' }}>
        <ScrollableTabsContainer style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setSelectedLang(lang.id)}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  borderRadius: '5px',
                  border: '1px solid var(--border-color)',
                  background: selectedLang === lang.id ? 'var(--bg-card)' : 'transparent',
                  color: selectedLang === lang.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                  fontWeight: selectedLang === lang.id ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </ScrollableTabsContainer>

        <button
          type="button"
          className="aether-btn sm"
          onClick={handleCopy}
          style={{ fontSize: '11px', padding: '4px 10px', flexShrink: 0 }}
        >
          {copied ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Code Display with Generous Boundary Padding & Syntax Highlighting */}
      <div style={{
        flex: 1,
        background: 'var(--bg-input)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '14px 16px',
        overflowX: 'auto',
        overflowY: 'auto',
        minHeight: 0,
        boxSizing: 'border-box',
      }}>
        <CodeSyntaxHighlighter code={snippet} language={selectedLang} />
      </div>
    </div>
  );
};
