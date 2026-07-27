import React, { useState } from 'react';
import { KeyValueEditor } from './KeyValueEditor';
import { AuthEditor } from './AuthEditor';
import { BodyEditor } from './BodyEditor';
import { InlineCurlImport } from './InlineCurlImport';
import { InlineCodeSnippet } from './InlineCodeSnippet';
import { parseCurlCommand } from '../utils/curlParser';
import { Send, Save, Code, Sliders, FileCode, Shield, Terminal } from 'lucide-react';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];

export const RequestBuilder = ({
  request,
  onChange,
  onSend,
  onSave,
  activeEnv,
  activeEnvVars = [],
  isLoading,
  heightPct = 48,
}) => {
  const [activeTab, setActiveTab] = useState('params');
  const [sidePanel, setSidePanel] = useState(null); // 'curl' | 'code' | null

  const handleMethodChange = (method) => {
    onChange({ ...request, method, isDirty: true });
  };

  const handleUrlChange = (url) => {
    onChange({ ...request, url, isDirty: true });
  };

  const handlePasteUrl = (e) => {
    const pastedText = e.clipboardData?.getData('text') || '';
    if (pastedText.trim().toLowerCase().startsWith('curl')) {
      e.preventDefault();
      try {
        const parsed = parseCurlCommand(pastedText);
        onChange({
          ...request,
          method: parsed.method || request.method,
          url: parsed.url || request.url,
          params: parsed.params?.length ? parsed.params : request.params,
          headers: parsed.headers?.length ? parsed.headers : request.headers,
          auth: parsed.auth?.type !== 'none' ? parsed.auth : request.auth,
          body: parsed.body?.mode !== 'none' ? parsed.body : request.body,
          isDirty: true,
        });
      } catch (err) {
        handleUrlChange(pastedText);
      }
    }
  };

  const activeParamsCount = (request.params || []).filter((p) => p.enabled !== false && p.key).length;
  const activeHeadersCount = (request.headers || []).filter((h) => h.enabled !== false && h.key).length;

  return (
    <div className="pane-request" style={{ height: `${heightPct}%`, minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
      {/* Method & URL Action Bar */}
      <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', background: 'var(--bg-tab)', borderBottom: '1px solid var(--border-color)' }}>
        {/* Method Select */}
        <select
          value={request.method || 'GET'}
          onChange={(e) => handleMethodChange(e.target.value)}
          className={`method-badge ${request.method || 'GET'}`}
          style={{
            height: '36px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            outline: 'none',
            paddingRight: '10px'
          }}
        >
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m} style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
              {m}
            </option>
          ))}
        </select>

        {/* URL Input with cURL Paste Detection */}
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            id="url-input-bar"
            type="text"
            className="aether-input mono"
            placeholder="Enter Request URL or paste cURL command (e.g. curl -X GET {{baseUrl}}/posts)"
            value={request.url || ''}
            onChange={(e) => handleUrlChange(e.target.value)}
            onPaste={handlePasteUrl}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                onSend();
              }
            }}
            style={{ width: '100%', height: '36px', fontSize: '13px' }}
          />
        </div>

        {/* Send Button */}
        <button
          className="aether-btn primary"
          onClick={onSend}
          disabled={isLoading}
          style={{ height: '36px', padding: '0 18px' }}
        >
          <Send size={14} />
          {isLoading ? 'Sending...' : 'Send'}
        </button>

        {/* Save Button */}
        <button
          className="aether-btn"
          onClick={onSave}
          title="Save Request"
          style={{ height: '36px' }}
        >
          <Save size={14} /> Save
        </button>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="tab-header-list" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex' }}>
          <button
            className={`sub-tab-btn ${activeTab === 'params' ? 'active' : ''}`}
            onClick={() => setActiveTab('params')}
          >
            <Sliders size={13} />
            Params
            {activeParamsCount > 0 && <span className="sub-tab-count">{activeParamsCount}</span>}
          </button>

          <button
            className={`sub-tab-btn ${activeTab === 'headers' ? 'active' : ''}`}
            onClick={() => setActiveTab('headers')}
          >
            <FileCode size={13} />
            Headers
            {activeHeadersCount > 0 && <span className="sub-tab-count">{activeHeadersCount}</span>}
          </button>

          <button
            className={`sub-tab-btn ${activeTab === 'auth' ? 'active' : ''}`}
            onClick={() => setActiveTab('auth')}
          >
            <Shield size={13} />
            Auth {request.auth?.type !== 'none' && <span className="sub-tab-count">•</span>}
          </button>

          <button
            className={`sub-tab-btn ${activeTab === 'body' ? 'active' : ''}`}
            onClick={() => setActiveTab('body')}
          >
            <Code size={13} />
            Body {request.body?.mode !== 'none' && <span className="sub-tab-count">•</span>}
          </button>
        </div>

        {/* Section Toggles adjacent to sub-tabs */}
        <div style={{ display: 'flex', gap: '4px', paddingRight: '12px' }}>
          <button
            className={`sub-tab-btn ${sidePanel === 'curl' ? 'active' : ''}`}
            onClick={() => setSidePanel(sidePanel === 'curl' ? null : 'curl')}
            title="Toggle Import cURL Section"
            style={{ fontSize: '11px', padding: '6px 10px' }}
          >
            <Terminal size={12} /> Import cURL
          </button>
          <button
            className={`sub-tab-btn ${sidePanel === 'code' ? 'active' : ''}`}
            onClick={() => setSidePanel(sidePanel === 'code' ? null : 'code')}
            title="Toggle Code Snippets Section"
            style={{ fontSize: '11px', padding: '6px 10px' }}
          >
            <Code size={12} /> Code Snippets
          </button>
        </div>
      </div>

      {/* Main Content Area Split View */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Side: Params, Headers, Auth, Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          borderRight: sidePanel ? '1px solid var(--border-color)' : 'none'
        }}>
          {activeTab === 'params' && (
            <KeyValueEditor
              items={request.params || []}
              onChange={(params) => onChange({ ...request, params, isDirty: true })}
              keyPlaceholder="Query Parameter Key"
              valuePlaceholder="Value"
            />
          )}

          {activeTab === 'headers' && (
            <KeyValueEditor
              items={request.headers || []}
              onChange={(headers) => onChange({ ...request, headers, isDirty: true })}
              keyPlaceholder="Header Name (e.g. Content-Type)"
              valuePlaceholder="Header Value"
            />
          )}

          {activeTab === 'auth' && (
            <AuthEditor
              auth={request.auth}
              onChange={(auth) => onChange({ ...request, auth, isDirty: true })}
            />
          )}

          {activeTab === 'body' && (
            <BodyEditor
              body={request.body}
              onChange={(body) => onChange({ ...request, body, isDirty: true })}
            />
          )}
        </div>

        {/* Right Side: Inline cURL or Inline Code Snippet */}
        {sidePanel && (
          <div style={{
            width: '380px',
            maxWidth: '45%',
            background: 'var(--bg-tab)',
            padding: '12px 16px',
            boxSizing: 'border-box',
            overflowY: 'auto',
            borderLeft: '1px solid var(--border-color)'
          }}>
            {sidePanel === 'curl' && (
              <InlineCurlImport
                onImport={(parsed) => {
                  onChange({
                    ...request,
                    method: parsed.method || request.method,
                    url: parsed.url || request.url,
                    params: parsed.params?.length ? parsed.params : request.params,
                    headers: parsed.headers?.length ? parsed.headers : request.headers,
                    auth: parsed.auth?.type !== 'none' ? parsed.auth : request.auth,
                    body: parsed.body?.mode !== 'none' ? parsed.body : request.body,
                    isDirty: true,
                  });
                  setSidePanel(null);
                }}
                onClose={() => setSidePanel(null)}
              />
            )}

            {sidePanel === 'code' && (
              <InlineCodeSnippet
                request={request}
                envVariables={activeEnvVars}
                onClose={() => setSidePanel(null)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
