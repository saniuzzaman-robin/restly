import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Maximize2, Minimize2, Copy, Check } from 'lucide-react';

/**
 * Interactive Collapsible/Expandable Tree Node for JSON Objects & Arrays
 * Uses CSS theme variables for high-contrast syntax highlighting.
 */
const JsonTreeNode = ({ name, value, isLast, depth = 0, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  const indent = depth * 20;

  if (!isExpandable) {
    let formattedVal = JSON.stringify(value);
    let valColor = 'var(--json-string)';

    if (typeof value === 'number') valColor = 'var(--json-number)';
    else if (typeof value === 'boolean') valColor = 'var(--json-boolean)';
    else if (value === null) valColor = 'var(--json-null)';

    return (
      <div style={{ paddingLeft: `${indent + 20}px`, lineHeight: '1.7', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {name !== undefined && (
          <span style={{ color: 'var(--json-key)', fontWeight: '600' }}>"{name}": </span>
        )}
        <span style={{ color: valColor, fontWeight: '500' }}>{formattedVal}</span>
        {!isLast && <span style={{ color: 'var(--text-muted)' }}>,</span>}
      </div>
    );
  }

  const keys = Object.keys(value);
  const itemCount = keys.length;
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';

  return (
    <div style={{ lineHeight: '1.7' }}>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          paddingLeft: `${indent}px`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          userSelect: 'none',
        }}
      >
        <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', width: '16px', justifyContent: 'center' }}>
          {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </span>

        {name !== undefined && (
          <span style={{ color: 'var(--json-key)', fontWeight: '600' }}>"{name}": </span>
        )}

        <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{openBracket}</span>

        {!isExpanded && (
          <span style={{ color: 'var(--text-dim)', fontSize: '11px', margin: '0 6px', fontStyle: 'italic' }}>
            ... {itemCount} {itemCount === 1 ? 'item' : 'items'} ...
          </span>
        )}

        {!isExpanded && (
          <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{closeBracket}</span>
        )}

        {!isExpanded && !isLast && (
          <span style={{ color: 'var(--text-muted)' }}>,</span>
        )}
      </div>

      {isExpanded && (
        <div>
          {keys.map((key, idx) => (
            <JsonTreeNode
              key={key}
              name={isArray ? undefined : key}
              value={value[key]}
              isLast={idx === keys.length - 1}
              depth={depth + 1}
              defaultExpanded={defaultExpanded}
            />
          ))}
          <div style={{ paddingLeft: `${indent + 20}px`, color: 'var(--text-main)', fontWeight: '600' }}>
            {closeBracket}{!isLast && <span style={{ color: 'var(--text-muted)' }}>,</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export const JsonPrettyViewer = ({ data, rawText }) => {
  const [expandAll, setExpandAll] = useState(true);
  const [copied, setCopied] = useState(false);

  const parsedData = useMemo(() => {
    if (data !== null && data !== undefined && typeof data === 'object') {
      return data;
    }
    if (rawText) {
      try {
        return JSON.parse(rawText);
      } catch (e) {
        return null;
      }
    }
    return null;
  }, [data, rawText]);

  const handleCopy = () => {
    const textToCopy = parsedData ? JSON.stringify(parsedData, null, 2) : rawText;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!parsedData && rawText) {
    return (
      <pre style={{
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        color: 'var(--text-main)',
        fontFamily: "'Fira Code', 'JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', monospace",
        lineHeight: '1.7',
        fontSize: '12px',
        tabSize: 2
      }}>
        {rawText}
      </pre>
    );
  }

  if (!parsedData) {
    return <div style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '12px' }}>No JSON data to display</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* Sticky Fixed Controls Bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '8px',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
          JSON INTERACTIVE VIEWER
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setExpandAll(!expandAll)}
            className="aether-btn sm"
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            {expandAll ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            {expandAll ? 'Collapse All' : 'Expand All'}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="aether-btn sm"
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            {copied ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy Formatted JSON'}
          </button>
        </div>
      </div>

      {/* Scrollable JSON Body Tree */}
      <div style={{
        flex: 1,
        fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
        fontSize: '12px',
        overflowY: 'auto',
        overflowX: 'auto',
        padding: '0 12px 12px 12px',
        minHeight: 0,
        boxSizing: 'border-box',
      }}>
        <JsonTreeNode value={parsedData} isLast={true} depth={0} defaultExpanded={expandAll} />
      </div>
    </div>
  );
};
