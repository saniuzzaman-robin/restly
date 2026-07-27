import React, { useState } from 'react';
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
} from 'lucide-react';

export const Sidebar = ({
  collections = [],
  history = [],
  activeRequestId,
  onSelectRequest,
  onCreateCollection,
  onCreateRequestInCollection,
  onDeleteCollection,
  onDeleteRequest,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState('collections');
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
          padding: '6px 12px 6px 28px',
          borderRadius: '4px',
          cursor: 'pointer',
          background: isSelected ? 'var(--bg-card)' : 'transparent',
          color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
          fontSize: '12px',
          marginBottom: '2px',
          fontWeight: isSelected ? '600' : '400',
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
      width: 'var(--sidebar-width)',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      userSelect: 'none'
    }}>
      {/* Sidebar Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
        <button
          className={`sub-tab-btn ${activeTab === 'collections' ? 'active' : ''}`}
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => setActiveTab('collections')}
        >
          <Layers size={13} /> Collections
        </button>
        <button
          className={`sub-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => setActiveTab('history')}
        >
          <History size={13} /> History
        </button>
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
            placeholder={activeTab === 'collections' ? 'Filter collections...' : 'Filter history...'}
            value={searchQuery}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '12px', outline: 'none', width: '100%' }}
          />
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
        {activeTab === 'collections' && (
          <div>
            {/* Create Collection Header */}
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

            {/* Collection Tree List */}
            {collections.map((col) => {
              const isExpanded = expandedFolders[col.id];
              const filteredItems = (col.items || []).filter(
                (item) => !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.url.toLowerCase().includes(searchQuery.toLowerCase())
              );

              return (
                <div key={col.id} style={{ marginBottom: '4px' }}>
                  {/* Collection Title Row */}
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

                  {/* Nested Requests */}
                  {isExpanded && (
                    <div style={{ marginTop: '2px' }}>
                      {filteredItems.map((req) => renderRequestItem(req, col.id))}
                      {filteredItems.length === 0 && (
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

        {activeTab === 'history' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px 8px 8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                RECENT EXECUTIONS
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

            {history.map((hist, idx) => (
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

            {history.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-dim)', fontSize: '12px' }}>
                <Clock size={24} style={{ opacity: 0.3, marginBottom: '6px' }} />
                <div>No request history yet</div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
