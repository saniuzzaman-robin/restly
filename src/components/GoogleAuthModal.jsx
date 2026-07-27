import React, { useState } from 'react';
import { getStoredClientId, setStoredClientId } from '../utils/googleDriveSync';
import { Shield, Key, ExternalLink, X, AlertCircle } from 'lucide-react';

export const GoogleAuthModal = ({ user, onLoginSuccess, onClose }) => {
  const [clientId, setClientIdInput] = useState(getStoredClientId() || '');
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSaveAndLogin = (e) => {
    e?.preventDefault();
    if (!clientId.trim()) {
      setError('Please enter a valid Google OAuth Client ID.');
      return;
    }

    setError(null);
    setIsConnecting(true);
    setStoredClientId(clientId.trim());

    onLoginSuccess(clientId.trim(), (res) => {
      setIsConnecting(false);
      if (res.error) {
        setError('Login failed: ' + res.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ width: '520px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '14px', color: 'var(--text-main)' }}>
            <Shield size={18} color="var(--accent-primary)" />
            Google Drive Cloud Sync Setup
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
            Restly syncs your collections, environments, open tabs, and request history directly to your private Google Drive (<code style={{ fontSize: '11px', color: 'var(--accent-primary)' }}>appDataFolder</code>).
          </p>

          <form onSubmit={handleSaveAndLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>
                Google OAuth 2.0 Client ID
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="aether-input mono"
                  placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                  value={clientId}
                  onChange={(e) => {
                    setClientIdInput(e.target.value);
                    setError(null);
                  }}
                  style={{ width: '100%', paddingLeft: '32px', fontSize: '12px', height: '36px' }}
                />
                <Key size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
              </div>
            </div>

            {error && (
              <div style={{ color: '#DC2626', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {/* Quick Setup Instructions */}
            <div style={{
              background: 'var(--bg-tab)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '12px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                How to get a free Google Client ID in 2 minutes:
              </strong>
              <ol style={{ paddingLeft: '16px', margin: 0 }}>
                <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>Google Cloud Console Credentials <ExternalLink size={10} /></a>.</li>
                <li>Create an <strong>OAuth 2.0 Client ID</strong> (Web Application).</li>
                <li>Add <code style={{ color: 'var(--text-main)' }}>http://localhost:5173</code> to <strong>Authorized JavaScript origins</strong>.</li>
                <li>Paste your Web Client ID above and click Connect.</li>
              </ol>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button type="button" className="aether-btn" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="aether-btn primary"
                disabled={isConnecting}
                style={{ height: '36px', padding: '0 16px' }}
              >
                {isConnecting ? 'Connecting to Google...' : 'Connect Google Drive'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
