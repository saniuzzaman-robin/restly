import React, { useState } from 'react';
import { ScrollableTabsContainer } from './ScrollableTabsContainer';
import {
  Folder,
  FolderOpen,
  FolderPlus,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Search,
  History,
  Clock,
  Layers,
  Globe,
  Check,
} from 'lucide-react';

export const Sidebar = ({
  width = 280,
  collections = [],
  environments = [],
  activeEnvId = null,
  history = [],
  activeRequestId,
  onSelectRequest,
  onCreateCollection,
  onCreateRequestInCollection,
  onDeleteCollection,
  onDeleteRequest,
  onSelectEnv,
  onOpenEnvTab,
  onCreateEnv,
  onDeleteEnv,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState('collections'); // 'collections' | 'environments' | 'history'
  const [searchQuery, setSearchFilter] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({ 'col-jsonplaceholder': true });

  const toggleFolder = (id) => {
    setExpandedFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderRequestItem = (req, colId) => {
    const isSelected = req.id === activeRequestId;
    return (
      <div
        key={req.id}
        onClick={() => onSelectRequest(req, colId)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px 6px 24px',
          borderRadius: '4px',
          cursor: 'pointer',
          background: isSelected ? 'var(--bg-card)' : 'transparent',
          color: 'var(--text-main)',
          borderLeft: isSelected ? '3px solid var(--accent-primary)' : '3px solid transparent',
          fontSize: '12px',
          marginBottom: '2px',
          fontWeight: isSelected ? '600' : '500',
          transition: 'all 0.15s ease',
        }}
      >
        <span className={`method-badge ${req.method || 'GET'}`} style={{ fontSize: '9px', padding: '1px 4px', minWidth: '32px', textAlign: 'center' }}>
          {req.method || 'GET'}
        </span>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {req.name || req.url || 'Untitled Request'}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteRequest(req.id, colId);
          }}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', opacity: 0.6, cursor: 'pointer' }}
          title="Delete Request"
        >
          <Trash2 size={12} />
        </button>
      </div>
    );
  };

  return (
    <aside style={{
      width: typeof width === 'number' ? `${width}px` : width,
      background: 'var(--bg-surface)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      userSelect: 'none',
      flexShrink: 0,
    }}>
      {/* Sidebar Top Tabs with Scroll Arrow Controls */}
      <div style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tab)' }}>
        <ScrollableTabsContainer>
          <div style={{ display: 'flex', width: '100%' }}>
            <button
              className={`sub-tab-btn ${activeTab === 'collections' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center', padding: '8px 6px', fontSize: '11px', whiteSpace: 'nowrap' }}
              onClick={() => setActiveTab('collections')}
            >
              <Layers size={12} /> Collections
            </button>
            <button
              className={`sub-tab-btn ${activeTab === 'environments' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center', padding: '8px 6px', fontSize: '11px', whiteSpace: 'nowrap' }}
              onClick={() => setActiveTab('environments')}
            >
              <Globe size={12} /> Envs
            </button>
            <button
              className={`sub-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center', padding: '8px 6px', fontSize: '11px', whiteSpace: 'nowrap' }}
              onClick={() => setActiveTab('history')}
            >
              <History size={12} /> History
            </button>
          </div>
        </ScrollableTabsContainer>
      </div>

      {/* Search Input */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-input)',
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid var(--border-color)'
        }}>
          <Search size={13} color="var(--text-muted)" />
          <input
            type="text"
            placeholder={
              activeTab === 'collections'
                ? 'Filter collections...'
                : activeTab === 'environments'
                ? 'Filter environments...'
                : 'Filter history...'
            }
            value={searchQuery}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '12px', outline: 'none', width: '100%' }}
          />
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
        {/* 1. Collections View */}
        {activeTab === 'collections' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px 8px 8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                COLLECTIONS ({collections.length})
              </span>
              <button
                className="aether-btn sm"
                onClick={onCreateCollection}
                title="Create New Collection"
                style={{ padding: '2px 6px' }}
              >
                <FolderPlus size={13} />
              </button>
            </div>

            {collections.map((col) => {
              const query = searchQuery.trim().toLowerCase();
              const items = col.items || [];
              const filteredItems = query
                ? items.filter((item) =>
                    (item.name || '').toLowerCase().includes(query) ||
                    (item.url || '').toLowerCase().includes(query) ||
                    (item.method || '').toLowerCase().includes(query)
                  )
                : items;

              const colMatches = query && (col.name || '').toLowerCase().includes(query);
              const displayItems = colMatches ? items : filteredItems;
              const isExpanded = query ? (colMatches || filteredItems.length > 0) : expandedFolders[col.id];

              if (query && !colMatches && filteredItems.length === 0) {
                return null;
              }

              return (
                <div key={col.id} style={{ marginBottom: '4px' }}>
                  <div
                    onClick={() => toggleFolder(col.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--text-main)',
                      background: 'var(--bg-card)'
                    }}
                  >
                    {isExpanded ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />}
                    {isExpanded ? <FolderOpen size={14} color="var(--text-muted)" /> : <Folder size={14} color="var(--text-muted)" />}
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {col.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateRequestInCollection(col.id);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      title="Add Request to Collection"
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCollection(col.id);
                      }}
                      style={{ background: 'none', border: 'none', color: '#DC2626', opacity: 0.7, cursor: 'pointer' }}
                      title="Delete Collection"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '2px' }}>
                      {displayItems.map((req) => renderRequestItem(req, col.id))}
                      {displayItems.length === 0 && (
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', padding: '4px 28px' }}>
                          No requests in collection
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 2. Environments View */}
        {activeTab === 'environments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px 8px 8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                ENVIRONMENTS ({environments.length})
              </span>
              <button
                className="aether-btn sm"
                onClick={onCreateEnv}
                title="Create New Environment"
                style={{ padding: '2px 6px' }}
              >
                <Plus size={13} />
              </button>
            </div>

            {(() => {
              const query = searchQuery.trim().toLowerCase();
              const filteredEnvs = environments.filter((env) => {
                if (!query) return true;
                const nameMatch = (env.name || '').toLowerCase().includes(query);
                const varMatch = (env.variables || []).some(
                  (v) => (v.key || '').toLowerCase().includes(query) || (v.value || '').toLowerCase().includes(query)
                );
                return nameMatch || varMatch;
              });

              return (
                <>
                  {filteredEnvs.map((env) => {
                    const isActive = env.id === activeEnvId;
                    const varCount = (env.variables || []).length;

                    return (
                      <div
                        key={env.id}
                        onClick={() => onOpenEnvTab(env)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          marginBottom: '4px',
                          background: 'var(--bg-card)',
                          border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          fontSize: '12px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Globe size={14} color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'} />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '600', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {env.name}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                            {varCount} variable{varCount === 1 ? '' : 's'}
                          </div>
                        </div>

                        {isActive ? (
                          <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '2px 6px', borderRadius: '4px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Check size={10} /> Active
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectEnv(env.id);
                            }}
                            className="aether-btn sm"
                            style={{ fontSize: '10px', padding: '2px 6px' }}
                            title="Set as Active Environment"
                          >
                            Activate
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteEnv(env.id);
                          }}
                          style={{ background: 'none', border: 'none', color: '#DC2626', opacity: 0.6, cursor: 'pointer', padding: '2px' }}
                          title="Delete Environment"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}

                  {filteredEnvs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-dim)', fontSize: '12px' }}>
                      <Globe size={24} style={{ opacity: 0.3, marginBottom: '6px' }} />
                      <div>{searchQuery ? 'No matching environments' : 'No environments created yet'}</div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* 3. History View */}
        {activeTab === 'history' && (
          <div>
            {(() => {
              const query = searchQuery.trim().toLowerCase();
              const filteredHistory = history.filter((hist) => {
                if (!query) return true;
                return (
                  (hist.url || '').toLowerCase().includes(query) ||
                  (hist.method || '').toLowerCase().includes(query) ||
                  (hist.name || '').toLowerCase().includes(query) ||
                  String(hist.status || '').toLowerCase().includes(query)
                );
              });

              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px 8px 8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      RECENT EXECUTIONS ({filteredHistory.length})
                    </span>
                    {history.length > 0 && (
                      <button
                        onClick={onClearHistory}
                        style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '11px', cursor: 'pointer' }}
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {filteredHistory.map((hist, idx) => (
                    <div
                      key={idx}
                      onClick={() => onSelectHistoryItem(hist)}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginBottom: '4px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span className={`method-badge ${hist.method || 'GET'}`} style={{ fontSize: '9px', padding: '1px 4px' }}>
                          {hist.method || 'GET'}
                        </span>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                          {hist.url}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '10px' }}>
                        <span>Status: {hist.status || 'ERR'}</span>
                        <span>{hist.durationMs ? `${hist.durationMs}ms` : ''}</span>
                      </div>
                    </div>
                  ))}

                  {filteredHistory.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-dim)', fontSize: '12px' }}>
                      <Clock size={24} style={{ opacity: 0.3, marginBottom: '6px' }} />
                      <div>{searchQuery ? 'No matching history items' : 'No request history yet'}</div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </aside>
  );
};
