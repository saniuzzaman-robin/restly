import React, { useState } from 'react';
import { KeyValueEditor } from './KeyValueEditor';
import { AuthEditor } from './AuthEditor';
import { BodyEditor } from './BodyEditor';
import { RequestSettingsEditor } from './RequestSettingsEditor';
import { ScriptsEditor } from './ScriptsEditor';
import { CookiesModal } from './CookiesModal';
import { InlineCurlImport } from './InlineCurlImport';
import { InlineCodeSnippet } from './InlineCodeSnippet';
import { CustomSelect } from './CustomSelect';
import { parseCurlCommand } from '../utils/curlParser';
import { Send, Save, Code, Sliders, FileCode, Shield, Terminal, Cookie, Settings, Code2 } from 'lucide-react';

const HTTP_METHOD_OPTIONS = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'OPTIONS', label: 'OPTIONS' },
  { value: 'HEAD', label: 'HEAD' },
];

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
  const [isCookiesOpen, setIsCookiesOpen] = useState(false);

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
        {/* Beautiful Custom Method Select */}
        <CustomSelect
          options={HTTP_METHOD_OPTIONS}
          value={request.method || 'GET'}
          onChange={handleMethodChange}
          variant="method"
          style={{ width: '110px' }}
        />

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

      {/* Sub-Tab Navigation Bar with Cookies & Settings Tabs */}
      <div className="tab-header-list" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
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

          <button
            className={`sub-tab-btn ${activeTab === 'scripts' ? 'active' : ''}`}
            onClick={() => setActiveTab('scripts')}
          >
            <Code2 size={13} />
            Scripts {(request.preRequestScript || request.testScript) && <span className="sub-tab-count">•</span>}
          </button>

          <button
            className={`sub-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={13} />
            Settings
          </button>

          {/* Cookies Button alongside sub-tabs as in Postman */}
          <button
            className="sub-tab-btn"
            onClick={() => setIsCookiesOpen(true)}
            title="Manage Domain Cookies"
            style={{ color: 'var(--accent-primary)', fontWeight: '600' }}
          >
            <Cookie size={13} />
            Cookies
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
        {/* Left Side: Params, Headers, Auth, Body, Scripts, Settings */}
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

          {activeTab === 'scripts' && (
            <ScriptsEditor
              preRequestScript={request.preRequestScript || ''}
              testScript={request.testScript || ''}
              onChangePreRequest={(script) => onChange({ ...request, preRequestScript: script, isDirty: true })}
              onChangeTest={(script) => onChange({ ...request, testScript: script, isDirty: true })}
            />
          )}

          {activeTab === 'settings' && (
            <RequestSettingsEditor
              settings={request.settings}
              onChange={(settings) => onChange({ ...request, settings, isDirty: true })}
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

      {/* Cookies Management Modal */}
      <CookiesModal
        isOpen={isCookiesOpen}
        onClose={() => setIsCookiesOpen(false)}
      />
    </div>
  );
};
