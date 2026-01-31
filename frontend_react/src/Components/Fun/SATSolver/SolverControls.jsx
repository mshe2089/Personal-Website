import React from 'react';

/**
 * View Component: SolverControls
 * Pure presentational component for inputting the formula.
 */
const SolverControls = ({ formula, onChange, onSubmit, isLoading }) => {
    return (
        <div className="my-xl">
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
                <input
                    type="text"
                    className="w-[60%] border border-strong p-sm font-mono text-base rounded-none bg-primary text-primary"
                    value={formula}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="eg. ((a ∨ b) ∨ ¬c) ∧ ((a ∨ ¬b) ∨ c)"
                    disabled={isLoading}
                />
                <button
                    className="py-sm px-lg ml-md bg-accent-primary text-inverse border border-accent-primary cursor-pointer font-bold uppercase tracking-wide text-xs hover:bg-accent-secondary hover:border-accent-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onSubmit}
                    type="button"
                    disabled={isLoading}
                >
                    {isLoading ? 'Solving...' : 'Solve'}
                </button>
            </form>
        </div>
    );
};

export default SolverControls;
