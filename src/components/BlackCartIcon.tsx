import React from 'react';

interface BlackCartIconProps {
  className?: string;
}

export const BlackCartIcon: React.FC<BlackCartIconProps> = ({ className = 'w-5 h-5' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3 4H5L7.2 14.2C7.39 15.03 8.13 15.6 9 15.6H17.4C18.23 15.6 18.95 15.04 19.17 14.24L20.7 8.8C20.89 8.13 20.38 7.4 19.66 7.4H6.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 18.2C9.7 18.2 10.3 18.8 10.3 19.5C10.3 20.2 9.7 20.8 9 20.8C8.3 20.8 7.7 20.2 7.7 19.5C7.7 18.8 8.3 18.2 9 18.2Z"
        fill="currentColor"
      />
      <path
        d="M17.6 18.2C18.3 18.2 18.9 18.8 18.9 19.5C18.9 20.2 18.3 20.8 17.6 20.8C16.9 20.8 16.3 20.2 16.3 19.5C16.3 18.8 16.9 18.2 17.6 18.2Z"
        fill="currentColor"
      />
    </svg>
  );
};
