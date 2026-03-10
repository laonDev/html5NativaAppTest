import { useState, useEffect } from 'react';
import { formatCountdown } from '@/utils/format';

export function useCountdown(endTime: string | null) {
  const [display, setDisplay] = useState('00:00:00');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!endTime) {
      setIsExpired(true);
      return;
    }

    const update = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) {
        setDisplay('00:00:00');
        setIsExpired(true);
      } else {
        setDisplay(formatCountdown(endTime));
        setIsExpired(false);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return { display, isExpired };
}
