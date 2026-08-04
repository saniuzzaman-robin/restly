import React from 'react';
import { CustomSelect } from './CustomSelect';

export const AuthEditor = ({ auth = { type: 'none' }, onChange }) => {
  const handleTypeChange = (type) => {
    onChange({ ...auth, type });
  };

  const handleFieldChange = (field, val) => {
    onChange({ ...auth, [field]: val });
  };

  const addToOptions = [
    { value: 'header', label: 'Request Headers' },
    { value: 'query', label: 'Query Parameters' },
  ];

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
          <div style={{ maxWidth: '450px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', marginBottom: '6px' }}>
              TOKEN
            </label>
            <input
              type="text"
              className="aether-input mono"
              placeholder="e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={auth.token || ''}
              onChange={(e) => handleFieldChange('token', e.target.value)}
              style={{ width: '100%' }}
            />
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
                className="aether-input"
                placeholder="Username"
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
                className="aether-input"
                placeholder="Password"
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
              <CustomSelect
                options={addToOptions}
                value={auth.addTo || 'header'}
                onChange={(val) => handleFieldChange('addTo', val)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
