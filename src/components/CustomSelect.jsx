import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select option...',
  size = 'md', // 'sm' | 'md'
  className = '',
  style = {},
  variant = 'default', // 'default' | 'method' | 'accent'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value) || {
    value,
    label: value || placeholder,
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  const isMethodVariant = variant === 'method';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'inline-block',
        userSelect: 'none',
        ...style,
      }}
      className={className}
    >
      {/* Select Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          background: isMethodVariant
            ? `var(--method-${(selectedOption.value || 'get').toLowerCase()}-bg, var(--bg-input))`
            : 'var(--bg-input)',
          color: isMethodVariant
            ? `var(--method-${(selectedOption.value || 'get').toLowerCase()}, var(--text-main))`
            : 'var(--text-main)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          padding: size === 'sm' ? '3px 8px' : '5px 10px',
          fontSize: size === 'sm' ? '11px' : '12px',
          fontWeight: isMethodVariant ? '800' : '600',
          fontFamily: isMethodVariant ? 'var(--font-mono)' : 'var(--font-sans)',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.15s ease',
          boxShadow: isOpen ? '0 0 0 2px var(--border-focus)' : 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {selectedOption.icon}
          {selectedOption.label}
        </span>
        <ChevronDown
          size={size === 'sm' ? 12 : 14}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            opacity: 0.7,
          }}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            minWidth: '100%',
            width: 'max-content',
            maxHeight: '220px',
            overflowY: 'auto',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '4px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
            zIndex: 9999,
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.12s ease-out',
          }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: size === 'sm' ? '4px 8px' : '6px 10px',
                  borderRadius: '5px',
                  fontSize: size === 'sm' ? '11px' : '12px',
                  fontWeight: isSelected ? '700' : '500',
                  color: isMethodVariant
                    ? `var(--method-${opt.value.toLowerCase()}, var(--text-main))`
                    : 'var(--text-main)',
                  background: isSelected ? 'var(--bg-card)' : 'transparent',
                  borderLeft: isSelected && !isMethodVariant ? '3px solid var(--accent-primary)' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'background 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--bg-card)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check size={12} color="var(--accent-primary)" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
