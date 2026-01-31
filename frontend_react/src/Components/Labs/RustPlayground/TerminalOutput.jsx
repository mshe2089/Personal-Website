import React, { useState, useRef, useEffect } from 'react';

/**
 * View Component: TerminalOutput
 * Interactive terminal simulator for the Lab.
 */
const TerminalOutput = ({ output, onInput, isRunning }) => {
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef(null);

    // Auto-scroll to ensure latest output is always visible
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [output]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onInput) {
            onInput(inputValue);
            setInputValue('');
        }
    };

    return (
        <div className="flex flex-col gap-md">
            <label className="section-label">Interactive Terminal</label>
            <div className="flex flex-col w-full h-[450px] bg-[#0c0c0c] border border-strong shadow-brutalist dark:shadow-brutalist-dark overflow-hidden">
                {/* Scrollable Output Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 p-md font-mono text-sm text-green-400 overflow-y-auto whitespace-pre-wrap custom-scrollbar"
                >
                    {output || '>> Waiting for deployment command...'}
                </div>

                {/* Interactive Input Layer */}
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center px-md py-sm bg-neutral-900 border-t border-strong"
                >
                    <span className="text-green-400 font-mono text-sm mr-2">❯</span>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={!isRunning}
                        placeholder={isRunning ? "Send STDIN to process..." : "Awaiting runner activation..."}
                        className="flex-1 bg-transparent border-none text-green-400 font-mono text-sm focus:outline-none disabled:opacity-30 placeholder:opacity-50"
                    />
                </form>
            </div>
        </div>
    );
};

export default TerminalOutput;
