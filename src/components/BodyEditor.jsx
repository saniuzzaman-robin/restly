import React, { useState } from 'react';
import { KeyValueEditor } from './KeyValueEditor';
import { Code2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const BodyEditor = ({ body = { mode: 'none' }, onChange }) => {
  const [jsonError, setJsonError] = useState(null);

  const handleModeChange = (mode) => {
    onChange({ ...body, mode });
  };

  const handleJsonChange = (jsonStr) => {
    onChange({ ...body, json: jsonStr });
    try {
      if (jsonStr.trim()) {
        JSON.parse(jsonStr);
      }
      setJsonError(null);
    } catch (e) {
      setJsonError(e.message);
    }
  };

  const handleFormatJson = () => {
    try {
      if (body.json) {
        const parsed = JSON.parse(body.json);
        const formatted = JSON.stringify(parsed, null, 2);
        onChange({ ...body, json: formatted });
        setJsonError(null);
      }
    } catch (e) {
      setJsonError('Cannot format: ' + e.message);
    }
  };

  return (
    <div style={{ padding: '12px 16px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        {[
          { id: 'none', label: 'none' },
          { id: 'json', label: 'json' },
          { id: 'raw', label: 'raw text' },
          { id: 'urlencoded', label: 'x-www-form-urlencoded' },
          { id: 'formdata', label: 'form-data' },
        ].map((item) => (
          <label
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              color: body.mode === item.id ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: body.mode === item.id ? '600' : '400',
            }}
          >
            <input
              type="radio"
              name="bodyMode"
              checked={body.mode === item.id}
              onChange={() => handleModeChange(item.id)}
              style={{ accentColor: 'var(--accent-primary)' }}
            />
            {item.label}
          </label>
        ))}

        {body.mode === 'json' && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {jsonError ? (
              <span style={{ color: '#EF4444', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={13} /> Invalid JSON
              </span>
            ) : (
              body.json?.trim() && (
                <span style={{ color: '#10B981', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} /> Valid JSON
                </span>
              )
            )}
            <button className="aether-btn sm" onClick={handleFormatJson}>
              <Code2 size={13} /> Beautify JSON
            </button>
          </div>
        )}
      </div>

      {body.mode === 'none' && (
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '16px 0' }}>
          This request does not have a body payload.
        </div>
      )}

      {body.mode === 'json' && (
        <div>
          <textarea
            className="aether-input mono"
            value={body.json || ''}
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder={`{\n  "key": "value",\n  "userId": "{{userId}}"\n}`}
            rows={10}
            style={{ width: '100%', resize: 'vertical', lineHeight: '1.5' }}
          />
          {jsonError && (
            <div style={{ color: '#EF4444', fontSize: '11px', marginTop: '6px' }}>
              Error: {jsonError}
            </div>
          )}
        </div>
      )}

      {body.mode === 'raw' && (
        <textarea
          className="aether-input mono"
          value={body.raw || ''}
          onChange={(e) => onChange({ ...body, raw: e.target.value })}
          placeholder="Raw request body text..."
          rows={10}
          style={{ width: '100%', resize: 'vertical' }}
        />
      )}

      {body.mode === 'urlencoded' && (
        <KeyValueEditor
          items={body.urlencoded || []}
          onChange={(items) => onChange({ ...body, urlencoded: items })}
          keyPlaceholder="Parameter Key"
          valuePlaceholder="Value"
        />
      )}

      {body.mode === 'formdata' && (
        <KeyValueEditor
          items={body.formdata || []}
          onChange={(items) => onChange({ ...body, formdata: items })}
          keyPlaceholder="Key"
          valuePlaceholder="Value"
        />
      )}
    </div>
  );
};
