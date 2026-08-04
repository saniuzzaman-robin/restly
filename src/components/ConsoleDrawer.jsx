import React, { useState } from 'react';
import { Terminal, Trash2, ChevronUp, ChevronDown, Clock, Globe, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';

export const ConsoleDrawer = ({ isOpen, onClose, logs = [], onClearLogs }) => {
  const [selectedLog, setSelectedLog] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (!searchFilter) return true;
    const query = searchFilter.toLowerCase();
    return (
      log.url?.toLowerCase().includes(query) ||
      log.method?.toLowerCase().includes(query) ||
      String(log.status).includes(query)
    );
  });

  return (
    <div style={{
      position: 'fixed',
      bottom: '28px', // height of footer
      left: 0,
      right: 0,
      height: '280px',
      background: 'var(--bg-surface)',
      borderTop: '2px solid var(--border-color)',
      zIndex: 900,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.3)',
      fontFamily: 'var(--font-mono)'
    }}>
      {/* Console Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 16px',
        background: 'var(--bg-tab)',
        borderBottom: '1px solid var(--border-color)',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={14} color="var(--accent-primary)" />
          <span style={{ color: 'var(--text-main)', letterSpacing: '0.5px' }}>POSTMAN CONSOLE LOGS ({logs.length})</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            className="aether-input"
            placeholder="Filter logs..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{ fontSize: '11px', padding: '2px 8px', height: '24px', width: '140px' }}
          />
          <button className="aether-btn sm" onClick={onClearLogs} title="Clear console logs">
            <Trash2 size={12} color="#EF4444" /> Clear
          </button>
          <button className="aether-btn sm" onClick={onClose} title="Close console">
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Console Body Split View */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Side: Log Entries List */}
        <div style={{ flex: 1, overflowY: 'auto', borderRight: selectedLog ? '1px solid var(--border-color)' : 'none' }}>
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedLog(log)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 16px',
                  borderBottom: '1px solid var(--border-color)',
                  background: selectedLog === log ? 'var(--bg-card)' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                <span className={`method-badge ${log.method}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {log.method}
                </span>

                <span style={{
                  color: log.status >= 200 && log.status < 300 ? '#10B981' : log.status >= 400 ? '#EF4444' : '#2563EB',
                  fontWeight: '700'
                }}>
                  {log.status || 'ERR'}
                </span>

                <span style={{ flex: 1, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.url}
                </span>

                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                  {log.durationMs} ms
                </span>

                <span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No network request logs captured yet. Send HTTP requests to inspect live console outputs.
            </div>
          )}
        </div>

        {/* Right Side: Selected Log Detail */}
        {selectedLog && (
          <div style={{ width: '480px', overflowY: 'auto', padding: '12px 16px', background: 'var(--bg-tab)', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontWeight: '700', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>NETWORK REQUEST DETAILS</span>
              <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={12} />
              </button>
            </div>

            <div style={{ color: 'var(--text-main)', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`method-badge ${selectedLog.method || 'GET'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                {selectedLog.method || 'GET'}
              </span>
              <span>{selectedLog.url}</span>
            </div>

            <div style={{ color: 'var(--text-main)' }}>
              <strong>Status:</strong>{' '}
              <span style={{ color: selectedLog.status >= 200 && selectedLog.status < 300 ? '#10B981' : '#EF4444', fontWeight: '700' }}>
                {selectedLog.status} {selectedLog.statusText}
              </span>{' '}
              ({selectedLog.durationMs} ms)
            </div>

            {/* Request Headers */}
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Request Headers:</strong>
              <pre style={{ background: 'var(--bg-surface)', padding: '8px', borderRadius: '4px', overflowX: 'auto', marginTop: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '10px' }}>
                {selectedLog.requestHeaders && Object.keys(selectedLog.requestHeaders).length > 0
                  ? JSON.stringify(selectedLog.requestHeaders, null, 2)
                  : '(No request headers specified)'}
              </pre>
            </div>

            {/* Request Body Payload */}
            {selectedLog.requestBody && (
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Request Body Payload:</strong>
                <pre style={{ background: 'var(--bg-surface)', padding: '8px', borderRadius: '4px', overflowX: 'auto', marginTop: '4px', maxHeight: '100px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '10px' }}>
                  {typeof selectedLog.requestBody === 'string' ? selectedLog.requestBody : JSON.stringify(selectedLog.requestBody, null, 2)}
                </pre>
              </div>
            )}

            {/* Response Body Snippet */}
            {selectedLog.rawText && (
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Response Body Snippet:</strong>
                <pre style={{ background: 'var(--bg-surface)', padding: '8px', borderRadius: '4px', overflowX: 'auto', marginTop: '4px', maxHeight: '100px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '10px' }}>
                  {selectedLog.rawText.substring(0, 1000)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
