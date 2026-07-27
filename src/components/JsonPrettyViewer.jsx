import React, { useMemo } from 'react';

/**
 * Syntax-highlighted JSON viewer with line numbers and theme-aware contrast
 */
export const JsonPrettyViewer = ({ data, rawText }) => {
  const highlightedHtml = useMemo(() => {
    let jsonString = '';

    if (data !== null && data !== undefined && typeof data === 'object') {
      jsonString = JSON.stringify(data, null, 2);
    } else if (rawText) {
      try {
        const parsed = JSON.parse(rawText);
        jsonString = JSON.stringify(parsed, null, 2);
      } catch (e) {
        jsonString = rawText;
      }
    }

    if (!jsonString) return { html: 'Empty Response', lineCount: 1 };

    // Escape HTML special characters
    let escaped = jsonString
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Syntax highlight regex
    const syntaxRegex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;

    const formatted = escaped.replace(syntaxRegex, (match) => {
      let cls = 'json-number';
      let color = 'var(--json-number)';

      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
          color = 'var(--json-key)';
        } else {
          cls = 'json-string';
          color = 'var(--json-string)';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
        color = 'var(--json-boolean)';
      } else if (/null/.test(match)) {
        cls = 'json-null';
        color = 'var(--json-null)';
      }

      return `<span class="${cls}" style="color: ${color}; font-weight: ${cls === 'json-key' ? '600' : '400'}">${match}</span>`;
    });

    const lines = formatted.split('\n');
    return {
      lines,
      lineCount: lines.length,
    };
  }, [data, rawText]);

  return (
    <div style={{ display: 'flex', fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: '1.6' }}>
      {/* Line Numbers Column */}
      <div style={{
        paddingRight: '12px',
        marginRight: '12px',
        borderRight: '1px solid var(--border-color)',
        color: 'var(--text-dim)',
        textAlign: 'right',
        userSelect: 'none',
        minWidth: '32px'
      }}>
        {Array.from({ length: highlightedHtml.lineCount }).map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>

      {/* Code Area */}
      <div style={{ flex: 1, overflowX: 'auto' }}>
        {highlightedHtml.lines.map((lineHtml, i) => (
          <div
            key={i}
            dangerouslySetInnerHTML={{ __html: lineHtml || '&nbsp;' }}
            style={{ whiteSpace: 'pre', wordBreak: 'break-all' }}
          />
        ))}
      </div>
    </div>
  );
};
