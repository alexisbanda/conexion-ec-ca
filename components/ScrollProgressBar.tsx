
import React from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { ECUADOR_COLORS } from '../constants';

export const ScrollProgressBar: React.FC = () => {
  const progress = useScrollProgress();

  return (
    <div className="fixed top-0 left-0 w-full h-1.5 z-50">
      <div
        className="h-full transition-all duration-150 ease-out"
        style={{ width: `${progress}%`, backgroundColor: ECUADOR_COLORS.red }}
      />
    </div>
  );
};
