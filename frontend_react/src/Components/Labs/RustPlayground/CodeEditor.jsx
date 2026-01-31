import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-rust';
import 'prismjs/themes/prism-tomorrow.css';

/**
 * View Component: CodeEditor
 * High-performance editor with Rust syntax highlighting.
 */
const CodeEditor = ({ code, setCode, isLoading, onExecute, status }) => {
    return (
        <div className="flex flex-col gap-md">
            <div className="flex items-center justify-between mb-xs">
                <label className="section-label mb-0">Source Code (.rs)</label>
                <span className="text-[10px] uppercase tracking-tighter text-secondary font-mono bg-tertiary px-xs py-[2px] border border-strong">
                    Prism.js Enabled
                </span>
            </div>

            <div className="w-full h-[400px] font-mono text-sm bg-tertiary border border-strong focus-within:ring-1 focus-within:ring-accent-primary transition-all overflow-auto custom-scrollbar">
                <Editor
                    value={code}
                    onValueChange={code => setCode(code)}
                    highlight={code => highlight(code, languages.rust)}
                    padding={16}
                    disabled={isLoading}
                    style={{
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        minHeight: '100%',
                        backgroundColor: 'transparent',
                    }}
                    textareaClassName="focus:outline-none"
                />
            </div>

            <button
                onClick={onExecute}
                disabled={isLoading}
                className={`mt-sm py-md font-bold uppercase tracking-widest text-sm transition-all border border-strong
                    ${isLoading
                        ? 'bg-secondary text-secondary cursor-not-allowed'
                        : 'bg-accent-primary text-inverse hover:bg-accent-secondary hover:-translate-y-0.5 active:translate-y-0'}`}
            >
                {isLoading ? `[ ${status} ]` : 'RUN CODE'}
            </button>
        </div>
    );
};

export default CodeEditor;
