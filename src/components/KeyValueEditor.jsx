import React from 'react';
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';

export const KeyValueEditor = ({ items = [], onChange, keyPlaceholder = 'Key', valuePlaceholder = 'Value' }) => {
  // Always work with a clean list containing at least 1 row
  const displayItems = Array.isArray(items) && items.length > 0
    ? items
    : [{ key: '', value: '', description: '', enabled: true }];

  const handleItemChange = (index, field, val) => {
    const updated = displayItems.map((item, i) => (i === index ? { ...item, [field]: val } : item));
    onChange(updated);
  };

  const handleAddRow = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const updated = [...displayItems, { key: '', value: '', description: '', enabled: true }];
    onChange(updated);
  };

  const handleRemoveRow = (index, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (displayItems.length <= 1) {
      onChange([{ key: '', value: '', description: '', enabled: true }]);
    } else {
      const updated = displayItems.filter((_, i) => i !== index);
      onChange(updated);
    }
  };

  const handleToggle = (index, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const updated = displayItems.map((item, i) => (i === index ? { ...item, enabled: !item.enabled } : item));
    onChange(updated);
  };

  return (
    <div style={{ padding: '12px 16px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{
            borderBottom: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            fontSize: '11px',
            fontWeight: '600',
            textAlign: 'left',
            letterSpacing: '0.5px'
          }}>
            <th style={{ width: '28px', paddingBottom: '8px' }}></th>
            <th style={{ paddingBottom: '8px', paddingRight: '12px', width: '32%' }}>KEY</th>
            <th style={{ paddingBottom: '8px', paddingRight: '12px', width: '36%' }}>VALUE</th>
            <th style={{ paddingBottom: '8px', paddingRight: '12px' }}>DESCRIPTION</th>
            <th style={{ width: '32px', paddingBottom: '8px' }}></th>
          </tr>
        </thead>
        <tbody>
          {displayItems.map((item, idx) => (
            <tr key={idx} style={{ opacity: item.enabled ? 1 : 0.45 }}>
              <td style={{ verticalAlign: 'middle', padding: '6px 0' }}>
                <button
                  type="button"
                  onClick={(e) => handleToggle(idx, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: item.enabled ? 'var(--accent-primary)' : 'var(--text-dim)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                  title={item.enabled ? "Disable row" : "Enable row"}
                >
                  {item.enabled ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
              </td>
              <td style={{ padding: '4px 6px' }}>
                <input
                  type="text"
                  className="aether-input mono"
                  value={item.key || ''}
                  placeholder={keyPlaceholder}
                  onChange={(e) => handleItemChange(idx, 'key', e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', fontSize: '12px' }}
                />
              </td>
              <td style={{ padding: '4px 6px' }}>
                <input
                  type="text"
                  className="aether-input mono"
                  value={item.value || ''}
                  placeholder={valuePlaceholder}
                  onChange={(e) => handleItemChange(idx, 'value', e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', fontSize: '12px' }}
                />
              </td>
              <td style={{ padding: '4px 6px' }}>
                <input
                  type="text"
                  className="aether-input"
                  value={item.description || ''}
                  placeholder="Description"
                  onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', fontSize: '12px' }}
                />
              </td>
              <td style={{ verticalAlign: 'middle', textAlign: 'center', padding: '4px 0' }}>
                <button
                  type="button"
                  onClick={(e) => handleRemoveRow(idx, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#DC2626',
                    cursor: 'pointer',
                    opacity: 0.7,
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                  title="Remove row"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        type="button"
        className="aether-btn sm"
        onClick={handleAddRow}
        style={{ marginTop: '12px', padding: '6px 12px' }}
      >
        <Plus size={13} /> Add Row
      </button>
    </div>
  );
};
