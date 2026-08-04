import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Globe } from 'lucide-react';
import { ScrollableTabsContainer } from './ScrollableTabsContainer';

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
      paddingLeft: '4px',
      position: 'relative',
    }}>
      <ScrollableTabsContainer style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', paddingRight: '8px' }}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const isEditing = editingTabId === tab.id;

            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                onDoubleClick={() => handleStartEditing(tab)}
                title="Double-click to rename tab"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  background: isActive ? 'var(--bg-surface)' : 'var(--bg-tab)',
                  color: 'var(--text-main)',
                  borderTop: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  borderLeft: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                  borderRight: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                  borderRadius: '6px 6px 0 0',
                  cursor: 'pointer',
                  fontSize: '12px',
                  flex: '0 1 180px',
                  minWidth: '110px',
                  maxWidth: '220px',
                  boxSizing: 'border-box',
                  userSelect: 'none',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 -2px 6px rgba(0, 0, 0, 0.05)' : 'none',
                }}
              >
                {tab.type === 'environment' ? (
                  <Globe size={13} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                ) : (
                  <span className={`method-badge ${tab.method || 'GET'}`} style={{ fontSize: '9px', padding: '1px 4px', flexShrink: 0 }}>
                    {tab.method || 'GET'}
                  </span>
                )}

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
                      flex: '1 1 0%',
                      minWidth: 0,
                      width: '100%',
                      height: '22px',
                      background: 'var(--bg-input)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--accent-primary)',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '11px',
                      fontWeight: '500',
                      outline: 'none',
                      boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.15)',
                      boxSizing: 'border-box',
                    }}
                  />
                ) : (
                  <span style={{
                    flex: '1 1 0%',
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: isActive ? '600' : '400',
                  }}>
                    {tab.name || tab.url || 'New Request'}
                  </span>
                )}

                {tab.isDirty && !isEditing && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0 }} />
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                  title="Close Tab"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </ScrollableTabsContainer>

      {/* Add New Request Button */}
      <button
        type="button"
        onClick={onAddTab}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
        title="Add New Request Tab"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};
