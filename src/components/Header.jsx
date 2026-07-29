import React, { useState } from 'react';
import { CustomSelect } from './CustomSelect';
import {
  Globe,
  Settings,
  Download,
  Upload,
  Eye,
  Plus,
  Zap,
  Sun,
  Moon,
  Cloud,
  CloudOff,
  RefreshCw,
  LogOut,
  Shield,
  User,
} from 'lucide-react';

export const Header = ({
  environments = [],
  activeEnvId,
  onSelectEnv,
  onOpenEnvModal,
  onImportCollection,
  onExportCollection,
  onNewRequest,
  theme = 'dark',
  onToggleTheme,
  // Google Sync Props
  googleUser,
  syncStatus = 'idle', // 'idle' | 'syncing' | 'synced' | 'error'
  lastSyncTime,
  onTriggerSync,
  onOpenGoogleModal,
  onGoogleLogout,
}) => {
  const [showEnvTooltip, setShowEnvTooltip] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const activeEnv = environments.find((e) => e.id === activeEnvId);

  const envOptions = [
    { value: '', label: 'No Environment' },
    ...environments.map((env) => ({ value: env.id, label: env.name })),
  ];

  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      zIndex: 10
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '4px',
          background: 'var(--btn-primary-bg)',
          color: 'var(--btn-primary-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Zap size={14} />
        </div>
        <div style={{ fontWeight: '700', fontSize: '15px', letterSpacing: '-0.3px', color: 'var(--text-main)' }}>
          Restly
        </div>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Quick New Request */}
        <button className="aether-btn primary sm" onClick={onNewRequest}>
          <Plus size={13} /> New Request
        </button>

        <div style={{ width: '1px', height: '18px', background: 'var(--border-color)' }}></div>

        {/* Environment Selector & Inspector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
          <Globe size={14} color="var(--text-muted)" />
          <CustomSelect
            options={envOptions}
            value={activeEnvId || ''}
            onChange={onSelectEnv}
            size="sm"
            style={{ width: '140px' }}
          />

          {/* Quick Inspector Eye */}
          {activeEnv && (
            <div style={{ position: 'relative' }}>
              <button
                className="aether-btn sm"
                onClick={() => setShowEnvTooltip(!showEnvTooltip)}
                style={{ padding: '4px' }}
                title="Quick View Environment Variables"
              >
                <Eye size={13} />
              </button>

              {showEnvTooltip && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '280px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  padding: '12px',
                  zIndex: 100
                }}>
                  <div style={{ fontWeight: '600', fontSize: '12px', marginBottom: '8px', color: 'var(--text-main)' }}>
                    {activeEnv.name} Variables
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
                    {(activeEnv.variables || []).map((v, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>&#123;&#123;{v.key}&#125;&#125;</span>
                        <span style={{ color: 'var(--accent-primary)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                          {v.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manage Environments Modal Link */}
          <button className="aether-btn sm" onClick={onOpenEnvModal} title="Manage Environments">
            <Settings size={13} />
          </button>
        </div>

        <div style={{ width: '1px', height: '18px', background: 'var(--border-color)' }}></div>

        {/* Collection Import / Export */}
        <button className="aether-btn sm" onClick={onImportCollection} title="Import Postman Collection JSON">
          <Upload size={13} /> Import
        </button>

        <button className="aether-btn sm" onClick={onExportCollection} title="Export Active Collection JSON">
          <Download size={13} /> Export
        </button>

        <div style={{ width: '1px', height: '18px', background: 'var(--border-color)' }}></div>

        {/* Google Drive Cloud Sync */}
        {googleUser ? (
          <div style={{ position: 'relative' }}>
            <button
              className="aether-btn sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 8px' }}
            >
              {googleUser.picture ? (
                <img
                  src={googleUser.picture}
                  alt={googleUser.name}
                  style={{ width: '18px', height: '18px', borderRadius: '50%' }}
                />
              ) : (
                <User size={13} />
              )}
              <span style={{ fontSize: '12px', fontWeight: '500', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {googleUser.given_name || googleUser.name || 'Google User'}
              </span>
              {syncStatus === 'syncing' ? (
                <RefreshCw size={12} className="spin" color="var(--accent-primary)" />
              ) : syncStatus === 'synced' ? (
                <Cloud size={12} color="#10B981" />
              ) : (
                <CloudOff size={12} color="var(--text-muted)" />
              )}
            </button>

            {/* Profile Dropdown Menu */}
            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                width: '240px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                padding: '12px',
                zIndex: 100,
                fontSize: '12px'
              }}>
                <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '2px' }}>
                  {googleUser.name}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '10px' }}>
                  {googleUser.email}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button
                    className="aether-btn sm"
                    onClick={() => {
                      onTriggerSync();
                      setShowUserMenu(false);
                    }}
                    style={{ justifyContent: 'flex-start', width: '100%' }}
                  >
                    <RefreshCw size={13} /> Sync to Google Drive
                  </button>

                  <button
                    className="aether-btn sm"
                    onClick={() => {
                      onOpenGoogleModal();
                      setShowUserMenu(false);
                    }}
                    style={{ justifyContent: 'flex-start', width: '100%' }}
                  >
                    <Settings size={13} /> Google Client Settings
                  </button>

                  <button
                    className="aether-btn sm"
                    onClick={() => {
                      onGoogleLogout();
                      setShowUserMenu(false);
                    }}
                    style={{ justifyContent: 'flex-start', width: '100%', color: '#DC2626' }}
                  >
                    <LogOut size={13} /> Sign Out
                  </button>
                </div>

                {lastSyncTime && (
                  <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            className="aether-btn sm"
            onClick={onOpenGoogleModal}
            title="Sign in with Google to enable Drive Cloud Sync"
          >
            <Shield size={13} color="var(--accent-primary)" />
            <span>Google Login</span>
          </button>
        )}

        <div style={{ width: '1px', height: '18px', background: 'var(--border-color)' }}></div>

        {/* Theme Switcher (Dark / Light) */}
        <button
          className="aether-btn sm"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </header>
  );
};
