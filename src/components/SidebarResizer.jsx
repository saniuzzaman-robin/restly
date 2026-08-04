import React, { useState, useEffect, useRef } from 'react';

export const SidebarResizer = ({ width = 280, onResize }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragRef = useRef({ startX: 0, startWidth: width });

  const handleMouseDown = (e) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startWidth: width };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - dragRef.current.startX;
      const newWidth = dragRef.current.startWidth + deltaX;
      const clampedWidth = Math.max(180, Math.min(550, newWidth));
      onResize(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
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
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={() => onResize(280)}
      title="Drag to resize sidebar width (Double-click to reset)"
      style={{
        position: 'relative',
        width: '1px',
        background: isDragging || isHovered ? 'var(--accent-primary)' : 'var(--border-color)',
        cursor: 'col-resize',
        zIndex: 10,
        userSelect: 'none',
        flexShrink: 0,
        transition: 'background 0.15s ease',
      }}
    >
      {/* Invisible wider hit area for easy hover/drag targeting */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '-3px',
        right: '-3px',
        cursor: 'col-resize',
      }}></div>
    </div>
  );
};
