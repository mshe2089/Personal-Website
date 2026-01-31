/**
 * Model Layer: Rust API Service
 * Handles communication with the Rust/Axum backend.
 */

export const executeRustCode = async (code) => {
    const response = await fetch('/api/v1/rust/execute', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
    });

    if (!response.ok) {
        throw new Error(`Rust Node Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
};
