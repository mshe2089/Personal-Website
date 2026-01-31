import { useState, useCallback, useRef } from 'react';

/**
 * Controller: Generic usePolling Hook
 * @param {number} interval - Polling interval in ms
 */
export const usePolling = (interval = 1000) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Idle');
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef(null);

    const start = useCallback(async (onMessage) => {
        setIsRunning(true);
        setProgress(0);
        setStatus('Starting...');

        try {
            const { task_id } = await startBackgroundTask();

            timerRef.current = setInterval(async () => {
                try {
                    const data = await getTaskStatus(task_id);
                    setProgress(data.progress);
                    setStatus(data.status);

                    if (onMessage) onMessage(data);

                    if (data.progress === 100) {
                        clearInterval(timerRef.current);
                        setIsRunning(false);
                    }
                } catch (err) {
                    setStatus('Polling Error');
                    clearInterval(timerRef.current);
                    setIsRunning(false);
                }
            }, interval);
        } catch (err) {
            setStatus('Failed to start');
            setIsRunning(false);
        }
    }, [interval]);

    const stop = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            setIsRunning(false);
        }
    }, []);

    return { progress, status, isRunning, start, stop };
};
