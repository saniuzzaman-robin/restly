import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable Horizontal Scroll Container with Left/Right Arrow Navigation.
 * Shows scroll buttons dynamically when tab contents overflow horizontally.
 */
export const ScrollableTabsContainer = ({ children, style = {}, className = '' }) => {
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    const el = containerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
    }
    return () => {
      window.removeEventListener('resize', checkScroll);
      if (el) el.removeEventListener('scroll', checkScroll);
    };
  }, [children]);

  const handleScroll = (offset) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: 0, width: '100%', ...style }} className={className}>
      {/* Left Scroll Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => handleScroll(-140)}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 15,
            padding: '0 4px',
            background: 'var(--bg-tab, #181818)',
            border: 'none',
            borderRight: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '2px 0 6px rgba(0,0,0,0.25)',
          }}
          title="Scroll Left"
        >
          <ChevronLeft size={14} />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          width: '100%',
          flex: 1,
          minWidth: 0,
        }}
        className="no-scrollbar"
      >
        {children}
      </div>

      {/* Right Scroll Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => handleScroll(140)}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 15,
            padding: '0 4px',
            background: 'var(--bg-tab, #181818)',
            border: 'none',
            borderLeft: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '-2px 0 6px rgba(0,0,0,0.25)',
          }}
          title="Scroll Right"
        >
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
};
