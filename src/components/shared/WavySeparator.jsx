import React from 'react';

export default function GeometricSeparator({ type = 'bottom', className = '' }) {
  const transform = type === 'top' ? 'scaleY(-1)' : '';

  return (
    <div 
      className={`absolute left-0 w-full z-10 leading-none ${type === 'bottom' ? '-bottom-px' : '-top-px'}`}
      style={{ transform }}
    >
      <svg
        className={`w-full h-auto ${className}`}
        viewBox="0 0 1440 100"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0,0 L1440,0 L1440,100 L0,100 Z"
          className="fill-current"
        />
      </svg>
    </div>
  );
}