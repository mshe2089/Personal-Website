import React from 'react';
import { useAsyncDemo } from '../../hooks/useAsyncDemo';
import { MethodSelector, ProgressBar, LogWindow } from '../../Components/AsyncDemo/AsyncDemoViews';
import PageTemplate from '../../Components/Common/PageTemplate';

const AsyncDemo = () => {
    const {
        method,
        setMethod,
        progress,
        status,
        isRunning,
        logs,
        execute
    } = useAsyncDemo();

    return (
        <PageTemplate title="Async Demo" date="Jan 2026">
            <p className="italic text-secondary mb-10 text-left border-l-[3px] border-default pl-6">
                Explore the three pillars of real-time Python connectivity!
            </p>

            <div className="card-brutalist">

                <MethodSelector
                    method={method}
                    setMethod={setMethod}
                    isRunning={isRunning}
                />

                <div className="font-mono text-sm mb-lg text-primary bg-tertiary p-md text-left">
                    <span className="font-bold text-accent-secondary">Protocol:</span>
                    <span className="text-primary ml-2">{method}</span>
                    <span className="mx-2">|</span>
                    <span className="font-bold text-accent-secondary">Status:</span>
                    <span className={`text-primary ml-2 ${isRunning ? 'text-green-600 font-bold' : ''}`}>{status}</span>
                </div>

                <ProgressBar progress={progress} />

                <LogWindow logs={logs} />

                <button
                    className={`mt-lg bg-accent-primary text-inverse border border-accent-primary px-12 py-4 cursor-pointer font-bold uppercase tracking-[2px] hover:bg-accent-secondary hover:border-accent-secondary hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    onClick={execute}
                    disabled={isRunning}
                >
                    {isRunning ? 'Processing...' : `Start ${method} Demo`}
                </button>
            </div>

            <Documentation />
        </PageTemplate>
    );
};

const Documentation = () => (
    <>
        <div className="mb-md mt-3xl">
            <b className="section-label">Server-Sent Events (SSE)</b>
            <p className="text-body">
                SSE allows the server to push real-time updates to the web page over a single HTTP connection.
                It's unidirectional (Server to Client) and standard-based.
            </p>
        </div>

        <div className="mb-md">
            <b className="section-label">WebSockets</b>
            <p className="text-body">
                WebSockets provide a persistent, full-duplex connection between client and server.
                Ideal for applications requiring high-frequency updates and low latency.
            </p>
        </div>

        <div className="mb-md">
            <b className="section-label">Short Polling</b>
            <p className="text-body">
                The client repeatedly asks the server for updates at fixed intervals.
                Simple to implement and robust, but the least efficient method.
            </p>
        </div>
    </>
);

export default AsyncDemo;
