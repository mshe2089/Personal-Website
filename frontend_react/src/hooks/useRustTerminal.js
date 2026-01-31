import { useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

/**
 * Specialized Hook: useRustTerminal
 * Manages the interactive session with the Rust Node.
 * 
 * This hook leverages our modularized useWS to provide
 * a real-time bridge to the Rust process streams.
 */
export const useRustTerminal = () => {
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);

    // Connect to the new interactive gateway
    const ws = useWebSocket('/api/v1/rust/ws', {
        onMessage: (event) => {
            // Process structured events from the Axum backend
            switch (event.type) {
                case 'stdout':
                    setOutput(prev => prev + event.data);
                    break;
                case 'stderr':
                    setOutput(prev => prev + `>> STDERR: ${event.data}`);
                    break;
                case 'system':
                    setOutput(prev => prev + `>> SYSTEM: ${event.data}\n`);
                    break;
                case 'exit':
                    setOutput(prev => prev + `>> EXIT: ${event.data}\n`);
                    setIsRunning(false);
                    break;
                default:
                    console.warn('Unknown event type from Rust Node:', event.type);
            }
        },
        onError: (err) => {
            setOutput(prev => prev + `>> CONNECTION ERROR: ${err.message}\n`);
            setIsRunning(false);
        },
        onClose: () => {
            setIsRunning(false);
        }
    });

    const execute = useCallback((code) => {
        setOutput('');
        ws.start({
            onOpen: () => {
                // The backend expects the code as the first message
                ws.send({ code });
                setIsRunning(true);
            }
        });
    }, [ws]);

    const sendInput = useCallback((text) => {
        // Forward raw text to the process's STDIN
        ws.send(text + '\n');
    }, [ws]);

    return {
        output,
        isRunning,
        execute,
        sendInput,
        stop: ws.stop
    };
};
