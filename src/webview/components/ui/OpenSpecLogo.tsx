import React from 'react';

interface OpenSpecLogoProps {
  className?: string;
}

export function OpenSpecLogo({ className = 'w-5 h-5' }: OpenSpecLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* OpenSpec Modular Block 'O' Ring */}
      <rect x="7.5" y="3" width="4" height="2.2" rx="0.5" fill="currentColor" />
      <rect x="12.5" y="3" width="4" height="2.2" rx="0.5" fill="currentColor" />
      
      <rect x="7.5" y="18.8" width="4" height="2.2" rx="0.5" fill="currentColor" />
      <rect x="12.5" y="18.8" width="4" height="2.2" rx="0.5" fill="currentColor" />
      
      <rect x="3" y="7.5" width="2.2" height="4" rx="0.5" fill="currentColor" />
      <rect x="3" y="12.5" width="2.2" height="4" rx="0.5" fill="currentColor" />
      
      <rect x="18.8" y="7.5" width="2.2" height="4" rx="0.5" fill="currentColor" />
      <rect x="18.8" y="12.5" width="2.2" height="4" rx="0.5" fill="currentColor" />
      
      {/* Chamfered Corners */}
      <path d="M4.2 6.5L6.5 4.2C6.8 3.9 7.2 4.1 7.2 4.5V6.8C7.2 7.2 6.8 7.5 6.4 7.5H4.5C4.1 7.5 3.9 7.1 4.2 6.5Z" fill="currentColor" />
      <path d="M19.8 6.5L17.5 4.2C17.2 3.9 16.8 4.1 16.8 4.5V6.8C16.8 7.2 17.2 7.5 17.6 7.5H19.5C19.9 7.5 20.1 7.1 19.8 6.5Z" fill="currentColor" />
      <path d="M4.2 17.5L6.5 19.8C6.8 20.1 7.2 19.9 7.2 19.5V17.2C7.2 16.8 6.8 16.5 6.4 16.5H4.5C4.1 16.5 3.9 16.9 4.2 17.5Z" fill="currentColor" />
      <path d="M19.8 17.5L17.5 19.8C17.2 20.1 16.8 19.9 16.8 19.5V17.2C16.8 16.8 17.2 16.5 17.6 16.5H19.5C19.9 16.5 20.1 16.9 19.8 17.5Z" fill="currentColor" />

      {/* Studio Spec Layer Stack */}
      <path d="M12 7.5L15.8 9.5L12 11.5L8.2 9.5L12 7.5Z" fill="currentColor" />
      <path d="M8.2 11.6L12 13.6L15.8 11.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.2 13.8L12 15.8L15.8 13.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
