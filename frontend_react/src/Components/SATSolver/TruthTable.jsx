import React from 'react';

/**
 * View Component: TruthTable
 * Displays a beautiful, theme-aware truth table
 */
const TruthTable = ({ variables, truthTable }) => {
    if (!truthTable || truthTable.length === 0) return null;

    return (
        <div className="mt-lg overflow-x-auto">
            <table className="w-full border-collapse border border-strong">
                <thead className="bg-secondary sticky top-0">
                    <tr>
                        {variables.map((variable) => (
                            <th
                                key={variable}
                                className="border border-strong px-md py-sm text-center font-bold uppercase text-xs tracking-wide text-primary"
                            >
                                {variable}
                            </th>
                        ))}
                        <th className="border border-strong px-md py-sm text-center font-bold uppercase text-xs tracking-wide text-primary">
                            Result
                        </th>
                    </tr>
                </thead>
                <tbody className="font-mono">
                    {truthTable.map((row, index) => {
                        const isSatisfying = row.result;
                        return (
                            <tr
                                key={index}
                                className={`${isSatisfying
                                        ? 'bg-accent-primary/10 font-semibold'
                                        : 'bg-primary'
                                    } hover:bg-tertiary transition-colors`}
                            >
                                {variables.map((variable) => (
                                    <td
                                        key={variable}
                                        className="border border-default px-md py-sm text-center text-primary"
                                    >
                                        {row[variable] ? '1' : '0'}
                                    </td>
                                ))}
                                <td className="border border-default px-md py-sm text-center text-primary font-bold">
                                    {row.result ? '1' : '0'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default TruthTable;
