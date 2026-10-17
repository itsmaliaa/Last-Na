import React from 'react';
import logoImage from '../assets/images/logo.png';

interface RedNexusLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  whiteText?: boolean;
}

export const RedNexusLogo: React.FC<RedNexusLogoProps> = ({
  className = '',
  size = 'md',
  whiteText = false,
}) => {
  const imageSizes = {
    sm: 'w-7',
    md: 'w-8',
    lg: 'w-9',
  };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <img
        src={logoImage}
        alt="Red Nexus logo"
        className={`${imageSizes[size]} h-auto object-contain drop-shadow-sm ${whiteText ? 'brightness-0 invert' : ''}`}
      />
      <span className="flex items-center gap-1 text-[15px] sm:text-[16px] md:text-[17px] font-black uppercase tracking-[0.04em] leading-none">
        <span className={whiteText ? 'text-white' : 'text-black'}>Red</span>
        <span className={whiteText ? 'text-white' : 'text-[#E52535]'}>Nexus</span>
      </span>
    </div>
  );
};
