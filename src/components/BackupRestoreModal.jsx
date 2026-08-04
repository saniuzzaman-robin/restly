import React, { useState, useRef } from 'react';
import { Download, Upload, ShieldCheck, Database, RefreshCw, X, Check, FileJson, AlertTriangle } from 'lucide-react';
import { exportCompleteWorkspaceBackup, importCompleteWorkspaceBackup } from '../utils/storage';

export const BackupRestoreModal = ({ isOpen, onClose, onRestoreSuccess }) => {
  const [importedBackup, setImportedBackup] = useState(null);
  const [importError, setImportError] = useState(null);
  const [isDone, setIsDone] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportCompleteWorkspaceBackup();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const parsed = JSON.parse(text);

        if (!parsed.collections || !parsed.environments) {
          throw new Error('Invalid backup file structure. Missing collections or environments.');
        }

        setImportedBackup(parsed);
        setImportError(null);
      } catch (err) {
        setImportError(err.message || 'Failed to parse backup JSON file.');
        setImportedBackup(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = () => {
    if (!importedBackup) return;

    try {
      importCompleteWorkspaceBackup(importedBackup);
      setIsDone(true);
      setTimeout(() => {
        if (onRestoreSuccess) onRestoreSuccess();
        window.location.reload();
      }, 1000);
    } catch (err) {
      setImportError('Failed to apply workspace backup: ' + err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '15px' }}>
            <Database color="var(--accent-primary)" size={18} />
            Full Workspace Backup & Restore
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Export Section */}
          <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                  Export Workspace Backup
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '360px' }}>
                  Export all collections, environments, history, open tabs, cookies, and app settings into a single portable <code style={{ fontFamily: 'var(--font-mono)' }}>.json</code> file.
                </div>
              </div>

              <button className="aether-btn primary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={14} /> Export Backup
              </button>
            </div>
          </div>

          {/* Import / Restore Section */}
          <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
              Restore Workspace from File
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Select or drop a previously exported RESTLY backup file to restore your entire workspace on this device.
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {!importedBackup ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '6px',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'var(--bg-surface)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Upload size={24} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>
                  Click to Choose Backup File (.json)
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Supports all Restly & Postman workspace backups
                </div>
              </div>
            ) : (
              <div style={{ background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--accent-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileJson size={14} /> Backup Preview Validated
                  </span>
                  <button onClick={() => setImportedBackup(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={12} />
                  </button>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>📁 Collections: <strong>{importedBackup.collections?.length || 0}</strong></div>
                  <div>🌐 Environments: <strong>{importedBackup.environments?.length || 0}</strong></div>
                  <div>📜 History Items: <strong>{importedBackup.history?.length || 0}</strong></div>
                  <div>📑 Open Tabs: <strong>{importedBackup.openTabs?.length || 0}</strong></div>
                </div>

                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button className="aether-btn sm" onClick={() => setImportedBackup(null)}>
                    Cancel
                  </button>
                  <button className="aether-btn primary sm" onClick={handleConfirmRestore} disabled={isDone}>
                    {isDone ? <Check size={12} color="#10B981" /> : <RefreshCw size={12} />}
                    {isDone ? 'Workspace Restored!' : 'Confirm & Overwrite Workspace'}
                  </button>
                </div>
              </div>
            )}

            {importError && (
              <div style={{ marginTop: '10px', color: '#EF4444', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={12} /> {importError}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="aether-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
