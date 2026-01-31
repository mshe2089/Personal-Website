import React, { useState } from 'react';
import PageTemplate from '../../Components/Common/PageTemplate';
import { useRustTerminal } from '../../hooks/useRustTerminal';
import CodeEditor from '../../Components/Labs/RustPlayground/CodeEditor';
import TerminalOutput from '../../Components/Labs/RustPlayground/TerminalOutput';

const RustPlayground = () => {
    // We maintain the code state here to allow for real-time highlighting
    const [code, setCode] = useState(`use std::io;

fn main() {
    println!("--- Echo Node Active ---");
    println!("Type something and press enter:");

    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();

    println!("You said: {}", input.trim());
    println!("Goodbye!");
}`);

    // Access our improved, modularized terminal hook
    const {
        output,
        isRunning,
        execute,
        sendInput,
    } = useRustTerminal();

    return (
        <PageTemplate
            title="Rust Node"
            date="Jan 2026"
        >
            <div className="mb-xl">
                <p className="text-body italic border-l-4 border-accent-secondary pl-md">
                    "This won't pose a security risk at all"
                </p>
            </div>

            <div className="mb-md">
                <p className="text-body text-left">
                    Compile and execute Rust code directly on the server's rust node.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl items-start">
                <CodeEditor
                    code={code}
                    setCode={setCode}
                    isLoading={isRunning}
                    onExecute={() => execute(code)}
                    status={isRunning ? "RUNNING" : "IDLE"}
                />
                <TerminalOutput
                    output={output}
                    onInput={sendInput}
                    isRunning={isRunning}
                />
            </div>
        </PageTemplate>
    );
};

export default RustPlayground;
