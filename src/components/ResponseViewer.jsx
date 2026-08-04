import React, { useState, useEffect, useMemo, useRef } from 'react';
import { JsonPrettyViewer } from './JsonPrettyViewer';
import { VisualizerViewer } from './VisualizerViewer';
import { CustomSelect } from './CustomSelect';
import { SearchWidget } from './SearchWidget';
import { HighlightedTextView } from './HighlightedTextView';
import { Copy, Download, Search, Check, AlertCircle, Clock, HardDrive, Terminal, Layers, Eye, Cookie, AlignLeft, FileCode, FileText } from 'lucide-react';

const BODY_VIEW_OPTIONS = [
  { value: 'pretty', label: 'Body: Pretty' },
  { value: 'raw', label: 'Body: Raw' },
  { value: 'hex', label: 'Body: Hex' },
];

const RESPONSE_FORMAT_OPTIONS = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'html', label: 'HTML' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'base64', label: 'Base64 Decoded' },
  { value: 'text', label: 'Text' },
];

/**
 * Decodes and renders Base64 encoded payload strings
 */
const Base64Viewer = ({ text = '' }) => {
  const decodedResult = useMemo(() => {
    if (!text) return null;
    const cleanStr = text.trim().replace(/\s+/g, '');
    try {
      const decoded = atob(cleanStr);
      return decoded;
    } catch (e) {
      return null;
    }
  }, [text]);

  if (!text) {
    return <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No base64 data to decode</div>;
  }

  if (decodedResult === null) {
    return (
      <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#EF4444', fontSize: '12px' }}>
        <strong>Base64 Decoding Error:</strong> The response string is not valid Base64 encoded data.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
        ✓ Decoded Base64 Payload ({decodedResult.length} bytes)
      </div>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-main)', fontFamily: 'var(--font-mono)', background: 'var(--bg-tab)', padding: '12px', borderRadius: '6px' }}>
        {decodedResult}
      </pre>
    </div>
  );
};

/**
 * Format Hex View for response body inspection
 */
const HexViewer = ({ text = '' }) => {
  const hexLines = useMemo(() => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text.slice(0, 4096)); // Limit preview to 4KB
    const lines = [];

    for (let i = 0; i < bytes.length; i += 16) {
      const chunk = bytes.slice(i, i + 16);
      const offset = i.toString(16).padStart(8, '0');
      const hex = Array.from(chunk)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' ');
      const paddedHex = hex.padEnd(47, ' ');
      const ascii = Array.from(chunk)
        .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
        .join('');

      lines.push(`${offset}  ${paddedHex}  |${ascii}|`);
    }

    return lines;
  }, [text]);

  if (!text) {
    return <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No response data for Hex view</div>;
  }

  return (
    <pre style={{
      margin: 0,
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      lineHeight: '1.5',
      color: 'var(--text-main)',
      background: 'var(--bg-tab)',
      padding: '12px',
      borderRadius: '6px',
      overflowX: 'auto'
    }}>
      {hexLines.join('\n')}
    </pre>
  );
};

