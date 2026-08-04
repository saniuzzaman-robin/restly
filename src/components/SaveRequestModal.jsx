import React, { useState } from 'react';
import { Save, FolderPlus, X, Check, FileText } from 'lucide-react';

export const SaveRequestModal = ({
  request,
  collections = [],
  onClose,
  onSave,
  onCreateCollection,
}) => {
  const [requestName, setRequestName] = useState(request?.name || 'New Request');
  const [description, setDescription] = useState(request?.description || '');
  const [selectedCollectionId, setSelectedCollectionId] = useState(
    request?.collectionId || collections[0]?.id || 'new'
  );
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(collections.length === 0);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!requestName.trim()) return;

    let targetColId = selectedCollectionId;

    if (isCreatingCollection || selectedCollectionId === 'new') {
      if (!newCollectionName.trim()) return;
      targetColId = onCreateCollection(newCollectionName.trim());
    }

    onSave({
      ...request,
      name: requestName.trim(),
      description: description.trim(),
      collectionId: targetColId,
      isDirty: false,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '15px' }}>
            <Save color="var(--accent-primary)" size={18} />
            Save Request to Collection
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Request Name */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                REQUEST NAME
              </label>
              <input
                type="text"
                className="aether-input"
                placeholder="e.g. Get User Profile"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                style={{ width: '100%', fontSize: '13px' }}
                autoFocus
              />
            </div>

            {/* Request Description */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                DESCRIPTION (OPTIONAL)
              </label>
              <textarea
                className="aether-input"
                placeholder="Describe what this HTTP request does..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', height: '60px', fontSize: '12px', resize: 'vertical', fontFamily: 'var(--font-sans)' }}
              />
            </div>

            {/* Collection Selection */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>
                  SELECT COLLECTION
                </label>

                <button
                  type="button"
                  onClick={() => setIsCreatingCollection(!isCreatingCollection)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <FolderPlus size={12} />
                  {isCreatingCollection ? 'Select Existing' : '+ New Collection'}
                </button>
              </div>

              {isCreatingCollection ? (
                <input
                  type="text"
                  className="aether-input"
                  placeholder="Enter new collection name..."
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  style={{ width: '100%', fontSize: '12px' }}
                />
              ) : (
                <select
                  className="aether-input"
                  value={selectedCollectionId}
                  onChange={(e) => setSelectedCollectionId(e.target.value)}
                  style={{ width: '100%', fontSize: '12px', background: 'var(--bg-input)' }}
                >
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      📁 {col.name} ({col.items?.length || 0} requests)
                    </option>
                  ))}
                  <option value="new">+ Create New Collection...</option>
                </select>
              )}
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="aether-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="aether-btn primary" disabled={!requestName.trim()}>
              <Check size={14} /> Save Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
