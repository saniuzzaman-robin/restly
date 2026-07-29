import React, { useState, useEffect, useRef, useMemo } from 'react';
import { KeyValueEditor } from './KeyValueEditor';
import { CustomSelect } from './CustomSelect';
import { SearchWidget } from './SearchWidget';
import { HighlightedTextView } from './HighlightedTextView';
import { Code2, AlertCircle, CheckCircle2, Upload, FileText, X, Database, Terminal, Search } from 'lucide-react';

const BODY_MODE_OPTIONS = [
  { value: 'none', label: 'none (no payload)' },
  { value: 'raw', label: 'raw (JSON, Text, XML...)' },
  { value: 'formdata', label: 'form-data (multipart)' },
  { value: 'urlencoded', label: 'x-www-form-urlencoded' },
  { value: 'binary', label: 'binary (file upload)' },
  { value: 'graphql', label: 'GraphQL Query' },
];

const RAW_TYPE_OPTIONS = [
  { value: 'json', label: 'JSON' },
  { value: 'text', label: 'Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'html', label: 'HTML' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
];

export const BodyEditor = ({ body = { mode: 'none' }, onChange }) => {
  const [jsonError, setJsonError] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchState, setSearchState] = useState({ query: '', matchCase: false, wholeWord: false, useRegex: false });
  const [currentMatchIdx, setCurrentMatchIndex] = useState(0);
  const containerRef = useRef(null);

  // Keyboard shortcut listener for Cmd + F / Ctrl + F strictly within BodyEditor container
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        const isFocusInside = containerRef.current && containerRef.current.contains(document.activeElement);
        if (isFocusInside && (body.mode === 'raw' || body.mode === 'graphql')) {
          e.preventDefault();
          e.stopPropagation();
          setIsSearchOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [body.mode]);

  const rawTextContent = body.rawType === 'json' || !body.rawType ? (body.json || body.raw || '') : (body.raw || '');

  // Calculate search matches
  const matches = useMemo(() => {
    const query = searchState.query;
    if (!query || !rawTextContent) return [];

    try {
      let flags = searchState.matchCase ? 'g' : 'gi';
      let pattern = query;

      if (!searchState.useRegex) {
        pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
      if (searchState.wholeWord) {
        pattern = `\\b${pattern}\\b`;
      }

      const regex = new RegExp(pattern, flags);
      const results = [];
      let match;
      while ((match = regex.exec(rawTextContent)) !== null) {
        results.push(match.index);
        if (regex.lastIndex === match.index) regex.lastIndex++;
      }
      return results;
    } catch (e) {
      return [];
    }
  }, [searchState, rawTextContent]);

  const handleNextMatch = () => {
    if (matches.length > 0) {
      setCurrentMatchIndex((prev) => (prev + 1) % matches.length);
    }
  };

  const handlePrevMatch = () => {
    if (matches.length > 0) {
      setCurrentMatchIndex((prev) => (prev - 1 + matches.length) % matches.length);
    }
  };

  const handleModeChange = (mode) => {
    onChange({ ...body, mode });
  };

  const handleRawTypeChange = (rawType) => {
    onChange({ ...body, rawType });
  };

  const handleJsonChange = (jsonStr) => {
    onChange({ ...body, json: jsonStr });
    try {
      if (jsonStr.trim()) {
        JSON.parse(jsonStr);
      }
      setJsonError(null);
    } catch (e) {
      setJsonError(e.message);
    }
  };

  const handleFormatJson = () => {
    try {
      if (body.json) {
        const parsed = JSON.parse(body.json);
        const formatted = JSON.stringify(parsed, null, 2);
        onChange({ ...body, json: formatted });
        setJsonError(null);
      }
    } catch (e) {
      setJsonError('Cannot format: ' + e.message);
    }
  };

  const handleBinaryFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange({
        ...body,
        binaryFile: {
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          fileObj: file,
        }
      });
    }
  };

  const handleClearBinaryFile = () => {
    onChange({ ...body, binaryFile: null });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      ref={containerRef}
      style={{ padding: '8px 12px', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}
    >
      {/* Floating Search Widget adjacent to the editor */}
      {isSearchOpen && (
        <div style={{ position: 'absolute', top: '38px', right: '12px', zIndex: 100 }}>
          <SearchWidget
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onSearch={(state) => {
              setSearchState(state);
              setCurrentMatchIndex(0);
            }}
            totalMatches={matches.length}
            currentMatchIndex={currentMatchIdx}
            onNextMatch={handleNextMatch}
            onPrevMatch={handlePrevMatch}
          />
        </div>
      )}

      {/* Sleek Sub-Header with Custom Body Type Dropdown */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '8px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            BODY TYPE:
          </span>
          <CustomSelect
            options={BODY_MODE_OPTIONS}
            value={body.mode || 'none'}
            onChange={handleModeChange}
            size="sm"
          />
        </div>

        {/* Sub-type & Format Action Bar for Raw mode */}
        {body.mode === 'raw' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            <CustomSelect
              options={RAW_TYPE_OPTIONS}
              value={body.rawType || 'json'}
              onChange={handleRawTypeChange}
              size="sm"
            />

            {(body.rawType === 'json' || !body.rawType) && (
              <>
                {jsonError ? (
                  <span style={{ color: '#EF4444', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={13} /> Invalid JSON
                  </span>
                ) : (
                  (body.json || body.raw)?.trim() && (
                    <span style={{ color: '#10B981', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} /> Valid JSON
                    </span>
                  )
                )}
                <button className="aether-btn sm" onClick={handleFormatJson} style={{ height: '26px', padding: '0 8px', fontSize: '11px' }}>
                  <Code2 size={12} /> Beautify
                </button>
              </>
            )}

            {/* Search Trigger Button */}
            <button
              className={`aether-btn sm ${isSearchOpen ? 'primary' : ''}`}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              title="Search Request Body (Cmd+F)"
              style={{ height: '26px', padding: '0 8px' }}
            >
              <Search size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Editor Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* 1. None Mode */}
        {body.mode === 'none' && (
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '24px 0', textAlign: 'center' }}>
            This request does not have a body payload. Select a body type above to add parameters.
          </div>
        )}

        {/* 2. Raw Mode (JSON, Text, JS, HTML, XML) */}
        {body.mode === 'raw' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {isSearchOpen && searchState.query ? (
              <div style={{
                flex: 1,
                minHeight: '160px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '8px',
                overflowY: 'auto'
              }}>
                <HighlightedTextView
                  text={rawTextContent}
                  searchState={searchState}
                  currentMatchIndex={currentMatchIdx}
                />
              </div>
            ) : (
              <textarea
                className="aether-input mono"
                value={rawTextContent}
                onChange={(e) => {
                  if (body.rawType === 'json' || !body.rawType) {
                    handleJsonChange(e.target.value);
                  } else {
                    onChange({ ...body, raw: e.target.value });
                  }
                }}
                placeholder={
                  body.rawType === 'json' || !body.rawType
                    ? `{\n  "name": "Restly",\n  "status": "active"\n}`
                    : body.rawType === 'xml'
                    ? `<request>\n  <key>value</key>\n</request>`
                    : 'Enter raw request body payload...'
                }
                rows={10}
                style={{ width: '100%', flex: 1, minHeight: '160px', resize: 'vertical', lineHeight: '1.5' }}
              />
            )}
          </div>
        )}

        {/* 3. Form-Data Mode */}
        {body.mode === 'formdata' && (
          <KeyValueEditor
            items={body.formdata || []}
            onChange={(items) => onChange({ ...body, formdata: items })}
            keyPlaceholder="Key"
            valuePlaceholder="Value or Select File"
            allowFile={true}
          />
        )}

        {/* 4. Urlencoded Mode */}
        {body.mode === 'urlencoded' && (
          <KeyValueEditor
            items={body.urlencoded || []}
            onChange={(items) => onChange({ ...body, urlencoded: items })}
            keyPlaceholder="Parameter Key"
            valuePlaceholder="Value"
          />
        )}

        {/* 5. Binary File Upload Mode */}
        {body.mode === 'binary' && (
          <div style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Upload size={14} color="var(--accent-primary)" />
              Binary Payload File
            </div>

            {body.binaryFile ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'var(--bg-tab)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} color="var(--accent-primary)" />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>{body.binaryFile.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {formatFileSize(body.binaryFile.size)} • {body.binaryFile.type || 'application/octet-stream'}
                    </div>
                  </div>
                </div>
                <button className="aether-btn sm" onClick={handleClearBinaryFile} title="Remove attached file">
                  <X size={12} color="#EF4444" /> Remove
                </button>
              </div>
            ) : (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '16px',
                border: '1px dashed var(--border-color)',
                borderRadius: '6px',
                cursor: 'pointer',
                background: 'var(--bg-tab)'
              }}>
                <Upload size={16} color="var(--text-muted)" />
                <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-main)' }}>Select Binary File...</span>
                <input type="file" onChange={handleBinaryFileChange} style={{ display: 'none' }} />
              </label>
            )}
          </div>
        )}

        {/* 6. GraphQL Mode */}
        {body.mode === 'graphql' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Database size={12} color="var(--accent-primary)" /> GraphQL Query
              </div>
              <textarea
                className="aether-input mono"
                value={body.graphqlQuery || ''}
                onChange={(e) => onChange({ ...body, graphqlQuery: e.target.value })}
                placeholder={`query GetUser {\n  user(id: "123") {\n    id\n    name\n  }\n}`}
                rows={5}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Terminal size={12} color="var(--accent-primary)" /> GraphQL Variables (JSON)
              </div>
              <textarea
                className="aether-input mono"
                value={body.graphqlVariables || ''}
                onChange={(e) => onChange({ ...body, graphqlVariables: e.target.value })}
                placeholder={`{\n  "id": "123"\n}`}
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
