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
        stop,
    } = useRustTerminal();

    return (
        <PageTemplate
            title="Rust Playground"
            date="Jan 2026"
        >
            <p className="italic text-secondary mb-10 text-left border-l-[3px] border-default pl-6">
                "This won't pose a security risk at all"
            </p>

            <div className="mb-md">
                <p className="text-body text-left">
                    Compile and execute rust code directly on the server's rust node.
                </p>
            </div>

            <div className="flex flex-col gap-xl">
                <CodeEditor
                    code={code}
                    setCode={setCode}
                    isLoading={isRunning}
                    onExecute={() => execute(code)}
                    onStop={stop}
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
