import React, { useState, useEffect } from 'react';
import { GripHorizontal } from 'lucide-react';

export const SplitResizer = ({ requestHeight, onResize }) => {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const containerHeight = window.innerHeight - 80;
      const newHeightPct = (e.clientY / containerHeight) * 100;
      const clampedPct = Math.max(20, Math.min(80, newHeightPct));
      onResize(clampedPct);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, onResize]);

  return (
    <div
      onMouseDown={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDoubleClick={() => onResize(48)}
      title="Drag to resize Request / Response panes (Double-click to reset)"
      style={{
        height: '8px',
        background: isDragging ? 'var(--accent-secondary)' : '#090E17',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        cursor: 'row-resize',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
        userSelect: 'none',
        transition: 'background 0.15s ease',
      }}
    >
      <GripHorizontal size={14} color={isDragging ? '#000' : 'var(--text-dim)'} />
    </div>
  );
};
