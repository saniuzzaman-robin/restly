import React from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { clearAllStorage } from '../utils/storage';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Component Exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleFullReset = () => {
    if (window.confirm('Reset application cache and local state to recover from crash?')) {
      clearAllStorage();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          width: '100vw',
          background: 'var(--bg-main, #0F172A)',
          color: 'var(--text-main, #F8FAFC)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '540px',
            width: '100%',
            background: 'var(--bg-card, #1E293B)',
            border: '1px solid var(--border-color, #334155)',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#EF4444'
            }}>
              <AlertTriangle size={30} />
            </div>

            <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>
              Unexpected Execution Exception
            </h2>

            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--text-muted, #94A3B8)', lineHeight: '1.5' }}>
              Restly encountered an unexpected error. All active request loading states have been halted for recovery.
            </p>

            {this.state.error && (
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '12px',
                borderRadius: '6px',
                textAlign: 'left',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#F87171',
                marginBottom: '20px',
                overflowX: 'auto',
                maxHeight: '120px'
              }}>
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                className="aether-btn primary"
                onClick={this.handleReload}
                style={{
                  padding: '8px 18px',
                  fontSize: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  background: '#3B82F6',
                  color: '#FFF',
                  border: 'none',
                  fontWeight: '600'
                }}
              >
                <RefreshCw size={14} /> Reload Restly
              </button>

              <button
                className="aether-btn"
                onClick={this.handleFullReset}
                style={{
                  padding: '8px 18px',
                  fontSize: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  background: 'transparent',
                  color: '#EF4444',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  fontWeight: '600'
                }}
              >
                <Trash2 size={14} /> Reset Cache & Storage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
