import { useState, useCallback, useRef } from 'react';
import { createWebSocketConnection } from '../api/WSApi';

/**
 * Controller: WebSocket Hook
 * Manages state for WebSocket communication
 * @param {string} path - The WebSocket path (e.g., /api/v1/ws/progress)
 */
export const useWebSocket = (path) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Idle');
    const [isRunning, setIsRunning] = useState(false);
    const connectionRef = useRef(null);

    const start = useCallback((onMessage) => {
        setIsRunning(true);
        setProgress(0);
        setStatus('Connecting...');

        connectionRef.current = createWebSocketConnection(path, {
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
                setStatus('WS Error');
                setIsRunning(false);
            },
            onClose: () => {
                setIsRunning(false);
            }
        });
    }, [path]);

    const stop = useCallback(() => {
        if (connectionRef.current) {
            connectionRef.current.close();
            setIsRunning(false);
        }
    }, []);

    return { progress, status, isRunning, start, stop };
};
