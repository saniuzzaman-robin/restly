import React, { useState } from 'react';
import { ScrollableTabsContainer } from './ScrollableTabsContainer';
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
import { Send, Save, Code, Sliders, FileCode, Shield, Terminal, Cookie, Settings, Code2, XCircle, RotateCcw } from 'lucide-react';

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
  onCancel,
  onSave,
  onRevert,
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
          method: parsed.method || 'GET',
          url: parsed.url || '',
          params: parsed.params || [],
          headers: parsed.headers || [],
          auth: parsed.auth || { type: 'none' },
          body: parsed.body || { mode: 'none', json: '', raw: '' },
          isDirty: true,
        });
      } catch (err) {
        handleUrlChange(pastedText);
      }
    }
  };

  const handleSelectSubTab = (tabName) => {
    setActiveTab(tabName);
  };

  const activeParamsCount = (request.params || []).filter((p) => p.enabled !== false && p.key).length;
  const activeHeadersCount = (request.headers || []).filter((h) => h.enabled !== false && h.key).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: `${heightPct}%`, minHeight: '180px', position: 'relative', overflow: 'hidden' }}>
      {/* Top Address & Method Toolbar */}
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
        {/* Method Selector */}
        <CustomSelect
          options={HTTP_METHOD_OPTIONS}
          value={request.method || 'GET'}
          onChange={(val) => onChange({ ...request, method: val, isDirty: true })}
          variant="method"
          style={{ width: '105px', flexShrink: 0 }}
        />

        {/* URL Address Input */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            id="url-input-bar"
            type="text"
            className="aether-input mono"
            placeholder="Enter Request URL or paste cURL command (e.g. curl -X GET {{baseUrl}}/posts)"
            value={request.url || ''}
            onChange={(e) => onChange({ ...request, url: e.target.value, isDirty: true })}
            onPaste={handlePasteUrl}
            style={{ width: '100%', fontSize: '12px', paddingRight: '28px' }}
          />
        </div>

        {/* Send & Cancel Buttons */}
        {isLoading ? (
          <button
            type="button"
            className="aether-btn danger"
            onClick={onCancel}
            title="Cancel Active Request"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <XCircle size={14} /> Cancel
          </button>
        ) : (
          <button
            type="button"
            className="aether-btn primary"
            onClick={onSend}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Send size={14} /> Send
          </button>
        )}

        {/* Save / Revert Buttons */}
        {request.isDirty && onRevert && (
          <button
            type="button"
            className="aether-btn"
            onClick={onRevert}
            title="Revert changes to last saved state"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={14} /> Revert
          </button>
        )}

        <button
          type="button"
          className="aether-btn"
          onClick={onSave}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Save size={14} /> Save
        </button>
      </div>

      {/* Sub-Tab Navigation Header */}
      <div className="tab-header-list" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 0, width: '100%' }}>
        <ScrollableTabsContainer style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className={`sub-tab-btn ${activeTab === 'params' ? 'active' : ''}`}
              onClick={() => handleSelectSubTab('params')}
            >
              <Sliders size={13} />
              Params
              {activeParamsCount > 0 && <span className="sub-tab-count">{activeParamsCount}</span>}
            </button>

            <button
              className={`sub-tab-btn ${activeTab === 'headers' ? 'active' : ''}`}
              onClick={() => handleSelectSubTab('headers')}
            >
              <FileCode size={13} />
              Headers
              {activeHeadersCount > 0 && <span className="sub-tab-count">{activeHeadersCount}</span>}
            </button>

            <button
              className={`sub-tab-btn ${activeTab === 'auth' ? 'active' : ''}`}
              onClick={() => handleSelectSubTab('auth')}
            >
              <Shield size={13} />
              Auth
            </button>

            <button
              className={`sub-tab-btn ${activeTab === 'body' ? 'active' : ''}`}
              onClick={() => handleSelectSubTab('body')}
            >
              <Code2 size={13} />
              Body
            </button>

            <button
              className={`sub-tab-btn ${activeTab === 'scripts' ? 'active' : ''}`}
              onClick={() => handleSelectSubTab('scripts')}
            >
              <Terminal size={13} />
              Scripts
            </button>

            <button
              className={`sub-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleSelectSubTab('settings')}
            >
              <Settings size={13} />
              Settings
            </button>

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
        </ScrollableTabsContainer>

        {/* Action Panel Buttons (Import cURL, Code Snippets) */}
        <div style={{ display: 'flex', gap: '6px', paddingRight: '12px', flexShrink: 0 }}>
          <button
            className={`aether-btn sm ${sidePanel === 'curl' ? 'primary' : ''}`}
            onClick={() => setSidePanel(sidePanel === 'curl' ? null : 'curl')}
            title="Import cURL command"
          >
            <Terminal size={12} /> cURL
          </button>
          <button
            className={`aether-btn sm ${sidePanel === 'code' ? 'primary' : ''}`}
            onClick={() => setSidePanel(sidePanel === 'code' ? null : 'code')}
            title="Generate Code Snippet"
          >
            <Code size={12} /> Code
          </button>
        </div>
      </div>

      {/* Main Workspace Row: Sub-Tab Editor (Left) & cURL/Code Side Panel (Right) Side-by-Side */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'row', width: '100%', minHeight: 0 }}>
        {/* Left Side: Active Sub-Tab View (Params, Headers, Auth, Body, Scripts, Settings) */}
        <div style={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden' }}>
          {activeTab === 'params' && (
            <div style={{ padding: '8px 12px', height: '100%', overflowY: 'auto' }}>
              <KeyValueEditor
                items={request.params || []}
                onChange={(items) => onChange({ ...request, params: items, isDirty: true })}
                keyPlaceholder="Parameter Key"
                valuePlaceholder="Value"
              />
            </div>
          )}

          {activeTab === 'headers' && (
            <div style={{ padding: '8px 12px', height: '100%', overflowY: 'auto' }}>
              <KeyValueEditor
                items={request.headers || []}
                onChange={(items) => onChange({ ...request, headers: items, isDirty: true })}
                keyPlaceholder="Header Name"
                valuePlaceholder="Value"
              />
            </div>
          )}

          {activeTab === 'auth' && (
            <div style={{ height: '100%', overflowY: 'auto' }}>
              <AuthEditor
                auth={request.auth || { type: 'none' }}
                onChange={(auth) => onChange({ ...request, auth, isDirty: true })}
              />
            </div>
          )}

          {activeTab === 'body' && (
            <div style={{ height: '100%', overflowY: 'auto' }}>
              <BodyEditor
                body={request.body || { mode: 'none' }}
                onChange={(body) => onChange({ ...request, body, isDirty: true })}
              />
            </div>
          )}

          {activeTab === 'scripts' && (
            <div style={{ height: '100%', overflowY: 'auto' }}>
              <ScriptsEditor
                scripts={request.scripts || { preRequest: '', test: '' }}
                onChange={(scripts) => onChange({ ...request, scripts, isDirty: true })}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={{ height: '100%', width: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>
              <RequestSettingsEditor
                settings={request.settings}
                onChange={(settings) => onChange({ ...request, settings, isDirty: true })}
              />
            </div>
          )}
        </div>

        {/* Right Side: cURL View or Code View Side-by-Side! */}
        {sidePanel === 'curl' && (
          <div style={{
            width: '420px',
            height: '100%',
            borderLeft: '1px solid var(--border-color)',
            background: 'var(--bg-surface)',
            padding: '16px 20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}>
            <InlineCurlImport
              onImport={(importedReq) => {
                onChange({ ...request, ...importedReq, isDirty: true });
                setSidePanel(null);
              }}
              onClose={() => setSidePanel(null)}
            />
          </div>
        )}

        {sidePanel === 'code' && (
          <div style={{
            width: '420px',
            height: '100%',
            borderLeft: '1px solid var(--border-color)',
            background: 'var(--bg-surface)',
            padding: '16px 20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}>
            <InlineCodeSnippet
              request={request}
              activeEnvVars={activeEnvVars}
              onClose={() => setSidePanel(null)}
            />
          </div>
        )}
      </div>

      {/* Cookies Modal */}
      <CookiesModal
        isOpen={isCookiesOpen}
        onClose={() => setIsCookiesOpen(false)}
      />
    </div>
  );
};
