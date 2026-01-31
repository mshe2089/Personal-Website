import { useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

/**
 * Specialized Hook: useProgressWebSocket
 * Wraps the generic useWebSocket to handle progress-specific data.
 */
export const useProgressWebSocket = (path) => {
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('Idle');

    const ws = useWebSocket(path, {
        onMessage: (data) => {
            // Update progress-specific state
            if (data.progress !== undefined) setProgress(data.progress);
            if (data.status) setStatusText(data.status);

            // Auto-stop if progress is complete
            if (data.progress === 100) {
                ws.stop();
            }
        },
        onError: () => setStatusText('WS Error')
    });

    const start = useCallback((onMessage) => {
        setProgress(0);
        ws.start({
            onMessage: (data) => {
                if (onMessage) onMessage(data);
            }
        });
    }, [ws]);

    return {
        progress,
        status: statusText,
        isRunning: ws.isRunning,
        start,
        stop: ws.stop
    };
};
