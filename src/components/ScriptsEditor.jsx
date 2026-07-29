import React, { useState } from 'react';
import { Terminal, CheckCircle2, Play, BookOpen } from 'lucide-react';

export const ScriptsEditor = ({
  preRequestScript = '',
  testScript = '',
  onChangePreRequest,
  onChangeTest,
}) => {
  const [activeTab, setActiveTab] = useState('prerequest'); // 'prerequest' | 'test'

  const testSnippets = [
    { label: 'Status code: Code is 200', code: 'pm.test("Status code is 200", function () {\n  pm.response.to.have.status(200);\n});' },
    { label: 'Response body: Contains string', code: 'pm.test("Body matches string", function () {\n  pm.expect(pm.response.text()).to.include("string_you_want");\n});' },
    { label: 'Response body: JSON value check', code: 'pm.test("Your test name", function () {\n  var jsonData = pm.response.json();\n  pm.expect(jsonData.value).to.eql(100);\n});' },
    { label: 'Set an environment variable', code: 'pm.environment.set("variable_key", "variable_value");' },
  ];

  const handleInsertSnippet = (snippetCode) => {
    if (activeTab === 'prerequest') {
      const updated = preRequestScript ? `${preRequestScript}\n\n${snippetCode}` : snippetCode;
      onChangePreRequest(updated);
    } else {
      const updated = testScript ? `${testScript}\n\n${snippetCode}` : snippetCode;
      onChangeTest(updated);
    }
  };

  return (
    <div style={{ padding: '8px 12px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Script Sub-tabs (Pre-request / Tests) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', marginBottom: '8px', paddingBottom: '4px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`sub-tab-btn ${activeTab === 'prerequest' ? 'active' : ''}`}
            onClick={() => setActiveTab('prerequest')}
            style={{ fontSize: '11px' }}
          >
            <Terminal size={12} /> Pre-request Script
          </button>
          <button
            className={`sub-tab-btn ${activeTab === 'test' ? 'active' : ''}`}
            onClick={() => setActiveTab('test')}
            style={{ fontSize: '11px' }}
          >
            <CheckCircle2 size={12} /> Tests
          </button>
        </div>

        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          Write JavaScript to execute before sending or to test responses.
        </span>
      </div>

      {/* Editor Main Section */}
      <div style={{ flex: 1, display: 'flex', gap: '12px', overflow: 'hidden' }}>
        {/* JS Code Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <textarea
            className="aether-input mono"
            value={activeTab === 'prerequest' ? preRequestScript : testScript}
            onChange={(e) => {
              if (activeTab === 'prerequest') onChangePreRequest(e.target.value);
              else onChangeTest(e.target.value);
            }}
            placeholder={
              activeTab === 'prerequest'
                ? `// Pre-request script runs BEFORE sending the request\npm.environment.set("timestamp", Date.now());`
                : `// Test script runs AFTER receiving the response\npm.test("Status code is 200", function () {\n  pm.response.to.have.status(200);\n});`
            }
            rows={10}
            style={{ width: '100%', flex: 1, resize: 'none', lineHeight: '1.5', fontSize: '12px' }}
          />
        </div>

        {/* Snippets Sidebar */}
        <div style={{
          width: '200px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BookOpen size={12} color="var(--accent-primary)" /> SNIPPETS
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {testSnippets.map((snip, idx) => (
              <button
                key={idx}
                onClick={() => handleInsertSnippet(snip.code)}
                style={{
                  textAlign: 'left',
                  background: 'var(--bg-tab)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  fontSize: '11px',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  lineHeight: '1.3',
                  transition: 'background 0.1s ease'
                }}
                title="Click to insert snippet code"
              >
                {snip.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
