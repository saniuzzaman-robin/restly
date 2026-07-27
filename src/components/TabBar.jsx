import React from 'react';
import { Plus, X } from 'lucide-react';

export const TabBar = ({ tabs = [], activeTabId, onSelectTab, onCloseTab, onAddTab }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: 'var(--bg-tab)',
      borderBottom: '1px solid var(--border-color)',
      overflowX: 'auto',
      paddingLeft: '4px',
      gap: '2px'
    }}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              background: isActive ? 'var(--bg-surface)' : 'transparent',
              color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
              borderTop: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
              borderRight: '1px solid var(--border-color)',
              cursor: 'pointer',
              fontSize: '12px',
              minWidth: '130px',
              maxWidth: '220px',
              userSelect: 'none',
              transition: 'all 0.1s ease',
            }}
          >
            <span className={`method-badge ${tab.method || 'GET'}`} style={{ fontSize: '9px', padding: '1px 4px' }}>
              {tab.method || 'GET'}
            </span>

            <span style={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: isActive ? '600' : '400',
            }}>
              {tab.name || tab.url || 'Untitled Request'}
            </span>

            {tab.isDirty && (
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                display: 'inline-block'
              }}></span>
            )}

            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '2px',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                className="close-tab-btn"
              >
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}

      <button
        onClick={onAddTab}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          padding: '8px 12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Open New Tab"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};
