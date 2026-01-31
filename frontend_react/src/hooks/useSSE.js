import { useState, useCallback, useRef } from 'react';
import { createSSEConnection } from '../api/SSEApi';

/**
 * Controller: SSE Hook
 * Manages state for Server-Sent Events communication
 * @param {string} url - The SSE endpoint
 */
export const useSSE = (url) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Idle');
    const [isRunning, setIsRunning] = useState(false);
    const connectionRef = useRef(null);

    const start = useCallback((onMessage) => {
        setIsRunning(true);
        setProgress(0);
        setStatus('Connecting...');

        connectionRef.current = createSSEConnection(url, {
            onMessage: (data) => {
                setProgress(data.progress);
                setStatus(data.status);

                if (onMessage) onMessage(data);

                if (data.progress === 100) {
                    connectionRef.current?.close();
                    setIsRunning(false);
                }
            },
            onError: () => {
                setStatus('Connection Error');
                setIsRunning(false);
            }
        });
    }, [url]);

    const stop = useCallback(() => {
        if (connectionRef.current) {
            connectionRef.current.close();
            setIsRunning(false);
        }
    }, []);

    return { progress, status, isRunning, start, stop };
};
