import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Maximize2, Minimize2, Copy, Check } from 'lucide-react';

/**
 * Interactive Collapsible/Expandable Tree Node for JSON Objects & Arrays
 */
const JsonTreeNode = ({ name, value, isLast, depth = 0, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  const indent = depth * 16;

  if (!isExpandable) {
    let formattedVal = JSON.stringify(value);
    let valColor = 'var(--json-string)';

    if (typeof value === 'number') valColor = '#38BDF8';
    else if (typeof value === 'boolean') valColor = '#F59E0B';
    else if (value === null) valColor = '#EF4444';

    return (
      <div style={{ paddingLeft: `${indent}px`, lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {name !== undefined && (
          <span style={{ color: 'var(--json-key)', fontWeight: '600' }}>"{name}": </span>
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
    <div>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          paddingLeft: `${indent}px`,
          lineHeight: '1.6',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          userSelect: 'none'
        }}
      >
        <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center' }}>
          {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </span>

        {name !== undefined && (
          <span style={{ color: 'var(--json-key)', fontWeight: '600' }}>"{name}": </span>
        )}

        <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{openBracket}</span>

        {!isExpanded && (
          <span style={{ color: 'var(--text-dim)', fontSize: '11px', margin: '0 4px', fontStyle: 'italic' }}>
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
          <div style={{ paddingLeft: `${indent + 16}px`, color: 'var(--text-main)', fontWeight: '600' }}>
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
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
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
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', overflowX: 'auto', padding: '4px 0' }}>
        <JsonTreeNode value={parsedData} isLast={true} depth={0} defaultExpanded={expandAll} key={expandAll ? 'exp' : 'col'} />
      </div>
    </div>
  );
};
