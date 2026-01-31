import { useState, useCallback } from 'react';
import { usePolling } from './usePolling';
import { useSSE } from './useSSE';
import { useProgressWebSocket } from './useProgressWebSocket';

/**
 * useAsyncDemo: Master Controller Hook
 * Manages the method selection and delegates execution to specific hooks.
 */
export const useAsyncDemo = () => {
    const [method, setMethod] = useState('polling'); // 'polling' | 'sse' | 'websocket'
    const [logs, setLogs] = useState([]);

    const addLog = useCallback((data) => {
        setLogs(prev => [...prev, {
            time: new Date().toLocaleTimeString(),
            message: `[${data.status}] Progress: ${data.progress}%`
        }]);
    }, []);

    // Instantiate all hooks with correct endpoints
    const polling = usePolling(1000); // Poll every 1 second
    const sse = useSSE('/api/v1/stream_progress'); // SSE endpoint
    const ws = useProgressWebSocket('/api/v1/ws/progress'); // WebSocket path

    // Determine current active controller based on method
    const getActiveController = () => {
        switch (method.toUpperCase()) {
            case 'POLLING': return polling;
            case 'SSE': return sse;
            case 'WS': return ws;
            default: return polling;
        }
    };

    const activeController = getActiveController();

    const execute = () => {
        // Clear logs on new run
        setLogs([]);
        activeController.start(addLog);
    };

    return {
        method,
        setMethod,
        progress: activeController.progress,
        status: activeController.status,
        isRunning: activeController.isRunning,
        logs,
        execute
    };
};
