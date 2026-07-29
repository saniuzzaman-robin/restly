import React, { useEffect, useRef } from 'react';

export const HighlightedTextView = ({
  text = '',
  searchState = { query: '', matchCase: false, wholeWord: false, useRegex: false },
  currentMatchIndex = 0,
}) => {
  const activeMatchRef = useRef(null);

  // Auto-scroll to active match when currentMatchIndex changes
  useEffect(() => {
    if (activeMatchRef.current) {
      activeMatchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentMatchIndex, searchState]);

  const query = searchState.query;

  if (!query || !text) {
    return (
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
        {text || 'No Content'}
      </pre>
    );
  }

  let regex;
  try {
    let flags = searchState.matchCase ? 'g' : 'gi';
    let pattern = query;
    if (!searchState.useRegex) {
      pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    if (searchState.wholeWord) {
      pattern = `\\b${pattern}\\b`;
    }
    regex = new RegExp(pattern, flags);
  } catch (e) {
    return (
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
        {text}
      </pre>
    );
  }

  const matches = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push({ start: match.index, end: match.index + match[0].length });
    if (regex.lastIndex === match.index) regex.lastIndex++;
  }

  if (matches.length === 0) {
    return (
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
        {text}
      </pre>
    );
  }

  const elements = [];
  let lastIndex = 0;

  matches.forEach((m, idx) => {
    if (m.start > lastIndex) {
      elements.push(text.slice(lastIndex, m.start));
    }

    const isActive = idx === currentMatchIndex;
    const matchText = text.slice(m.start, m.end);

    elements.push(
      <mark
        key={idx}
        ref={isActive ? activeMatchRef : null}
        style={{
          backgroundColor: isActive ? '#F97316' : '#FDE047',
          color: isActive ? '#FFFFFF' : '#000000',
          borderRadius: '2px',
          padding: '0 2px',
          fontWeight: isActive ? 'bold' : 'normal',
          boxShadow: isActive ? '0 0 0 2px #EA580C' : 'none',
          transition: 'all 0.1s ease',
        }}
      >
        {matchText}
      </mark>
    );

    lastIndex = m.end;
  });

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return (
    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-main)', fontFamily: 'var(--font-mono)', lineHeight: '1.5' }}>
      {elements}
    </pre>
  );
};
