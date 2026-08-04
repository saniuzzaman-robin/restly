import React from 'react';
import { Plus, Trash2, CheckSquare, Square, Upload, FileText, X } from 'lucide-react';

export const KeyValueEditor = ({
  items = [],
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  allowFile = false,
}) => {
  const safeItems = Array.isArray(items) ? items : [];

  const handleItemChange = (index, field, val) => {
    const updated = safeItems.map((item, i) => (i === index ? { ...item, [field]: val } : item));
    onChange(updated);
  };

  const handleFileChange = (index, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const updated = safeItems.map((item, i) =>
        i === index
          ? {
              ...item,
              type: 'file',
              fileObj: file,
              fileName: file.name,
              value: file.name,
            }
          : item
      );
      onChange(updated);
    }
  };

  const handleClearFile = (index) => {
    const updated = safeItems.map((item, i) =>
      i === index ? { ...item, fileObj: null, fileName: '', value: '' } : item
    );
    onChange(updated);
  };

  const handleAddRow = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const updated = [...safeItems, { key: '', value: '', description: '', enabled: true, type: 'text' }];
    onChange(updated);
  };

  const handleRemoveRow = (index, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const updated = safeItems.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleToggle = (index, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const updated = safeItems.map((item, i) => (i === index ? { ...item, enabled: !item.enabled } : item));
    onChange(updated);
  };

  return (
    <div style={{ padding: '8px 12px' }}>
      {safeItems.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{
              borderBottom: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '10px',
              fontWeight: '700',
              textAlign: 'left',
              letterSpacing: '0.5px'
            }}>
              <th style={{ width: '24px', paddingBottom: '4px' }}></th>
              <th style={{ paddingBottom: '4px', paddingRight: '8px', width: '30%' }}>KEY</th>
              {allowFile && <th style={{ paddingBottom: '4px', paddingRight: '8px', width: '70px' }}>TYPE</th>}
              <th style={{ paddingBottom: '4px', paddingRight: '8px', width: '36%' }}>VALUE</th>
              <th style={{ paddingBottom: '4px', paddingRight: '8px' }}>DESCRIPTION</th>
              <th style={{ width: '28px', paddingBottom: '4px' }}></th>
            </tr>
          </thead>
          <tbody>
            {safeItems.map((item, idx) => (
              <tr key={idx} style={{ opacity: item.enabled ? 1 : 0.45 }}>
                <td style={{ verticalAlign: 'middle', padding: '2px 0' }}>
                  <button
                    type="button"
                    onClick={(e) => handleToggle(idx, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: item.enabled ? 'var(--accent-primary)' : 'var(--text-dim)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'inline-flex'
                    }}
                    title={item.enabled ? 'Disable item' : 'Enable item'}
                  >
                    {item.enabled ? <CheckSquare size={13} /> : <Square size={13} />}
                  </button>
                </td>

                {/* Key Input */}
                <td style={{ padding: '2px 4px' }}>
                  <input
                    type="text"
                    className="aether-input mono"
                    value={item.key || ''}
                    placeholder={keyPlaceholder}
                    onChange={(e) => handleItemChange(idx, 'key', e.target.value)}
                    style={{ width: '100%', padding: '4px 8px', fontSize: '11px', height: '26px' }}
                  />
                </td>

                {/* File/Text Selector */}
                {allowFile && (
                  <td style={{ padding: '2px 4px' }}>
                    <select
                      value={item.type || 'text'}
                      onChange={(e) => handleItemChange(idx, 'type', e.target.value)}
                      style={{
                        background: 'var(--bg-input)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        padding: '2px 4px',
                        fontSize: '10px',
                        height: '26px',
                        width: '100%'
                      }}
                    >
                      <option value="text">Text</option>
                      <option value="file">File</option>
                    </select>
                  </td>
                )}

                {/* Value Input / File Picker */}
                <td style={{ padding: '2px 4px' }}>
                  {allowFile && item.type === 'file' ? (
                    item.fileName ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', padding: '2px 8px', borderRadius: '4px', height: '26px', fontSize: '11px' }}>
                        <FileText size={12} color="var(--accent-primary)" />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.fileName}</span>
                        <button
                          type="button"
                          onClick={() => handleClearFile(idx)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '4px', height: '26px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <Upload size={12} /> Select File...
                        <input type="file" onChange={(e) => handleFileChange(idx, e)} style={{ display: 'none' }} />
                      </label>
                    )
                  ) : (
                    <input
                      type="text"
                      className="aether-input mono"
                      value={item.value || ''}
                      placeholder={valuePlaceholder}
                      onChange={(e) => handleItemChange(idx, 'value', e.target.value)}
                      style={{ width: '100%', padding: '4px 8px', fontSize: '11px', height: '26px' }}
                    />
                  )}
                </td>

                {/* Description Input */}
                <td style={{ padding: '2px 4px' }}>
                  <input
                    type="text"
                    className="aether-input"
                    value={item.description || ''}
                    placeholder="Description"
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    style={{ width: '100%', padding: '4px 8px', fontSize: '11px', height: '26px' }}
                  />
                </td>

                {/* Remove Row Button */}
                <td style={{ verticalAlign: 'middle', textAlign: 'center', padding: '2px 0' }}>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveRow(idx, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#DC2626',
                      cursor: 'pointer',
                      opacity: 0.8,
                      padding: '2px',
                      borderRadius: '4px',
                      display: 'inline-flex'
                    }}
                    title="Remove item"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ padding: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
          No items added yet. Click <strong>Add Row</strong> below to add one.
        </div>
      )}

      <button
        type="button"
        className="aether-btn sm"
        onClick={handleAddRow}
        style={{ marginTop: '8px', padding: '4px 10px', fontSize: '11px' }}
      >
        <Plus size={12} /> Add Row
      </button>
    </div>
  );
};
