import React, { useState } from 'react';
import PageTemplate from '../Components/Common/PageTemplate';

const RustPlayground = () => {
    const [code, setCode] = useState('fn main() {\n    println!("Hello from the Lab!");\n}');
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('IDLE');

    const executeRust = async () => {
        setIsLoading(true);
        setStatus('COMPILING');
        setOutput('>> Initializing Axum connection...\n>> Transmitting source code...\n');

        try {
            const response = await fetch('/api/v1/rust/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            const data = await response.json();

            if (data.success) {
                setOutput(`>> COMPILATION SUCCESSFUL\n\n${data.stdout}`);
                setStatus('SUCCESS');
            } else {
                setOutput(`>> ERROR DETECTED\n\n${data.stderr}`);
                setStatus('ERROR');
            }
        } catch (error) {
            setOutput(`>> CONNECTION ERROR: Could not reach Rust Node.\n${error.message}`);
            setStatus('ERROR');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageTemplate
            title="Rust Playground"
            date="Jan 2026"
        >
            <div className="mb-xl">
                <p className="text-body italic border-l-4 border-accent-secondary pl-md">
                    High-performance, memory-safe execution via the Axum backend.
                    This node bridges the gap between web interactivity and systems-level power.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
                {/* Editor Section */}
                <div className="flex flex-col gap-md">
                    <label className="section-label">Source Code (.rs)</label>
                    <textarea
                        className="w-full h-[300px] p-md font-mono text-sm bg-tertiary text-primary border border-strong focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all resize-none"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        disabled={isLoading}
                    />
                    <button
                        onClick={executeRust}
                        disabled={isLoading}
                        className={`mt-sm py-md font-bold uppercase tracking-widest text-sm transition-all border border-strong
                            ${isLoading
                                ? 'bg-secondary text-secondary cursor-not-allowed'
                                : 'bg-accent-primary text-inverse hover:bg-accent-secondary hover:-translate-y-0.5 active:translate-y-0'}`}
                    >
                        {isLoading ? `[ ${status} ]` : 'RUN CODE'}
                    </button>
                </div>

                {/* Output Section */}
                <div className="flex flex-col gap-md">
                    <label className="section-label">Terminal Output</label>
                    <div className="w-full h-[300px] p-md font-mono text-sm bg-black text-green-400 border border-strong overflow-y-auto whitespace-pre-wrap shadow-brutalist dark:shadow-brutalist-dark">
                        {output || '>> Waiting for command...'}
                    </div>
                </div>
            </div>

            <div className="mt-3xl space-y-lg">
                <h2 className="section-label">Technical Architecture (Rust Node)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                    <div className="p-md bg-secondary border border-default">
                        <b className="block mb-2 text-accent-primary uppercase text-xs">Framework</b>
                        <p className="text-sm">Driven by <code>Axum 0.7</code>, utilizing the <code>Tokio</code> async runtime for non-blocking I/O.</p>
                    </div>
                    <div className="p-md bg-secondary border border-default">
                        <b className="block mb-2 text-accent-primary uppercase text-xs">Safety</b>
                        <p className="text-sm">Rust's ownership model ensures memory safety without a garbage collector.</p>
                    </div>
                    <div className="p-md bg-secondary border border-default">
                        <b className="block mb-2 text-accent-primary uppercase text-xs">Gateway</b>
                        <p className="text-sm">Routed via NGINX proxy paths for seamless integration with the Python core.</p>
                    </div>
                </div>
            </div>
        </PageTemplate>
    );
};

export default RustPlayground;
