import React, { useState } from 'react';
import { parsePostmanCollection } from '../utils/postmanFormat';
import { X, FolderPlus, Upload, Check, AlertCircle } from 'lucide-react';

export const CollectionModal = ({
  mode = 'create', // 'create' or 'import'
  onCreateCollection,
  onImportCollection,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fileError, setFileError] = useState(null);

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreateCollection({
      id: `col-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      items: [],
    });
    onClose();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        const collection = parsePostmanCollection(content);
        onImportCollection(collection);
        setFileError(null);
        onClose();
      } catch (err) {
        setFileError('Invalid Postman Collection JSON format: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '15px' }}>
            {mode === 'import' ? <Upload color="var(--accent-primary)" size={18} /> : <FolderPlus color="var(--accent-primary)" size={18} />}
            {mode === 'import' ? 'Import Postman Collection' : 'Create New Collection'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {mode === 'create' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', marginBottom: '4px' }}>
                  COLLECTION NAME
                </label>
                <input
                  type="text"
                  className="aether-input"
                  placeholder="e.g. Auth Microservice API"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%' }}
                  autoFocus
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', marginBottom: '4px' }}>
                  DESCRIPTION (OPTIONAL)
                </label>
                <textarea
                  className="aether-input"
                  placeholder="Summary of API endpoints in this collection..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Upload a Postman Collection JSON file (v2.1) to import endpoints, query parameters, headers, and request bodies.
              </div>

              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '30px 20px',
                border: '2px dashed var(--border-color)',
                borderRadius: '8px',
                background: 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'center'
              }}>
                <Upload size={32} color="var(--accent-primary)" style={{ marginBottom: '8px' }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                  Click to choose file or drag & drop
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Supported format: .json (Postman v2.1)
                </span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>

              {fileError && (
                <div style={{ color: '#DC2626', fontSize: '12px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={14} /> {fileError}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="aether-btn" onClick={onClose}>
            Cancel
          </button>
          {mode === 'create' && (
            <button className="aether-btn primary" onClick={handleCreate} disabled={!name.trim()}>
              <Check size={14} /> Create Collection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
