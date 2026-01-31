import React, { useRef, useEffect } from 'react';

export const MethodSelector = ({ method, setMethod, isRunning }) => (
    <div className="flex border-b border-strong mb-xl gap-md">
        {['SSE', 'WS', 'POLLING'].map((m) => (
            <button
                key={m}
                className={`bg-none border-none p-4 cursor-pointer font-bold text-secondary uppercase text-sm tracking-wide ${method === m ? 'text-primary border-b-4 border-strong' : ''}`}
                onClick={() => setMethod(m)}
                disabled={isRunning}
            >
                {m === 'WS' ? 'WebSockets' : m}
            </button>
        ))}
    </div>
);

export const ProgressBar = ({ progress }) => (
    <div className="progress-wrapper">
        <div className="h-[12px] bg-[#f0f0f0] mb-md border border-strong">
            <div
                className="h-full bg-accent-primary transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
            >
                {/* Glow effect handled via vanilla CSS or could be added with pseudo-classes later */}
            </div>
        </div>
        <span className="block mt-1 text-2xl font-bold text-primary text-right">{progress}%</span>
    </div>
);

export const LogWindow = ({ logs }) => {
    const logContentRef = useRef(null);

    useEffect(() => {
        if (logContentRef.current) {
            logContentRef.current.scrollTop = logContentRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="mt-2xl border border-strong">
            <div className="bg-primary text-primary border-b border-strong py-2 px-md text-xs uppercase tracking-wide">Live Communication Logs</div>
            <div className="h-[250px] p-lg font-mono text-sm leading-relaxed overflow-y-auto bg-primary text-primary" ref={logContentRef}>
                {logs.map((log, i) => <div key={i} className="border-b border-default py-1"><span className="text-secondary mr-2">[{log.time}]</span>{log.message}</div>)}
            </div>
        </div>
    );
};

