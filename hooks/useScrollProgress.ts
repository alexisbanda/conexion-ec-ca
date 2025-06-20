
import { useState, useEffect } from 'react';

export const useScrollProgress = (): number => {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (scrollPx / winHeightPx) * 100;
      
      if (winHeightPx > 0) {
         setProgress(scrolled > 100 ? 100 : scrolled < 0 ? 0 : scrolled);
      } else {
        setProgress(0); // Avoid division by zero if page is not scrollable
      }
    };

    window.addEventListener('scroll', updateScrollProgress);
    
    // Call it once to set initial progress
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
    };
  }, []);

  return progress;
};
