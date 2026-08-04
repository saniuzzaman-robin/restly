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
                if (isLoading && onCancel) {
                  onCancel();
                } else {
                  onSend();
                }
              }
            }}
            style={{ width: '100%', height: '36px', fontSize: '13px' }}
          />
        </div>

        {/* Send / Cancel Button Toggle */}
        {isLoading ? (
          <button
            type="button"
            className="aether-btn"
            onClick={onCancel}
            title="Cancel Active Request"
            style={{
              height: '36px',
              padding: '0 18px',
              background: '#EF4444',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <XCircle size={14} /> Cancel
          </button>
        ) : (
          <button
            type="button"
            className="aether-btn primary"
            onClick={onSend}
            style={{ height: '36px', padding: '0 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Send size={14} /> Send
          </button>
        )}

        {/* Revert Button for Unsaved Changes */}
        {request.isDirty && onRevert && (
          <button
            type="button"
            className="aether-btn"
            onClick={onRevert}
            title="Revert request to last saved state"
            style={{
              height: '36px',
              padding: '0 12px',
              color: '#F59E0B',
              borderColor: 'rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={14} /> Revert
          </button>
        )}

        {/* Save Button */}
        <button
          type="button"
          className="aether-btn"
          onClick={onSave}
          title="Save Request"
          style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '6px' }}
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
            Auth
          </button>

          <button
            className={`sub-tab-btn ${activeTab === 'body' ? 'active' : ''}`}
            onClick={() => setActiveTab('body')}
          >
            <Code2 size={13} />
            Body
          </button>

          <button
            className={`sub-tab-btn ${activeTab === 'scripts' ? 'active' : ''}`}
            onClick={() => setActiveTab('scripts')}
          >
            <Terminal size={13} />
            Scripts
          </button>

          <button
            className={`sub-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
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

        {/* Action Panel Buttons (Import cURL, Code Snippets) */}
        <div style={{ display: 'flex', gap: '6px', paddingRight: '12px' }}>
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

      {/* Main Sub-Tab Content View */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
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
          <div style={{ height: '100%', overflowY: 'auto' }}>
            <RequestSettingsEditor
              settings={request.settings}
              onChange={(settings) => onChange({ ...request, settings, isDirty: true })}
            />
          </div>
        )}
      </div>

      {/* Side Popover Drawers for cURL Import & Code Generation */}
      {sidePanel === 'curl' && (
        <InlineCurlImport
          onImport={(importedReq) => {
            onChange({ ...request, ...importedReq, isDirty: true });
            setSidePanel(null);
          }}
          onClose={() => setSidePanel(null)}
        />
      )}

      {sidePanel === 'code' && (
        <InlineCodeSnippet
          request={request}
          activeEnvVars={activeEnvVars}
          onClose={() => setSidePanel(null)}
        />
      )}

      {/* Cookies Modal */}
      <CookiesModal
        isOpen={isCookiesOpen}
        onClose={() => setIsCookiesOpen(false)}
      />
    </div>
  );
};
