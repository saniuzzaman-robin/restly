import React from 'react';
import { CustomSelect } from './CustomSelect';
import { ShieldAlert, Globe, Repeat, Clock, Cpu, CheckSquare, Square, Network } from 'lucide-react';

export const DEFAULT_REQUEST_SETTINGS = {
  httpVersion: 'auto', // 'auto' | 'http1.1' | 'http2' | 'http3'
  autoEncodeUrl: true,
  disableSslVerification: false,
  followRedirects: true,
  maxRedirects: 10,
  followOriginalMethod: false,
  followAuthHeader: false,
  strictHttpParsing: false,
  requestTimeoutMs: 0, // 0 = no timeout
};

const HTTP_VERSION_OPTIONS = [
  { value: 'auto', label: 'Auto-detect / System Default' },
  { value: 'http1.1', label: 'HTTP/1.1' },
  { value: 'http2', label: 'HTTP/2' },
  { value: 'http3', label: 'HTTP/3 (QUIC)' },
];

export const RequestSettingsEditor = ({ settings = DEFAULT_REQUEST_SETTINGS, onChange }) => {
  const currentSettings = { ...DEFAULT_REQUEST_SETTINGS, ...settings };

  const handleToggle = (key) => {
    onChange({
      ...currentSettings,
      [key]: !currentSettings[key],
    });
  };

  const handleSelectChange = (key, val) => {
    onChange({
      ...currentSettings,
      [key]: val,
    });
  };

  const handleNumberChange = (key, value) => {
    const num = parseInt(value, 10);
    onChange({
      ...currentSettings,
      [key]: isNaN(num) ? 0 : Math.max(0, num),
    });
  };

  const settingRows = [
    {
      key: 'autoEncodeUrl',
      title: 'Encode URL automatically',
      description: 'Automatically encode special and non-ASCII characters in the request URL before sending.',
      icon: <Globe size={15} color="var(--accent-primary)" />,
    },
    {
      key: 'disableSslVerification',
      title: 'Disable SSL certificate verification',
      description: 'Ignore self-signed or invalid SSL/TLS certificate warnings on HTTPS target servers.',
      icon: <ShieldAlert size={15} color="#F59E0B" />,
    },
    {
      key: 'followRedirects',
      title: 'Automatically follow HTTP redirects',
      description: 'Automatically follow 3xx redirect responses from the target server.',
      icon: <Repeat size={15} color="var(--accent-primary)" />,
    },
    {
      key: 'followOriginalMethod',
      title: 'Follow original HTTP method on redirect',
      description: 'Preserve original HTTP method (e.g. POST) when redirected instead of defaulting to GET.',
      icon: <Repeat size={15} color="var(--accent-primary)" />,
    },
    {
      key: 'followAuthHeader',
      title: 'Follow Authorization header on cross-domain redirect',
      description: 'Retain Authorization header when following redirects to a different domain name.',
      icon: <Globe size={15} color="var(--accent-primary)" />,
    },
    {
      key: 'strictHttpParsing',
      title: 'Enable strict HTTP parsing',
      description: 'Enforce strict RFC-compliant header and status parsing for server responses.',
      icon: <Cpu size={15} color="var(--text-muted)" />,
    },
  ];

  return (
    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px' }}>
      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
        POSTMAN REQUEST CONFIGURATION & EXECUTION SETTINGS
      </div>

      {/* HTTP Protocol Version Selector */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <Network size={16} color="var(--accent-primary)" style={{ marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>
              HTTP Protocol Version
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Select target protocol level (HTTP/1.1, HTTP/2, HTTP/3 QUIC) for client connections.
            </div>
          </div>
        </div>

        <CustomSelect
          options={HTTP_VERSION_OPTIONS}
          value={currentSettings.httpVersion || 'auto'}
          onChange={(val) => handleSelectChange('httpVersion', val)}
          size="sm"
          style={{ width: '180px' }}
        />
      </div>

      {/* Toggle Switches Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {settingRows.map((row) => {
          const isEnabled = currentSettings[row.key];
          return (
            <div
              key={row.key}
              onClick={() => handleToggle(row.key)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ marginTop: '2px' }}>{row.icon}</div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>
                    {row.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {row.description}
                  </div>
                </div>
              </div>

              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: isEnabled ? 'var(--accent-primary)' : 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: 0,
                  marginTop: '2px'
                }}
              >
                {isEnabled ? <CheckSquare size={18} /> : <Square size={18} />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Numeric Timeout & Redirect Limit Settings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
        {/* Request Timeout Input */}
        <div style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} color="var(--accent-primary)" />
            Request Timeout (ms)
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Max wait time before aborting (0 = no limit).
          </div>
          <input
            type="number"
            className="aether-input mono"
            value={currentSettings.requestTimeoutMs || 0}
            onChange={(e) => handleNumberChange('requestTimeoutMs', e.target.value)}
            placeholder="0"
            style={{ width: '100%', padding: '4px 8px', fontSize: '12px' }}
          />
        </div>

        {/* Max Redirects Input */}
        <div style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Repeat size={14} color="var(--accent-primary)" />
            Max Redirects Limit
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Maximum redirect hops to follow (default: 10).
          </div>
          <input
            type="number"
            className="aether-input mono"
            value={currentSettings.maxRedirects || 10}
            onChange={(e) => handleNumberChange('maxRedirects', e.target.value)}
            placeholder="10"
            style={{ width: '100%', padding: '4px 8px', fontSize: '12px' }}
          />
        </div>
      </div>
    </div>
  );
};
