import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Maximize2, Minimize2, Copy, Check } from 'lucide-react';

/**
 * Interactive Collapsible/Expandable Tree Node for JSON Objects & Arrays
 * Fixes indentation alignment so opening & closing brackets share exact padding.
 */
const JsonTreeNode = ({ name, value, isLast, depth = 0, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  const indent = depth * 20; // 20px clean indentation per depth level

  if (!isExpandable) {
    let formattedVal = JSON.stringify(value);
    let valColor = 'var(--json-string, #A7F3D0)';

    if (typeof value === 'number') valColor = '#38BDF8';
    else if (typeof value === 'boolean') valColor = '#F59E0B';
    else if (value === null) valColor = '#EF4444';

    return (
      <div style={{ paddingLeft: `${indent + 20}px`, lineHeight: '1.7', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {name !== undefined && (
          <span style={{ color: 'var(--json-key, #38BDF8)', fontWeight: '600' }}>"{name}": </span>
        )}
        <span style={{ color: valColor }}>{formattedVal}</span>
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
          <span style={{ color: 'var(--json-key, #38BDF8)', fontWeight: '600' }}>"{name}": </span>
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
          {/* Closing bracket aligned at exact opening depth level + 20px padding */}
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
    return <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No JSON data to display</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px dashed var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="aether-btn sm"
            onClick={() => setExpandAll(true)}
            title="Expand all JSON nodes"
            style={{ fontSize: '11px', padding: '2px 8px' }}
          >
            <Maximize2 size={12} /> Expand All
          </button>
          <button
            className="aether-btn sm"
            onClick={() => setExpandAll(false)}
            title="Collapse all JSON nodes"
            style={{ fontSize: '11px', padding: '2px 8px' }}
          >
            <Minimize2 size={12} /> Collapse All
          </button>
        </div>

        <button
          className="aether-btn sm"
          onClick={handleCopy}
          style={{ fontSize: '11px', padding: '2px 8px' }}
        >
          {copied ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy JSON'}
        </button>
      </div>

      {/* Tree Content */}
      <div style={{
        fontFamily: "'Fira Code', 'JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', monospace",
        fontSize: '12px',
        overflowX: 'auto',
        padding: '6px 0',
        lineHeight: '1.7'
      }}>
        <JsonTreeNode value={parsedData} isLast={true} depth={0} defaultExpanded={expandAll} key={expandAll ? 'exp' : 'col'} />
      </div>
    </div>
  );
};
