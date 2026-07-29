import React, { useMemo } from 'react';
import { BarChart3, Table, Layers, FileJson } from 'lucide-react';

export const VisualizerViewer = ({ data, rawText }) => {
  const parsed = useMemo(() => {
    if (data && typeof data === 'object') return data;
    if (rawText) {
      try {
        return JSON.parse(rawText);
      } catch (e) {
        return null;
      }
    }
    return null;
  }, [data, rawText]);

  if (!parsed) {
    return (
      <div style={{ color: 'var(--text-muted)', padding: '24px', textAlign: 'center', fontSize: '12px' }}>
        No structured JSON data available for visualization.
      </div>
    );
  }

  // Check if parsed is an array of objects
  const isArray = Array.isArray(parsed);
  const isObjectArray = isArray && parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null;

  if (isObjectArray) {
    const headers = Array.from(new Set(parsed.flatMap((item) => (typeof item === 'object' && item ? Object.keys(item) : []))));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--accent-primary)' }}>
          <Table size={16} /> Array Data Visualizer ({parsed.length} Records)
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tab)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px 12px', width: '40px' }}>#</th>
                {headers.map((h) => (
                  <th key={h} style={{ padding: '8px 12px', textTransform: 'uppercase', fontWeight: '700' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsed.slice(0, 100).map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', background: idx % 2 === 0 ? 'var(--bg-card)' : 'transparent' }}>
                  <td style={{ padding: '6px 12px', color: 'var(--text-dim)' }}>{idx + 1}</td>
                  {headers.map((h) => {
                    const val = row[h];
                    const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
                    return (
                      <td key={h} style={{ padding: '6px 12px', color: 'var(--text-main)', whiteSpace: 'nowrap', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {valStr}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Key-Value summary view for Objects
  const keys = Object.keys(parsed);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--accent-primary)' }}>
        <BarChart3 size={16} /> Object Summary Visualizer ({keys.length} Properties)
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
        {keys.map((k) => {
          const val = parsed[k];
          const valDisplay = typeof val === 'object' ? (Array.isArray(val) ? `Array (${val.length})` : 'Object') : String(val);

          return (
            <div
              key={k}
              style={{
                padding: '10px 12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{k}</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent-primary)', wordBreak: 'break-all' }}>{valDisplay}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
