import React, { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, CheckCircle2, Copy } from 'lucide-react';

export const EnvironmentEditorTab = ({
  environment,
  isActiveEnv,
  onSetActiveEnv,
  onUpdateEnvironment,
  onDeleteEnvironment,
  onDuplicateEnvironment,
}) => {
  const [envName, setEnvName] = useState(environment?.name || 'Environment');
  const [variables, setVariables] = useState(environment?.variables || []);

  useEffect(() => {
    if (environment) {
      setEnvName(environment.name || 'Environment');
      setVariables(environment.variables || []);
    }
  }, [environment?.id, environment?.name, environment?.variables]);

  const handleNameBlur = () => {
    if (envName.trim() && envName !== environment?.name) {
      onUpdateEnvironment({ ...environment, name: envName.trim(), variables });
    }
  };

  const handleAddVariable = () => {
    const newVars = [...variables, { key: '', value: '', enabled: true }];
    setVariables(newVars);
    onUpdateEnvironment({ ...environment, variables: newVars });
  };

  const handleUpdateVar = (index, field, val) => {
    const newVars = [...variables];
    newVars[index] = { ...newVars[index], [field]: val };
    setVariables(newVars);
    onUpdateEnvironment({ ...environment, variables: newVars });
  };

  const handleDeleteVar = (index) => {
    const newVars = variables.filter((_, i) => i !== index);
    setVariables(newVars);
    onUpdateEnvironment({ ...environment, variables: newVars });
  };

  if (!environment) return null;

  return (
    <div style={{ padding: '20px 24px', height: '100%', overflowY: 'auto', boxSizing: 'border-box', background: 'var(--bg-surface)' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Globe size={22} color="var(--accent-primary)" />
          </div>

          <div>
            <input
              type="text"
              className="aether-input"
              value={envName}
              onChange={(e) => setEnvName(e.target.value)}
              onBlur={handleNameBlur}
              placeholder="Environment Name"
              style={{
                fontSize: '18px',
                fontWeight: '700',
                background: 'transparent',
                border: '1px solid transparent',
                padding: '2px 6px',
                borderRadius: '4px',
                color: 'var(--text-main)',
                width: '280px'
              }}
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px', marginTop: '2px' }}>
              {variables.length} environment variables configured
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className={`aether-btn ${isActiveEnv ? 'primary' : ''}`}
            onClick={onSetActiveEnv}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <CheckCircle2 size={14} color={isActiveEnv ? '#10B981' : 'var(--text-muted)'} />
            {isActiveEnv ? 'Active Environment' : 'Set as Active'}
          </button>

          {onDuplicateEnvironment && (
            <button
              type="button"
              className="aether-btn"
              onClick={onDuplicateEnvironment}
              title="Duplicate Environment"
            >
              <Copy size={14} /> Duplicate
            </button>
          )}

          <button
            type="button"
            className="aether-btn danger"
            onClick={onDeleteEnvironment}
            title="Delete Environment"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Variables Table Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          ENVIRONMENT VARIABLES
        </div>
        <button type="button" className="aether-btn sm primary" onClick={handleAddVariable}>
          <Plus size={13} /> Add Variable
        </button>
      </div>

      {/* Variables Table */}
      <div style={{
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'var(--bg-card)'
      }}>
        {/* Table Columns Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 1fr 40px',
          background: 'var(--bg-tab)',
          borderBottom: '1px solid var(--border-color)',
          padding: '8px 12px',
          fontSize: '11px',
          fontWeight: '700',
          color: 'var(--text-muted)',
          textTransform: 'uppercase'
        }}>
          <div>EN</div>
          <div>VARIABLE NAME</div>
          <div>VARIABLE VALUE</div>
          <div style={{ textAlign: 'right' }}>DEL</div>
        </div>

        {/* Rows */}
        {variables.map((v, idx) => (
          <div
            key={idx}
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 1fr 40px',
              borderBottom: idx === variables.length - 1 ? 'none' : '1px solid var(--border-color)',
              padding: '6px 12px',
              alignItems: 'center',
              gap: '8px',
              background: v.enabled !== false ? 'transparent' : 'rgba(0,0,0,0.05)',
              opacity: v.enabled !== false ? 1 : 0.6
            }}
          >
            <div>
              <input
                type="checkbox"
                checked={v.enabled !== false}
                onChange={(e) => handleUpdateVar(idx, 'enabled', e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
            </div>

            <div>
              <input
                type="text"
                className="aether-input mono"
                placeholder="VARIABLE_NAME (e.g. baseUrl)"
                value={v.key || ''}
                onChange={(e) => handleUpdateVar(idx, 'key', e.target.value)}
                style={{ width: '100%', fontSize: '12px', padding: '4px 8px', height: '28px' }}
              />
            </div>

            <div>
              <input
                type="text"
                className="aether-input mono"
                placeholder="Variable value"
                value={v.value || ''}
                onChange={(e) => handleUpdateVar(idx, 'value', e.target.value)}
                style={{ width: '100%', fontSize: '12px', padding: '4px 8px', height: '28px' }}
              />
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => handleDeleteVar(idx)}
                style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', opacity: 0.7 }}
                title="Delete Variable"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}

        {variables.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No variables configured in this environment yet. Click <strong>Add Variable</strong> above to add <code>baseUrl</code> or API tokens.
          </div>
        )}
      </div>
    </div>
  );
};
