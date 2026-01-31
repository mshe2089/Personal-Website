import React from 'react';

/**
 * View Component: SatisfiabilityBadge
 * Visual indicator for SAT/UNSAT status
 */
const SatisfiabilityBadge = ({ satisfiable, count }) => {
    if (satisfiable) {
        return (
            <div className="inline-flex items-center gap-sm px-lg py-sm bg-green-100 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-600 rounded text-green-800 dark:text-green-300 font-bold uppercase tracking-wide text-sm">
                <span className="text-xl">✓</span>
                <span>Satisfiable</span>
                {count > 0 && (
                    <span className="ml-xs text-xs opacity-75">
                        ({count} solution{count !== 1 ? 's' : ''})
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-sm px-lg py-sm bg-red-100 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-600 rounded text-red-800 dark:text-red-300 font-bold uppercase tracking-wide text-sm">
            <span className="text-xl">✗</span>
            <span>Unsatisfiable</span>
        </div>
    );
};

export default SatisfiabilityBadge;
