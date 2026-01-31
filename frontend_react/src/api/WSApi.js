/**
 * Model Layer: WebSocket API
 * Encapsulates WebSocket connection logic
 */

/**
 * Creates and manages a WebSocket connection
 * @param {string} path - The WebSocket path (e.g., /api/v1/ws/progress)
 * @param {Object} callbacks - Event handlers
 * @param {Function} callbacks.onMessage - Called when a message is received
 * @param {Function} callbacks.onError - Called when an error occurs
 * @param {Function} callbacks.onOpen - Called when connection opens (optional)
 * @param {Function} callbacks.onClose - Called when connection closes (optional)
 * @returns {Object} Connection controller with close and send methods
 */
export const createWebSocketConnection = (path, callbacks) => {
    const { onMessage, onError, onOpen, onClose } = callbacks;

    // Determine protocol based on current page protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}${path}`;

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        if (onOpen) onOpen();
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            onMessage(data);
        } catch (err) {
            console.error('WebSocket: Failed to parse message', err);
            if (onError) onError(err);
        }
    };

    socket.onerror = (error) => {
        if (onError) onError(error);
    };

    socket.onclose = () => {
        if (onClose) onClose();
    };

    return {
        close: () => {
            socket.close();
        },
        send: (data) => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(data));
            } else {
                console.warn('WebSocket: Cannot send, connection not open');
            }
        }
    };
};