export const ResponseViewer = ({ response, activeTab: externalTab, onTabChange }) => {
  const [bodyViewMode, setBodyViewMode] = useState('pretty'); // 'pretty' | 'raw' | 'hex'
  const [internalTab, setInternalTab] = useState('body'); // 'body' | 'preview' | 'visualize' | 'headers' | 'cookies'
  const [formatMode, setFormatMode] = useState('auto');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchState, setSearchFilterState] = useState({ query: '', matchCase: false, wholeWord: false, useRegex: false });
  const [currentMatchIdx, setCurrentMatchIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const paneRef = useRef(null);

  const activeTab = externalTab || internalTab;
  const setActiveTab = (tab) => {
    if (onTabChange) onTabChange(tab);
    else setInternalTab(tab);
  };

  // Keyboard shortcut listener for Cmd + F / Ctrl + F strictly when response pane is hovered or focused
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        const isFocusInside = paneRef.current && paneRef.current.contains(document.activeElement);
        if (isHovered || isFocusInside) {
          e.preventDefault();
          e.stopPropagation();
          setIsSearchOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isHovered]);

  // Calculate search matches in rawText (Hook MUST be called unconditionally at top level)
  const matches = useMemo(() => {
    const query = searchState.query;
    const rawText = response?.rawText;
    if (!query || !rawText) return [];

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
      while ((match = regex.exec(rawText)) !== null) {
        results.push(match.index);
        if (regex.lastIndex === match.index) regex.lastIndex++;
      }
      return results;
    } catch (e) {
      return [];
    }
  }, [searchState, response?.rawText]);

  if (!response) {
    return (
      <div className="pane-response" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <Terminal size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
          <div style={{ fontSize: '13px', fontWeight: '500' }}>No Response Yet</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Send a request or press <span style={{ fontFamily: 'var(--font-mono)' }}>Cmd+Enter</span> to view response details
          </div>
        </div>
      </div>
    );
  }

  const handleCopyResponse = () => {
    const textToCopy = typeof response.data === 'object'
      ? JSON.stringify(response.data, null, 2)
      : (response.rawText || '');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadResponse = () => {
    const blob = new Blob([response.rawText || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response-${Date.now()}.${response.isJson ? 'json' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

  const renderStatusBadge = () => {
    const status = response.status || 0;
    let bg = 'rgba(239, 68, 68, 0.15)';
    let color = '#EF4444';

    if (status >= 200 && status < 300) {
      bg = 'rgba(16, 185, 129, 0.15)';
      color = '#10B981';
    } else if (status >= 300 && status < 400) {
      bg = 'rgba(59, 130, 246, 0.15)';
      color = '#3B82F6';
    } else if (status >= 400 && status < 500) {
      bg = 'rgba(245, 158, 11, 0.15)';
      color = '#F59E0B';
    }

    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: bg,
        color: color,
        padding: '2px 8px',
        borderRadius: '4px',
        fontWeight: '700',
        fontSize: '12px',
        fontFamily: 'var(--font-mono)'
      }}>
        <span>{status || 'ERR'}</span>
        <span>{response.statusText || 'Error'}</span>
      </div>
    );
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      ref={paneRef}
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="pane-response"
      style={{ position: 'relative', outline: 'none' }}
    >
      {/* Floating Search Widget adjacent to the response toolbar */}
      {isSearchOpen && (
        <div style={{ position: 'absolute', top: '38px', right: '12px', zIndex: 100 }}>
          <SearchWidget
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onSearch={(state) => {
              setSearchFilterState(state);
              setCurrentMatchIndex(0);
            }}
            totalMatches={matches.length}
            currentMatchIndex={currentMatchIdx}
            onNextMatch={handleNextMatch}
            onPrevMatch={handlePrevMatch}
          />
        </div>
      )}

      {/* Response Bar Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-tab)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Status Badge */}
          {renderStatusBadge()}

          {/* Time & Size */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} /> {response.durationMs || 0} ms
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HardDrive size={12} /> {formatSize(response.sizeBytes)}
            </span>
          </div>
        </div>

        {/* Quick Copy / Download Buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="aether-btn sm"
            onClick={handleCopyResponse}
            title="Copy Full Response Body"
          >
            {copied ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            className="aether-btn sm"
            onClick={handleDownloadResponse}
            title="Download Response File"
          >
            <Download size={12} /> Download
          </button>
        </div>
      </div>

      {/* Postman Style View Tabs Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tab)', paddingRight: '12px', paddingLeft: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* 1. Body View Dropdown (Pretty, Raw, Hex) */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CustomSelect
              options={BODY_VIEW_OPTIONS}
              value={bodyViewMode}
              onChange={(val) => {
                setBodyViewMode(val);
                setActiveTab('body');
              }}
              size="sm"
              style={{ width: '130px' }}
            />
          </div>

          <div style={{ width: '1px', height: '16px', background: 'var(--border-color)', margin: '0 4px' }}></div>

          {/* 2. Preview Button */}
          <button
            className={`sub-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>

          {/* 3. Visualize Button */}
          <button
            className={`sub-tab-btn ${activeTab === 'visualize' ? 'active' : ''}`}
            onClick={() => setActiveTab('visualize')}
          >
            Visualize
          </button>

          {/* 4. Headers Button */}
          <button
            className={`sub-tab-btn ${activeTab === 'headers' ? 'active' : ''}`}
            onClick={() => setActiveTab('headers')}
          >
            Headers ({response.headers?.length || 0})
          </button>

          {/* 5. Cookies Button */}
          <button
            className={`sub-tab-btn ${activeTab === 'cookies' ? 'active' : ''}`}
            onClick={() => setActiveTab('cookies')}
          >
            Cookies ({response.cookies?.length || 0})
          </button>
        </div>

        {/* Search & Format Sub-Type Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {(activeTab === 'body' && bodyViewMode === 'pretty') && (
            <CustomSelect
              options={RESPONSE_FORMAT_OPTIONS}
              value={formatMode}
              onChange={setFormatMode}
              size="sm"
              style={{ width: '150px' }}
            />
          )}

          {/* Search Icon Trigger Button */}
          <button
            className={`aether-btn sm ${isSearchOpen ? 'primary' : ''}`}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            title="Search Response Body (Cmd+F)"
            style={{ padding: '4px 8px' }}
          >
            <Search size={13} />
          </button>
        </div>
      </div>

      {/* Response Content View */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
        {!response.success && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            padding: '12px',
            color: '#EF4444',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <div>
              <strong>Execution Error:</strong> {response.errorMessage || 'Failed to execute HTTP request'}
            </div>
          </div>
        )}

        {/* BODY TABS (PRETTY / RAW / HEX) */}
        {activeTab === 'body' && (
          <>
            {bodyViewMode === 'pretty' && (
              formatMode === 'base64' ? (
                <Base64Viewer text={response.rawText || ''} />
              ) : isSearchOpen && searchState.query ? (
                <HighlightedTextView
                  text={typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : (response.rawText || '')}
                  searchState={searchState}
                  currentMatchIndex={currentMatchIdx}
                />
              ) : response.isJson || typeof response.data === 'object' ? (
                <JsonPrettyViewer data={response.data} rawText={response.rawText} />
              ) : (
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-main)' }}>
                  {response.rawText || 'No Content'}
                </pre>
              )
            )}

            {bodyViewMode === 'raw' && (
              <HighlightedTextView
                text={response.rawText || ''}
                searchState={searchState}
                currentMatchIndex={currentMatchIdx}
              />
            )}

            {bodyViewMode === 'hex' && (
              <HexViewer text={response.rawText || ''} />
            )}
          </>
        )}

        {/* PREVIEW TAB */}
        {activeTab === 'preview' && (
          <div style={{ height: '100%', minHeight: '300px', background: '#FFFFFF', borderRadius: '6px', overflow: 'hidden' }}>
            <iframe
              title="HTML Response Preview"
              srcDoc={response.rawText || ''}
              style={{ width: '100%', height: '100%', border: 'none', minHeight: '300px' }}
              sandbox=""
            />
          </div>
        )}

        {/* VISUALIZE TAB */}
        {activeTab === 'visualize' && (
          <VisualizerViewer data={response.data} rawText={response.rawText} />
        )}

        {/* HEADERS TAB */}
        {activeTab === 'headers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Request Headers Section */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>
                Request Headers ({response.requestHeaders ? Object.keys(response.requestHeaders).length : 0})
              </div>
              {response.requestHeaders && Object.keys(response.requestHeaders).length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '6px 12px', width: '35%' }}>KEY</th>
                      <th style={{ padding: '6px 12px' }}>VALUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(response.requestHeaders).map(([k, v], idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '6px 12px', color: 'var(--accent-primary)', fontWeight: '600' }}>{k}</td>
                        <td style={{ padding: '6px 12px', color: 'var(--text-main)', wordBreak: 'break-all' }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 12px' }}>No request headers specified.</div>
              )}
            </div>

            {/* Response Headers Section */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>
                Response Headers ({response.headers?.length || 0})
              </div>
              {(response.headers || []).length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '6px 12px', width: '35%' }}>KEY</th>
                      <th style={{ padding: '6px 12px' }}>VALUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(response.headers || []).map((h, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '6px 12px', color: 'var(--accent-primary)', fontWeight: '600' }}>{h.key}</td>
                        <td style={{ padding: '6px 12px', color: 'var(--text-main)', wordBreak: 'break-all' }}>{h.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 12px' }}>No response headers received.</div>
              )}
            </div>
          </div>
        )}

        {/* COOKIES TAB */}
        {activeTab === 'cookies' && (
          <div>
            {(response.cookies || []).length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                No response cookies set by this request.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '6px 12px' }}>NAME</th>
                    <th style={{ padding: '6px 12px' }}>VALUE</th>
                    <th style={{ padding: '6px 12px' }}>DOMAIN</th>
                    <th style={{ padding: '6px 12px' }}>PATH</th>
                  </tr>
                </thead>
                <tbody>
                  {(response.cookies || []).map((c, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '6px 12px', color: 'var(--accent-primary)', fontWeight: '600' }}>{c.name}</td>
                      <td style={{ padding: '6px 12px', color: 'var(--text-main)', wordBreak: 'break-all' }}>{c.value}</td>
                      <td style={{ padding: '6px 12px', color: 'var(--text-muted)' }}>{c.domain}</td>
                      <td style={{ padding: '6px 12px', color: 'var(--text-muted)' }}>{c.path || '/'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
