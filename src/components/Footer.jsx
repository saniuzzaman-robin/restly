import React from 'react';
import { Globe, Layers, Command, CheckCircle2, Wifi } from 'lucide-react';

export const Footer = ({
  activeEnv,
  collectionsCount = 0,
  historyCount = 0,
  lastResponse,
}) => {
  return (
    <footer style={{
      height: 'var(--footer-height)',
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      fontSize: '11px',
      color: 'var(--text-muted)',
      userSelect: 'none',
      zIndex: 10
    }}>
      {/* Left Footer Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#10B981',
          }}></span>
          <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>Ready</span>
        </div>

        <div style={{ width: '1px', height: '12px', background: 'var(--border-color)' }}></div>

        {/* Active Environment */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Globe size={12} color="var(--text-muted)" />
          <span>
            ENV: <strong style={{ color: activeEnv ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
              {activeEnv ? activeEnv.name : 'NO ENVIRONMENT'}
            </strong>
          </span>
        </div>

        <div style={{ width: '1px', height: '12px', background: 'var(--border-color)' }}></div>

        {/* CORS / Fetch Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-dim)' }}>
          <Wifi size={12} color="#10B981" />
          <span>Direct Fetch</span>
        </div>

        <div style={{ width: '1px', height: '12px', background: 'var(--border-color)' }}></div>

        {/* Shortcut Tip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-dim)' }}>
          <Command size={11} />
          <span>+ Enter to Send</span>
        </div>
      </div>

      {/* Right Footer Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {lastResponse && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={12} color={lastResponse.status >= 200 && lastResponse.status < 300 ? '#10B981' : '#F59E0B'} />
            <span>
              Last: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                {lastResponse.status} {lastResponse.statusText} ({lastResponse.durationMs}ms)
              </span>
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Layers size={11} />
          <span>{collectionsCount} Collections | {historyCount} History</span>
        </div>

        <div style={{ width: '1px', height: '12px', background: 'var(--border-color)' }}></div>

        <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>
          Restly v1.0
        </span>
      </div>
    </footer>
  );
};
