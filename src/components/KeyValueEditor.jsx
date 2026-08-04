import React from 'react';
import { CustomSelect } from './CustomSelect';
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

  const handleRemoveFile = (index) => {
    const updated = safeItems.map((item, i) =>
      i === index
        ? {
            ...item,
            fileObj: null,
            fileName: null,
            value: '',
          }
        : item
    );
    onChange(updated);
  };

  const handleToggleEnable = (index) => {
    const updated = safeItems.map((item, i) =>
      i === index ? { ...item, enabled: !item.enabled } : item
    );
    onChange(updated);
  };

  const handleAddRow = () => {
    const newRow = {
      id: `kv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      key: '',
      value: '',
      description: '',
      enabled: true,
      type: 'text',
    };
    onChange([...safeItems, newRow]);
  };

  const handleRemoveRow = (index) => {
    const updated = safeItems.filter((_, i) => i !== index);
    onChange(updated);
  };

  const typeOptions = [
    { value: 'text', label: 'Text' },
    { value: 'file', label: 'File' },
  ];

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      {safeItems.length === 0 ? (
        <div style={{ padding: '16px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '6px', border: '1px border-dashed var(--border-color)', margin: '8px 0' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            No key-value pairs configured.
          </div>
          <button
            onClick={handleAddRow}
            className="aether-btn sm primary"
            style={{ fontSize: '11px' }}
          >
            <Plus size={12} /> Add Row
          </button>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '6px 4px', width: '28px', textAlign: 'center' }}></th>
              <th style={{ padding: '6px 8px' }}>Key</th>
              {allowFile && <th style={{ padding: '6px 8px', width: '85px' }}>Type</th>}
              <th style={{ padding: '6px 8px' }}>Value</th>
              <th style={{ padding: '6px 8px' }}>Description</th>
              <th style={{ padding: '6px 4px', width: '28px' }}></th>
            </tr>
          </thead>
          <tbody>
            {safeItems.map((item, idx) => {
              const isEnabled = item.enabled !== false;
              return (
                <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--border-color)', opacity: isEnabled ? 1 : 0.5, transition: 'opacity 0.15s ease' }}>
                  {/* Enable Checkbox */}
                  <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleToggleEnable(idx)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: isEnabled ? 'var(--accent-primary)' : 'var(--text-dim)', padding: 0 }}
                      title={isEnabled ? 'Disable Row' : 'Enable Row'}
                    >
                      {isEnabled ? <CheckSquare size={14} /> : <Square size={14} />}
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
                    <td style={{ padding: '2px 4px', width: '85px' }}>
                      <CustomSelect
                        options={typeOptions}
                        value={item.type || 'text'}
                        onChange={(val) => handleItemChange(idx, 'type', val)}
                        size="sm"
                        style={{ width: '100%' }}
                      />
                    </td>
                  )}

                  {/* Value Input / File Picker */}
                  <td style={{ padding: '2px 4px' }}>
                    {allowFile && item.type === 'file' ? (
                      item.fileName ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', padding: '2px 8px', borderRadius: '4px', height: '26px', fontSize: '11px' }}>
                          <FileText size={12} color="var(--accent-primary)" />
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.fileName}
                          </span>
                          <button
                            onClick={() => handleRemoveFile(idx)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '1px' }}
                            title="Remove file"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--bg-input)', border: '1px dashed var(--border-color)', borderRadius: '4px', height: '26px', cursor: 'pointer', fontSize: '11px', color: 'var(--text-muted)' }}>
                          <Upload size={12} />
                          <span>Select File</span>
                          <input
                            type="file"
                            onChange={(e) => handleFileChange(idx, e)}
                            style={{ display: 'none' }}
                          />
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
                  <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleRemoveRow(idx)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', opacity: 0.6, cursor: 'pointer' }}
                      title="Delete Row"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {safeItems.length > 0 && (
        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-start' }}>
          <button
            onClick={handleAddRow}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 6px',
            }}
          >
            <Plus size={12} /> Add Row
          </button>
        </div>
      )}
    </div>
  );
};
