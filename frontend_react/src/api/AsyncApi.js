/**
 * Model Layer: Async API Service
 * Handles background task management.
 */

export const startBackgroundTask = async (endpoint = '/api/v1/task/start') => {
    const response = await fetch(endpoint, { method: 'POST' });
    if (!response.ok) throw new Error(`Failed to start task: ${response.statusText}`);
    return await response.json(); // returns { task_id }
};

export const getTaskStatus = async (taskId, endpoint = '/api/v1/task/status/') => {
    const response = await fetch(`${endpoint}${taskId}`);
    if (!response.ok) throw new Error(`Failed to fetch status: ${response.statusText}`);
    return await response.json(); // returns { progress, status }
};
