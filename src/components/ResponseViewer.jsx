import React, { useState } from 'react';
import { JsonPrettyViewer } from './JsonPrettyViewer';
import { Copy, Download, Search, Check, AlertCircle, Clock, HardDrive, Terminal, Globe, ExternalLink } from 'lucide-react';

export const ResponseViewer = ({ response, isLoading }) => {
  const [activeTab, setActiveTab] = useState('pretty');
  const [copied, setCopied] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  if (isLoading) {
    return (
      <div className="pane-response" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px auto'
          }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-main)' }}>Sending HTTP Request...</div>
          <div style={{ fontSize: '11px', marginTop: '4px' }}>Resolving variables and awaiting server response</div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="pane-response" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
        <div style={{ textAlign: 'center', maxWidth: '320px' }}>
          <Terminal size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>No Response Yet</div>
          <div style={{ fontSize: '12px', marginTop: '6px' }}>Click <strong>Send</strong> or press <kbd style={{ background: 'var(--bg-card)', padding: '2px 5px', borderRadius: '3px' }}>Cmd/Ctrl + Enter</kbd> to execute this API request.</div>
        </div>
      </div>
    );
  }

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return '#10B981';
    if (status >= 300 && status < 400) return '#2563EB';
    if (status >= 400 && status < 500) return '#F59E0B';
    return '#EF4444';
  };

  const copyToClipboard = () => {
    const textToCopy = typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.rawText;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const text = typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.rawText;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `response_${Date.now()}.${response.isJson ? 'json' : 'txt'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Test assertions calculation
  const assertions = [
    { name: 'Status code is 200 OK', passed: response.status === 200 },
    { name: 'Response time is under 1000ms', passed: response.durationMs < 1000 },
    { name: 'Response is valid JSON payload', passed: response.isJson },
    { name: 'Content-Type header exists', passed: response.headers?.some(h => h.key.toLowerCase() === 'content-type') },
  ];
  const passedCount = assertions.filter(a => a.passed).length;

  // Filter json or raw text if search active
  let displayBody = response.rawText;
  if (response.isJson && response.data) {
    displayBody = JSON.stringify(response.data, null, 2);
  }

  if (searchFilter.trim() && displayBody) {
    displayBody = displayBody
      .split('\n')
      .filter((line) => line.toLowerCase().includes(searchFilter.toLowerCase()))
      .join('\n');
  }

  // Generate styled document for iframe preview
  const generatePreviewDoc = () => {
    if (response.isJson && response.data) {
      const formattedJson = JSON.stringify(response.data, null, 2);
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <style>
            body {
              margin: 0;
              padding: 20px;
              background-color: #0F172A;
              color: #F8FAFC;
              font-family: 'JetBrains Mono', SFMono-Regular, Consolas, monospace;
              font-size: 13px;
              line-height: 1.6;
            }
            .card {
              background: #1E293B;
              border: 1px solid #334155;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }
            pre {
              margin: 0;
              white-space: pre-wrap;
              word-break: break-all;
              color: #38BDF8;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <pre>${formattedJson}</pre>
          </div>
        </body>
        </html>
      `;
    }

    if (response.rawText && (response.rawText.includes('<html') || response.rawText.includes('<body') || response.rawText.includes('<!DOCTYPE'))) {
      return response.rawText;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <style>
          body {
            margin: 0;
            padding: 20px;
            background-color: #F8FAFC;
            color: #0F172A;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 13px;
            line-height: 1.6;
          }
          pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-all;
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            padding: 16px;
            border-radius: 6px;
          }
        </style>
      </head>
      <body>
        <pre>${response.rawText || 'No Content'}</pre>
      </body>
      </html>
    `;
  };

  return (
    <div className="pane-response">
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              color: 'var(--text-muted)',
              textTransform: 'uppercase'
            }}>
              STATUS:
            </span>
            <span style={{
              background: `${getStatusColor(response.status)}18`,
              color: getStatusColor(response.status),
              border: `1px solid ${getStatusColor(response.status)}44`,
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: '700',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)'
            }}>
              {response.status} {response.statusText}
            </span>
          </div>

          {/* Time Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '12px' }}>
            <Clock size={13} />
            <span>{response.durationMs} ms</span>
          </div>

          {/* Size Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '12px' }}>
            <HardDrive size={13} />
            <span>{formatSize(response.sizeBytes)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="aether-btn sm" onClick={copyToClipboard} title="Copy response to clipboard">
            {copied ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button className="aether-btn sm" onClick={downloadFile} title="Download response file">
            <Download size={13} /> Save
          </button>
        </div>
      </div>

      {/* Response Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tab)', paddingRight: '12px' }}>
        <div style={{ display: 'flex' }}>
          {[
            { id: 'pretty', label: 'Pretty' },
            { id: 'raw', label: 'Raw' },
            { id: 'preview', label: 'Preview' },
            { id: 'headers', label: `Headers (${response.headers?.length || 0})` },
            { id: 'tests', label: `Tests (${passedCount}/${assertions.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`sub-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {(activeTab === 'pretty' || activeTab === 'raw') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-input)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            <Search size={12} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search response..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '11px', outline: 'none', width: '120px' }}
            />
          </div>
        )}
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
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <AlertCircle size={16} color="#EF4444" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '2px', color: '#EF4444' }}>Request Execution Error</strong>
              {response.errorMessage}
            </div>
          </div>
        )}

        {activeTab === 'pretty' && (
          <JsonPrettyViewer data={response.data} rawText={displayBody || response.rawText} />
        )}

        {activeTab === 'raw' && (
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-main)', lineHeight: '1.5' }}>
            {displayBody || response.rawText || 'Empty Response Body'}
          </pre>
        )}

        {activeTab === 'preview' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: '320px',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            overflow: 'hidden',
            background: 'var(--bg-card)'
          }}>
            {/* Browser Frame Window Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: 'var(--bg-tab)',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '3px 10px',
                fontSize: '11px',
                color: 'var(--text-muted)',
                width: '60%',
                maxWidth: '400px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                <Globe size={12} color="var(--text-muted)" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {response.url || 'http://localhost'}
                </span>
              </div>

              <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase' }}>
                {response.isJson ? 'JSON Render' : 'HTML View'}
              </span>
            </div>

            {/* Iframe Viewport */}
            <iframe
              title="Response Preview"
              srcDoc={generatePreviewDoc()}
              style={{
                flex: 1,
                width: '100%',
                minHeight: '280px',
                border: 'none',
                background: 'transparent'
              }}
            />
          </div>
        )}

        {activeTab === 'headers' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '11px' }}>
                <th style={{ padding: '6px 12px' }}>HEADER</th>
                <th style={{ padding: '6px 12px' }}>VALUE</th>
              </tr>
            </thead>
            <tbody>
              {(response.headers || []).map((h, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '6px 12px', color: 'var(--accent-primary)', fontWeight: '500' }}>{h.key}</td>
                  <td style={{ padding: '6px 12px', color: 'var(--text-main)', wordBreak: 'break-all' }}>{h.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'tests' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {assertions.map((ast, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: ast.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${ast.passed ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                }}
              >
                {ast.passed ? <Check size={14} color="#10B981" /> : <AlertCircle size={14} color="#EF4444" />}
                <span style={{ color: ast.passed ? '#10B981' : '#EF4444', fontWeight: '500' }}>
                  {ast.passed ? 'PASS' : 'FAIL'}
                </span>
                <span style={{ color: 'var(--text-main)' }}>: {ast.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
