import { useState, useCallback, useRef, useEffect } from 'react';
import { createWebSocketConnection } from '../api/WSApi';

/**
 * Controller: Generic WebSocket Hook
 * Manages state for WebSocket communication in a modular way.
 * 
 * Handles the raw connection state while allowing specialized hooks
 * to define their own message processing logic.
 */
export const useWebSocket = (path, options = {}) => {
    const [status, setStatus] = useState('IDLE');
    const [isRunning, setIsRunning] = useState(false);
    const connectionRef = useRef(null);

    const start = useCallback((callbacks = {}) => {
        setIsRunning(true);
        setStatus('CONNECTING');

        const { onMessage, onError, onClose, onOpen } = callbacks;

        connectionRef.current = createWebSocketConnection(path, {
            onOpen: () => {
                setStatus('OPEN');
                if (onOpen) onOpen();
                if (options.onOpen) options.onOpen();
            },
            onMessage: (data) => {
                if (onMessage) onMessage(data);
                if (options.onMessage) options.onMessage(data);
            },
            onError: (err) => {
                setStatus('ERROR');
                setIsRunning(false);
                if (onError) onError(err);
                if (options.onError) options.onError(err);
            },
            onClose: () => {
                setStatus('CLOSED');
                setIsRunning(false);
                if (onClose) onClose();
                if (options.onClose) options.onClose();
            }
        });
    }, [path, options]);

    const stop = useCallback(() => {
        if (connectionRef.current) {
            connectionRef.current.close();
        }
        setIsRunning(false);
    }, []);

    const send = useCallback((data) => {
        if (connectionRef.current) {
            connectionRef.current.send(data);
        }
    }, []);

    // Auto-cleanup on unmount to prevent memory leaks in the Lab
    useEffect(() => {
        return () => {
            if (connectionRef.current) {
                connectionRef.current.close();
            }
        };
    }, []);

    return { status, isRunning, start, stop, send };
};
