import React, { useState, useEffect, useRef } from 'react';
import { Plus, X } from 'lucide-react';

export const TabBar = ({
  tabs = [],
  activeTabId,
  onSelectTab,
  onCloseTab,
  onAddTab,
  onRenameTab,
}) => {
  const [editingTabId, setEditingTabId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingTabId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTabId]);

  const handleStartEditing = (tab) => {
    setEditingTabId(tab.id);
    setEditingName(tab.name || tab.url || 'New Request');
  };

  const handleFinishEditing = (tab) => {
    const trimmed = editingName.trim();
    const currentName = tab.name || tab.url || 'New Request';

    if (trimmed && trimmed !== currentName && onRenameTab) {
      onRenameTab(tab.id, trimmed);
    }
    setEditingTabId(null);
  };

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
        const isEditing = editingTabId === tab.id;

        return (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            onDoubleClick={() => handleStartEditing(tab)}
            title="Double-click to rename request tab"
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

            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleFinishEditing(tab)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFinishEditing(tab);
                  if (e.key === 'Escape') setEditingTabId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  flex: 1,
                  background: 'var(--bg-input)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--accent-primary)',
                  borderRadius: '3px',
                  padding: '1px 4px',
                  fontSize: '11px',
                  outline: 'none',
                }}
              />
            ) : (
              <span style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: isActive ? '600' : '400',
              }}>
                {tab.name || tab.url || 'Untitled Request'}
              </span>
            )}

            {tab.isDirty && (
              <span
                title="Unsaved changes"
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--accent-primary)',
                  display: 'inline-block'
                }}
              ></span>
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
