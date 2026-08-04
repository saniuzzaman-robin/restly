import React, { useMemo } from 'react';

/**
 * Selective Syntax Highlighter for cURL & Code Snippets.
 * Focuses accent colors strictly on URLs, HTTP methods, and primary commands,
 * leaving general text, headers, and flags in clean theme text color.
 */
export const CodeSyntaxHighlighter = ({ code = '', language = 'curl' }) => {
  const renderedLines = useMemo(() => {
    if (!code) return null;
    const lines = code.split('\n');

    return lines.map((line, idx) => {
      return (
        <div key={idx} style={{ minHeight: '1.6em' }}>
          <HighlightLine line={line} language={language} />
        </div>
      );
    });
  }, [code, language]);

  return (
    <pre style={{
      margin: 0,
      fontFamily: "var(--font-mono, 'JetBrains Mono', 'Fira Code', monospace)",
      fontSize: '12px',
      lineHeight: '1.6',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      tabSize: 2,
      color: 'var(--text-main)',
    }}>
      {renderedLines}
    </pre>
  );
};

const HighlightLine = ({ line, language }) => {
  if (!line) return null;

  // cURL Selective Tokenizer
  if (language === 'curl') {
    return <HighlightCurlLine line={line} />;
  }

  // Generic Code Selective Tokenizer
  return <HighlightGenericLine line={line} language={language} />;
};

/**
 * Selective Tokenizer for cURL commands:
 * Colors ONLY:
 * 1. Primary command 'curl'
 * 2. HTTP Method (GET, POST, PUT, DELETE, PATCH)
 * 3. URL strings (http://, https://, {{baseUrl}})
 * Everything else remains default theme text color (var(--text-main)).
 */
const HighlightCurlLine = ({ line }) => {
  const tokenRegex = /(curl)|(\b(?:GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b)|('(?:\\'|[^'])*'|"(?:\\"|[^"])*")/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', val: line.slice(lastIndex, match.index) });
    }

    const [fullMatch, isCurl, method, quotedStr] = match;

    if (isCurl) {
      parts.push({ type: 'curl', val: fullMatch });
    } else if (method) {
      parts.push({ type: 'method', val: fullMatch });
    } else if (quotedStr) {
      if (quotedStr.includes('http://') || quotedStr.includes('https://') || quotedStr.includes('{{')) {
        parts.push({ type: 'url', val: fullMatch });
      } else {
        parts.push({ type: 'text', val: fullMatch });
      }
    } else {
      parts.push({ type: 'text', val: fullMatch });
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push({ type: 'text', val: line.slice(lastIndex) });
  }

  return (
    <span>
      {parts.map((p, i) => {
        if (p.type === 'curl') {
          return <span key={i} style={{ color: 'var(--accent-primary, #38BDF8)', fontWeight: '700' }}>{p.val}</span>;
        }
        if (p.type === 'method') {
          return <span key={i} style={{ color: 'var(--method-get, #4EC9B0)', fontWeight: '700' }}>{p.val}</span>;
        }
        if (p.type === 'url') {
          return (
            <span key={i} style={{ color: '#38BDF8', fontWeight: '600', textDecoration: 'underline', textDecorationColor: 'rgba(56, 189, 248, 0.35)' }}>
              {p.val}
            </span>
          );
        }
        return <span key={i} style={{ color: 'var(--text-main)' }}>{p.val}</span>;
      })}
    </span>
  );
};

/**
 * Selective Tokenizer for Multi-Language Snippets (JS, Python, Go):
 * Colors ONLY:
 * 1. Primary HTTP Methods (GET, POST, etc.)
 * 2. URLs (http://, https://)
 * 3. Comments (muted grey)
 * Everything else remains default theme text color.
 */
const HighlightGenericLine = ({ line, language }) => {
  const tokenRegex = /(\b(?:GET|POST|PUT|DELETE|PATCH)\b)|('(?:\\'|[^'])*'|"(?:\\"|[^"])*"|`(?:\\`|[^`])*`)|(\/\/.+|\#.+)/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', val: line.slice(lastIndex, match.index) });
    }

    const [fullMatch, method, quotedStr, comment] = match;

    if (method) {
      parts.push({ type: 'method', val: fullMatch });
    } else if (quotedStr) {
      if (quotedStr.includes('http://') || quotedStr.includes('https://')) {
        parts.push({ type: 'url', val: fullMatch });
      } else {
        parts.push({ type: 'text', val: fullMatch });
      }
    } else if (comment) {
      parts.push({ type: 'comment', val: fullMatch });
    } else {
      parts.push({ type: 'text', val: fullMatch });
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push({ type: 'text', val: line.slice(lastIndex) });
  }

  return (
    <span>
      {parts.map((p, i) => {
        if (p.type === 'method') {
          return <span key={i} style={{ color: 'var(--method-get, #4EC9B0)', fontWeight: '700' }}>{p.val}</span>;
        }
        if (p.type === 'url') {
          return (
            <span key={i} style={{ color: '#38BDF8', fontWeight: '600', textDecoration: 'underline', textDecorationColor: 'rgba(56, 189, 248, 0.35)' }}>
              {p.val}
            </span>
          );
        }
        if (p.type === 'comment') {
          return <span key={i} style={{ color: 'var(--text-muted, #888888)', fontStyle: 'italic' }}>{p.val}</span>;
        }
        return <span key={i} style={{ color: 'var(--text-main)' }}>{p.val}</span>;
      })}
    </span>
  );
};
