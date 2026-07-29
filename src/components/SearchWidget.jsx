import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, X, CaseSensitive, WholeWord, Regex } from 'lucide-react';

export const SearchWidget = ({
  isOpen,
  onClose,
  onSearch,
  totalMatches = 0,
  currentMatchIndex = 0,
  onNextMatch,
  onPrevMatch,
}) => {
  const [query, setQuery] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        if (e.shiftKey) {
          onPrevMatch?.();
        } else {
          onNextMatch?.();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNextMatch, onPrevMatch, onClose]);

  const handleQueryChange = (val) => {
    setQuery(val);
    onSearch?.({
      query: val,
      matchCase,
      wholeWord,
      useRegex,
    });
  };

  const toggleMatchCase = () => {
    const next = !matchCase;
    setMatchCase(next);
    onSearch?.({ query, matchCase: next, wholeWord, useRegex });
  };

  const toggleWholeWord = () => {
    const next = !wholeWord;
    setWholeWord(next);
    onSearch?.({ query, matchCase, wholeWord: next, useRegex });
  };

  const toggleUseRegex = () => {
    const next = !useRegex;
    setUseRegex(next);
    onSearch?.({ query, matchCase, wholeWord, useRegex: next });
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '8px',
        right: '16px',
        zIndex: 100,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        padding: '4px 6px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backdropFilter: 'blur(8px)',
        animation: 'slideDown 0.12s ease-out',
      }}
    >
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Input Box with Match Counter */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="text"
          className="aether-input mono"
          value={query}
          placeholder="Find (Cmd+F)"
          onChange={(e) => handleQueryChange(e.target.value)}
          style={{
            width: '180px',
            height: '26px',
            fontSize: '11px',
            paddingRight: '60px',
          }}
        />

        {/* Counter inside input */}
        <span
          style={{
            position: 'absolute',
            right: '6px',
            fontSize: '10px',
            color: totalMatches > 0 ? 'var(--text-main)' : 'var(--text-dim)',
            pointerEvents: 'none',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {query ? (totalMatches > 0 ? `${currentMatchIndex + 1}/${totalMatches}` : 'No results') : ''}
        </span>
      </div>

      {/* Options Toggles (Case, Whole Word, Regex) */}
      <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-tab)', borderRadius: '4px', padding: '1px' }}>
        <button
          type="button"
          onClick={toggleMatchCase}
          title="Match Case (Alt+C)"
          style={{
            background: matchCase ? 'var(--accent-primary)' : 'transparent',
            color: matchCase ? '#FFF' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '3px',
            padding: '2px 4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontSize: '10px',
            fontWeight: '700',
          }}
        >
          <CaseSensitive size={13} />
        </button>

        <button
          type="button"
          onClick={toggleWholeWord}
          title="Match Whole Word (Alt+W)"
          style={{
            background: wholeWord ? 'var(--accent-primary)' : 'transparent',
            color: wholeWord ? '#FFF' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '3px',
            padding: '2px 4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontSize: '10px',
            fontWeight: '700',
          }}
        >
          <WholeWord size={13} />
        </button>

        <button
          type="button"
          onClick={toggleUseRegex}
          title="Use Regular Expression (Alt+R)"
          style={{
            background: useRegex ? 'var(--accent-primary)' : 'transparent',
            color: useRegex ? '#FFF' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '3px',
            padding: '2px 4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontSize: '10px',
            fontWeight: '700',
          }}
        >
          <Regex size={13} />
        </button>
      </div>

      <div style={{ width: '1px', height: '16px', background: 'var(--border-color)' }}></div>

      {/* Navigation Arrows */}
      <div style={{ display: 'flex', gap: '2px' }}>
        <button
          type="button"
          onClick={onPrevMatch}
          disabled={totalMatches === 0}
          title="Previous Match (Shift+Enter)"
          style={{
            background: 'none',
            border: 'none',
            color: totalMatches > 0 ? 'var(--text-main)' : 'var(--text-dim)',
            cursor: totalMatches > 0 ? 'pointer' : 'default',
            padding: '2px',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronUp size={14} />
        </button>

        <button
          type="button"
          onClick={onNextMatch}
          disabled={totalMatches === 0}
          title="Next Match (Enter)"
          style={{
            background: 'none',
            border: 'none',
            color: totalMatches > 0 ? 'var(--text-main)' : 'var(--text-dim)',
            cursor: totalMatches > 0 ? 'pointer' : 'default',
            padding: '2px',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        title="Close (Escape)"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '2px',
          borderRadius: '3px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
};
