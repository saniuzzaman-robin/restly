import React from 'react';

export const AuthEditor = ({ auth = { type: 'none' }, onChange }) => {
  const handleTypeChange = (type) => {
    onChange({ ...auth, type });
  };

  const handleFieldChange = (field, val) => {
    onChange({ ...auth, [field]: val });
  };

  return (
    <div style={{ padding: '16px', display: 'flex', gap: '20px' }}>
      <div style={{ width: '200px', borderRight: '1px solid var(--border-color)', paddingRight: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '10px' }}>
          TYPE
        </div>
        {[
          { id: 'none', label: 'No Auth' },
          { id: 'bearer', label: 'Bearer Token' },
          { id: 'basic', label: 'Basic Auth' },
          { id: 'apikey', label: 'API Key' },
        ].map((typeItem) => (
          <button
            key={typeItem.id}
            onClick={() => handleTypeChange(typeItem.id)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: auth.type === typeItem.id ? 'var(--bg-card)' : 'transparent',
              color: auth.type === typeItem.id ? 'var(--accent-primary)' : 'var(--text-main)',
              fontWeight: auth.type === typeItem.id ? '600' : '400',
              cursor: 'pointer',
              marginBottom: '4px',
              fontSize: '12px',
            }}
          >
            {typeItem.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }}>
        {auth.type === 'none' && (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', paddingTop: '10px' }}>
            This request does not use any authorization. Headers or parameters won't be modified.
          </div>
        )}

        {auth.type === 'bearer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '450px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', marginBottom: '4px' }}>
                TOKEN
              </label>
              <input
                type="text"
                className="aether-input mono"
                placeholder="e.g. {{authToken}} or eyJhbGciOi..."
                value={auth.token || ''}
                onChange={(e) => handleFieldChange('token', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              The Bearer token will be sent in the <code style={{ color: 'var(--accent-primary)' }}>Authorization</code> header. You can use environment variables like <code style={{ color: 'var(--accent-primary)' }}>&#123;&#123;authToken&#125;&#125;</code>.
            </div>
          </div>
        )}

        {auth.type === 'basic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '450px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', marginBottom: '4px' }}>
                USERNAME
              </label>
              <input
                type="text"
                className="aether-input mono"
                placeholder="Username or {{username}}"
                value={auth.username || ''}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', marginBottom: '4px' }}>
                PASSWORD
              </label>
              <input
                type="password"
                className="aether-input mono"
                placeholder="Password or {{password}}"
                value={auth.password || ''}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}

        {auth.type === 'apikey' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '450px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', marginBottom: '4px' }}>
                KEY
              </label>
              <input
                type="text"
                className="aether-input mono"
                placeholder="X-API-Key or api_key"
                value={auth.key || ''}
                onChange={(e) => handleFieldChange('key', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', marginBottom: '4px' }}>
                VALUE
              </label>
              <input
                type="text"
                className="aether-input mono"
                placeholder="Value or {{apiKey}}"
                value={auth.value || ''}
                onChange={(e) => handleFieldChange('value', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', marginBottom: '4px' }}>
                ADD TO
              </label>
              <select
                className="aether-input"
                value={auth.addTo || 'header'}
                onChange={(e) => handleFieldChange('addTo', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="header">Request Headers</option>
                <option value="query">Query Parameters</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
