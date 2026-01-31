import React from 'react';
import { SatisfiabilityBadge } from './SatisfiabilityBadge';
import { TruthTable } from './TruthTable';
/**
 * View Component: SolverResults
 * Displays structured SAT solver results with beautiful UI
 */
const SolverResults = ({ result, error }) => {
    // Handle errors
    if (error) {
        return (
            <div className="mt-2xl p-xl bg-red-100 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-600 rounded text-red-800 dark:text-red-300 font-mono text-left">
                <div className="font-bold text-lg mb-sm">Error</div>
                <div>{error}</div>
            </div>
        );
    }

    // Handle backend error response
    if (result?.error) {
        return (
            <div className="mt-2xl p-xl bg-red-100 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-600 rounded text-red-800 dark:text-red-300 font-mono text-left">
                <div className="font-bold text-lg mb-sm">Error</div>
                <div>{result.error}</div>
                {result.formula && (
                    <div className="mt-md text-sm opacity-75">
                        Formula: {result.formula}
                    </div>
                )}
            </div>
        );
    }

    if (!result) return null;

    const { formula, variables, truth_table, satisfiable, satisfying_assignments } = result;

    return (
        <div className="mt-2xl p-xl bg-secondary border border-default rounded-lg text-left">
            {/* Formula Display */}
            <div className="mb-lg">
                <div className="text-xs uppercase tracking-wide text-secondary mb-xs font-bold">
                    Formula
                </div>
                <div className="font-mono text-lg text-primary break-all">
                    {formula}
                </div>
            </div>

            {/* Satisfiability Badge */}
            <div className="mb-lg">
                <SatisfiabilityBadge
                    satisfiable={satisfiable}
                    count={satisfying_assignments?.length || 0}
                />
            </div>

            {/* Truth Table */}
            <div>
                <div className="text-xs uppercase tracking-wide text-secondary mb-sm font-bold">
                    Truth Table
                </div>
                <TruthTable variables={variables} truthTable={truth_table} />
            </div>
        </div>
    );
};

export default SolverResults;
