import React, { useState } from 'react';
import { KeyValueEditor } from './KeyValueEditor';
import { X, Plus, Trash2, Globe, Check } from 'lucide-react';

export const EnvironmentModal = ({
  isOpen = true,
  environments = [],
  activeEnvId,
  onSave,
  onSaveEnvironments,
  onClose,
}) => {
  const [envList, setEnvList] = useState(() => JSON.parse(JSON.stringify(environments)));
  const [selectedEnvId, setSelectedEnvId] = useState(activeEnvId || environments[0]?.id);

  if (!isOpen) return null;

  const selectedEnv = envList.find((e) => e.id === selectedEnvId) || envList[0];

  const handleAddEnv = () => {
    const newEnv = {
      id: `env-${Date.now()}`,
      name: 'New Environment',
      variables: [{ key: '', value: '', enabled: true }],
    };
    setEnvList([...envList, newEnv]);
    setSelectedEnvId(newEnv.id);
  };

  const handleDeleteEnv = (id) => {
    if (envList.length === 1) return;
    const filtered = envList.filter((e) => e.id !== id);
    setEnvList(filtered);
    if (selectedEnvId === id) {
      setSelectedEnvId(filtered[0]?.id);
    }
  };

  const handleNameChange = (newName) => {
    setEnvList(
      envList.map((e) => (e.id === selectedEnvId ? { ...e, name: newName } : e))
    );
  };

  const handleVariablesChange = (vars) => {
    setEnvList(
      envList.map((e) => (e.id === selectedEnvId ? { ...e, variables: vars } : e))
    );
  };

  const handleSave = () => {
    const saveFn = onSaveEnvironments || onSave;
    if (saveFn) {
      saveFn(envList, selectedEnvId);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '15px' }}>
            <Globe color="var(--accent-primary)" size={18} />
            Manage Environments & Variables
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', gap: '16px', minHeight: '320px', padding: '16px 20px' }}>
          {/* Environment Sidebar List */}
          <div style={{ width: '200px', borderRight: '1px solid var(--border-color)', paddingRight: '12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>ENVIRONMENTS</span>
              <button className="aether-btn sm" onClick={handleAddEnv} title="Add Environment">
                <Plus size={12} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {envList.map((env) => (
                <div
                  key={env.id}
                  onClick={() => setSelectedEnvId(env.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: env.id === selectedEnvId ? '600' : 'normal',
                    background: env.id === selectedEnvId ? 'var(--accent-glow)' : 'transparent',
                    color: env.id === selectedEnvId ? 'var(--accent-primary)' : 'var(--text-main)',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{env.name}</span>
                  {envList.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEnv(env.id);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Variables Table for Selected Environment */}
          {selectedEnv ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  ENVIRONMENT NAME
                </label>
                <input
                  type="text"
                  className="aether-input"
                  value={selectedEnv.name || ''}
                  onChange={(e) => handleNameChange(e.target.value)}
                  style={{ width: '100%', fontSize: '13px' }}
                />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  VARIABLES (Access via {'{{variableName}}'})
                </label>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <KeyValueEditor
                    items={selectedEnv.variables || []}
                    onChange={handleVariablesChange}
                    keyPlaceholder="Variable Name"
                    valuePlaceholder="Initial / Current Value"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Select or create an environment
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="aether-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="aether-btn primary" onClick={handleSave}>
            <Check size={14} /> Save Environments
          </button>
        </div>
      </div>
    </div>
  );
};
