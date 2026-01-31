/**
 * Model Layer: SSE API
 * Encapsulates Server-Sent Events connection logic
 */

/**
 * Creates and manages an SSE connection
 * @param {string} url - The SSE endpoint URL
 * @param {Object} callbacks - Event handlers
 * @param {Function} callbacks.onMessage - Called when a message is received
 * @param {Function} callbacks.onError - Called when an error occurs
 * @param {Function} callbacks.onOpen - Called when connection opens (optional)
 * @returns {Object} Connection controller with close method
 */
export const createSSEConnection = (url, callbacks) => {
    const { onMessage, onError, onOpen } = callbacks;

    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
        if (onOpen) onOpen();
    };

    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            onMessage(data);
        } catch (err) {
            console.error('SSE: Failed to parse message', err);
            if (onError) onError(err);
        }
    };

    eventSource.onerror = (error) => {
        if (onError) onError(error);
        eventSource.close();
    };

    return {
        close: () => {
            eventSource.close();
        }
    };
};
