import React, { useState } from 'react';
import { KeyValueEditor } from './KeyValueEditor';
import { X, Plus, Trash2, Globe, Check } from 'lucide-react';

export const EnvironmentModal = ({
  environments = [],
  activeEnvId,
  onSaveEnvironments,
  onClose,
}) => {
  const [envList, setEnvList] = useState(JSON.parse(JSON.stringify(environments)));
  const [selectedEnvId, setSelectedEnvId] = useState(activeEnvId || envList[0]?.id);

  const selectedEnv = envList.find((e) => e.id === selectedEnvId) || envList[0];

  const handleAddEnvironment = () => {
    const newEnv = {
      id: `env-${Date.now()}`,
      name: 'New Environment',
      variables: [{ key: 'baseUrl', value: 'https://api.example.com', enabled: true }],
    };
    setEnvList([...envList, newEnv]);
    setSelectedEnvId(newEnv.id);
  };

  const handleDeleteEnvironment = (id) => {
    const updated = envList.filter((e) => e.id !== id);
    setEnvList(updated);
    if (selectedEnvId === id) {
      setSelectedEnvId(updated[0]?.id || null);
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
    onSaveEnvironments(envList, selectedEnvId);
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

        <div className="modal-body" style={{ display: 'flex', gap: '20px', padding: 0 }}>
          {/* Environment List Pane */}
          <div style={{ width: '220px', borderRight: '1px solid var(--border-color)', padding: '16px', background: 'var(--bg-tab)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>ENVIRONMENTS</span>
              <button className="aether-btn sm" onClick={handleAddEnvironment}>
                <Plus size={12} /> Add
              </button>
            </div>

            {envList.map((env) => (
              <div
                key={env.id}
                onClick={() => setSelectedEnvId(env.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  marginBottom: '4px',
                  cursor: 'pointer',
                  background: env.id === selectedEnvId ? 'var(--bg-card)' : 'transparent',
                  color: env.id === selectedEnvId ? 'var(--accent-primary)' : 'var(--text-main)',
                  fontWeight: env.id === selectedEnvId ? '600' : '400',
                  fontSize: '12px',
                  border: env.id === selectedEnvId ? '1px solid var(--border-color)' : '1px solid transparent',
                }}
              >
                <span>{env.name}</span>
                {envList.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEnvironment(env.id);
                    }}
                    style={{ background: 'none', border: 'none', color: '#DC2626', opacity: 0.7, cursor: 'pointer' }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Environment Variables Editor */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
            {selectedEnv ? (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', marginBottom: '4px' }}>
                    ENVIRONMENT NAME
                  </label>
                  <input
                    type="text"
                    className="aether-input"
                    value={selectedEnv.name || ''}
                    onChange={(e) => handleNameChange(e.target.value)}
                    style={{ width: '100%', fontWeight: '600', fontSize: '14px' }}
                  />
                </div>

                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  ENVIRONMENT VARIABLES
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '12px' }}>
                  Use these in your requests via <code style={{ color: 'var(--accent-primary)' }}>&#123;&#123;variableName&#125;&#125;</code> notation.
                </div>

                <KeyValueEditor
                  items={selectedEnv.variables || []}
                  onChange={handleVariablesChange}
                  keyPlaceholder="Variable Name"
                  valuePlaceholder="Value"
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                Select or create an environment to manage variables.
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="aether-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="aether-btn primary" onClick={handleSave}>
            <Check size={14} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
