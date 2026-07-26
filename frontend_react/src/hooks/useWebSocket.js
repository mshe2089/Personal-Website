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

    const optionsRef = useRef(options);
    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    const start = useCallback((callbacks = {}) => {
        setIsRunning(true);
        setStatus('CONNECTING');

        const { onMessage, onError, onClose, onOpen } = callbacks;

        connectionRef.current = createWebSocketConnection(path, {
            onOpen: () => {
                console.log(`WebSocket [${path}]: OPEN`);
                setStatus('OPEN');
                if (onOpen) onOpen();
                if (optionsRef.current.onOpen) optionsRef.current.onOpen();
            },
            onMessage: (data) => {
                if (onMessage) onMessage(data);
                if (optionsRef.current.onMessage) optionsRef.current.onMessage(data);
            },
            onError: (err) => {
                console.error(`WebSocket [${path}]: ERROR`, err);
                setStatus('ERROR');
                setIsRunning(false);
                if (onError) onError(err);
                if (optionsRef.current.onError) optionsRef.current.onError(err);
            },
            onClose: () => {
                console.log(`WebSocket [${path}]: CLOSED`);
                setStatus('CLOSED');
                setIsRunning(false);
                if (onClose) onClose();
                if (optionsRef.current.onClose) optionsRef.current.onClose();
            }
        });
    }, [path]); // Only depend on path, use ref for options

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
