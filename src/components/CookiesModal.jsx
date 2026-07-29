import React, { useState, useEffect } from 'react';
import { X, Cookie, Plus, Trash2, Check, ShieldAlert } from 'lucide-react';

export const CookiesModal = ({ isOpen, onClose, onSaveCookies }) => {
  const [cookies, setCookies] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('localhost');
  const [newDomain, setNewDomain] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('restly_cookies');
        if (saved) {
          setCookies(JSON.parse(saved));
        } else {
          setCookies([
            { name: 'session_id', value: 'xyz123abc456', domain: 'localhost', path: '/', expires: 'Session' },
          ]);
        }
      } catch (e) {
        setCookies([]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const domains = Array.from(new Set(cookies.map((c) => c.domain || 'localhost')));
  if (!domains.includes(selectedDomain) && domains.length > 0) {
    setSelectedDomain(domains[0]);
  }

  const handleAddDomain = () => {
    if (newDomain.trim()) {
      const dom = newDomain.trim().toLowerCase();
      setSelectedDomain(dom);
      setCookies([...cookies, { name: 'cookie_name', value: 'cookie_value', domain: dom, path: '/', expires: 'Session' }]);
      setNewDomain('');
    }
  };

  const handleAddCookieRow = () => {
    setCookies([
      ...cookies,
      { name: 'new_cookie', value: 'value', domain: selectedDomain, path: '/', expires: 'Session' }
    ]);
  };

  const handleCookieChange = (index, field, val) => {
    const updated = cookies.map((c, i) => (i === index ? { ...c, [field]: val } : c));
    setCookies(updated);
  };

  const handleRemoveCookie = (index) => {
    setCookies(cookies.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('restly_cookies', JSON.stringify(cookies));
      if (onSaveCookies) onSaveCookies(cookies);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 800);
    } catch (e) {
      console.error(e);
    }
  };

  const currentDomainCookies = cookies.filter((c) => (c.domain || 'localhost') === selectedDomain);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        width: '680px',
        maxWidth: '90vw',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-tab)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cookie size={20} color="var(--accent-primary)" />
            <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>MANAGE COOKIES</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: Sidebar Domains + Cookie Editor */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Domains Sidebar */}
          <div style={{
            width: '200px',
            borderRight: '1px solid var(--border-color)',
            background: 'var(--bg-tab)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              DOMAINS
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {domains.map((dom) => (
                <button
                  key={dom}
                  onClick={() => setSelectedDomain(dom)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: selectedDomain === dom ? '600' : '400',
                    color: selectedDomain === dom ? 'var(--accent-primary)' : 'var(--text-main)',
                    background: selectedDomain === dom ? 'var(--bg-surface)' : 'transparent',
                    border: selectedDomain === dom ? '1px solid var(--border-color)' : '1px solid transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  🌐 {dom}
                </button>
              ))}
            </div>

            {/* Add Domain Input */}
            <div style={{ display: 'flex', gap: '4px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
              <input
                type="text"
                className="aether-input"
                placeholder="domain.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                style={{ flex: 1, padding: '4px 8px', fontSize: '11px' }}
              />
              <button className="aether-btn sm" onClick={handleAddDomain} style={{ padding: '4px 8px' }}>
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* Cookie Editor View */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                Cookies for <strong>{selectedDomain}</strong>
              </span>
              <button className="aether-btn sm" onClick={handleAddCookieRow}>
                <Plus size={13} /> Add Cookie
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '11px', textAlign: 'left' }}>
                  <th style={{ paddingBottom: '6px', width: '35%' }}>COOKIE NAME</th>
                  <th style={{ paddingBottom: '6px', width: '45%' }}>VALUE</th>
                  <th style={{ paddingBottom: '6px', width: '20%' }}>PATH</th>
                  <th style={{ width: '24px' }}></th>
                </tr>
              </thead>
              <tbody>
                {currentDomainCookies.map((cookie, idx) => {
                  const globalIdx = cookies.indexOf(cookie);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '4px' }}>
                        <input
                          type="text"
                          className="aether-input mono"
                          value={cookie.name || ''}
                          onChange={(e) => handleCookieChange(globalIdx, 'name', e.target.value)}
                          style={{ width: '100%', padding: '4px 6px', fontSize: '11px' }}
                        />
                      </td>
                      <td style={{ padding: '4px' }}>
                        <input
                          type="text"
                          className="aether-input mono"
                          value={cookie.value || ''}
                          onChange={(e) => handleCookieChange(globalIdx, 'value', e.target.value)}
                          style={{ width: '100%', padding: '4px 6px', fontSize: '11px' }}
                        />
                      </td>
                      <td style={{ padding: '4px' }}>
                        <input
                          type="text"
                          className="aether-input mono"
                          value={cookie.path || '/'}
                          onChange={(e) => handleCookieChange(globalIdx, 'path', e.target.value)}
                          style={{ width: '100%', padding: '4px 6px', fontSize: '11px' }}
                        />
                      </td>
                      <td style={{ padding: '4px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleRemoveCookie(globalIdx)}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px' }}
                          title="Remove cookie"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {currentDomainCookies.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '32px 0' }}>
                No cookies defined for {selectedDomain}. Click <strong>Add Cookie</strong> to add one.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-tab)'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Cookies are sent automatically with requests matching the domain.
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="aether-btn" onClick={onClose}>Cancel</button>
            <button className="aether-btn primary" onClick={handleSave}>
              {savedSuccess ? <Check size={14} color="#10B981" /> : <Cookie size={14} />}
              {savedSuccess ? 'Saved!' : 'Save Cookies'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
