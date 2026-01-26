import React, { useState, useEffect, useRef } from 'react';
import '../styles/AsyncDemo.css';

const AsyncDemo = () => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Idle');
    const [isRunning, setIsRunning] = useState(false);
    const [method, setMethod] = useState('SSE'); // SSE, WS, POLLING
    const [logs, setLogs] = useState([]);
    const logEndRef = useRef(null);

    const addLog = (msg) => {
        setLogs(prev => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const startSSE = () => {
        setIsRunning(true);
        setProgress(0);
        setStatus('Connecting via SSE...');
        addLog('Initiating Server-Sent Events connection...');

        const eventSource = new EventSource('/api/stream_progress');

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setProgress(data.progress);
            setStatus(data.status);
            addLog(`SSE: ${data.status} (${data.progress}%)`);

            if (data.progress === 100) {
                eventSource.close();
                setIsRunning(false);
                addLog('SSE Connection closed successfully.');
            }
        };

        eventSource.onerror = (err) => {
            addLog('SSE Error: Connection lost.');
            eventSource.close();
            setIsRunning(false);
        };
    };

    const startWS = () => {
        setIsRunning(true);
        setProgress(0);
        setStatus('Connecting via WebSocket...');
        addLog('Opening WebSocket connection...');

        // Use location.host to work with tunnels/proxies
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/progress`;
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            addLog('WebSocket connected!');
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setProgress(data.progress);
            setStatus(data.status);
            addLog(`WS Message: ${data.status}`);

            if (data.progress === 100) {
                socket.close();
                setIsRunning(false);
                addLog('WebSocket session finished.');
            }
        };

        socket.onclose = () => {
            addLog('WebSocket connection closed.');
            setIsRunning(false);
        };

        socket.onerror = (err) => {
            addLog('WebSocket Error observed.');
            socket.close();
            setIsRunning(false);
        };
    };

    const startPolling = async () => {
        setIsRunning(true);
        setProgress(0);
        setStatus('Starting Background Task...');
        addLog('Posting to /api/task/start...');

        try {
            const response = await fetch('/api/task/start', { method: 'POST' });
            const { task_id } = await response.json();
            addLog(`Task assigned ID: ${task_id.substring(0, 8)}...`);

            const pollInterval = setInterval(async () => {
                const statusRes = await fetch(`/api/task/status/${task_id}`);
                const data = await statusRes.json();

                setProgress(data.progress);
                setStatus(data.status);
                addLog(`Polling Status: ${data.progress}%`);

                if (data.progress === 100) {
                    clearInterval(pollInterval);
                    setIsRunning(false);
                    addLog('Background task completed!');
                }
            }, 1000);
        } catch (err) {
            addLog('Polling Error: Failed to start task.');
            setIsRunning(false);
        }
    };

    const executeDemo = () => {
        if (method === 'SSE') startSSE();
        else if (method === 'WS') startWS();
        else if (method === 'POLLING') startPolling();
    };

    return (
        <div className="content">
            <div className="demo-card expanded">
                <h1>Async Demo</h1>
                <p className="description">
                    Explore the three pillars of real-time Python connectivity!
                </p>

                <div className="method-selector">
                    <button
                        className={method === 'SSE' ? 'active' : ''}
                        onClick={() => setMethod('SSE')}
                        disabled={isRunning}
                    >🌊 SSE</button>
                    <button
                        className={method === 'WS' ? 'active' : ''}
                        onClick={() => setMethod('WS')}
                        disabled={isRunning}
                    >🔌 WebSockets</button>
                    <button
                        className={method === 'POLLING' ? 'active' : ''}
                        onClick={() => setMethod('POLLING')}
                        disabled={isRunning}
                    >🏗️ Polling</button>
                </div>

                <div className="status-display">
                    <span className="status-label">Protocol:</span>
                    <span className="status-value">{method}</span>
                    <span className="status-separator">|</span>
                    <span className="status-label">Status:</span>
                    <span className={`status-value ${isRunning ? 'active' : ''}`}>{status}</span>
                </div>

                <div className="progress-wrapper">
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="progress-glow"></div>
                        </div>
                    </div>
                    <span className="progress-percentage">{progress}%</span>
                </div>

                <div className="log-window">
                    <div className="log-header">Live Communication Logs</div>
                    <div className="log-content">
                        {logs.map((log, i) => <div key={i} className="log-entry">{log}</div>)}
                        <div ref={logEndRef} />
                    </div>
                </div>

                <button
                    className={`demo-button ${isRunning ? 'running' : ''}`}
                    onClick={executeDemo}
                    disabled={isRunning}
                >
                    {isRunning ? 'Processing...' : `Start ${method} Demo`}
                </button>
            </div>
        </div>
    );
};

export default AsyncDemo;
