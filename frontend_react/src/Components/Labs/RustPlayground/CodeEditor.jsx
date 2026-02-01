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
const CodeEditor = ({ code, setCode, isLoading, onExecute, onStop, status }) => {
    return (
        <div className="w-full flex flex-col gap-md">
            <style>
                {`
                    /* Theme-aware token colors */
                    .prism-editor-refined {
                        --token-comment: #999;
                        --token-punctuation: #000;
                        --token-string: #22863a;
                        --token-keyword: #d73a49;
                        --token-function: #6f42c1;
                        --token-operator: #005cc5;
                        --token-variable: #e36209;
                    }

                    .dark .prism-editor-refined {
                        --token-comment: #565f89;
                        --token-punctuation: #c0caf5;
                        --token-string: #9ece6a;
                        --token-keyword: #bb9af7;
                        --token-function: #7aa2f7;
                        --token-operator: #89ddff;
                        --token-variable: #e0af68;
                    }

                    .prism-editor-refined .token.comment { color: var(--token-comment); }
                    .prism-editor-refined .token.punctuation { color: var(--token-punctuation); font-weight: bold; }
                    .prism-editor-refined .token.string { color: var(--token-string); }
                    .prism-editor-refined .token.keyword { color: var(--token-keyword); }
                    .prism-editor-refined .token.function { color: var(--token-function); }
                    .prism-editor-refined .token.operator { color: var(--token-operator); }
                    .prism-editor-refined .token.variable { color: var(--token-variable); }
                    .prism-editor-refined .token.number { color: var(--token-variable); }
                    .prism-editor-refined .token.boolean { color: var(--token-variable); }
                `}
            </style>
            <div className="flex items-center justify-between mb-xs">
                <label className="section-label mb-0">Source Code (.rs)</label>
                <span className="text-[10px] uppercase tracking-tighter text-secondary font-mono bg-tertiary px-xs py-[2px] border border-strong">
                    High-Contrast Mode
                </span>
            </div>

            <div className="w-full h-[400px] font-mono text-sm bg-code text-primary border border-strong focus-within:ring-1 focus-within:ring-accent-primary transition-all overflow-auto custom-scrollbar prism-editor-refined">
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
                    preClassName="prism-editor-refined"
                />
            </div>

            <div className="flex gap-md mt-sm">
                <button
                    onClick={onExecute}
                    disabled={isLoading}
                    className={`flex-1 py-md font-bold uppercase tracking-widest text-sm transition-all border border-strong
                        ${isLoading
                            ? 'bg-secondary text-secondary cursor-not-allowed'
                            : 'bg-accent-primary text-inverse hover:bg-accent-secondary hover:-translate-y-0.5 active:translate-y-0'}`}
                >
                    {isLoading ? `[ ${status} ]` : 'EXECUTE'}
                </button>

                {isLoading && (
                    <button
                        onClick={onStop}
                        className="px-xl py-md font-bold uppercase tracking-widest text-sm transition-all border border-strong bg-red-600 text-white hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        STOP SIGNAL
                    </button>
                )}
            </div>
        </div>
    );
};

export default CodeEditor;
