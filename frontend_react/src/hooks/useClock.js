import { useState, useEffect } from 'react';

/**
 * Hook to get the current time, updating every second.
 * @returns {Date} The current date/time.
 */
export const useClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return time;
};
