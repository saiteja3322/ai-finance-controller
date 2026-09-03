import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onBack: () => void;
  label?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onBack,
  label = 'Back',
  className = '',
}) => {
  return (
    <button
      onClick={onBack}
      className={`bg-[#1E1E1E] hover:bg-[#252525] text-gray-300 hover:text-white border border-[#252525] hover:border-[#00D09C]/40 px-3.5 py-1.5 rounded-xl font-semibold text-xs flex items-center space-x-2 transition-all duration-150 shadow-sm cursor-pointer group shrink-0 w-fit ${className}`}
    >
      <ArrowLeft className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#00D09C] group-hover:-translate-x-0.5 transition-transform" />
      <span>{label}</span>
    </button>
  );
};
