import { useState } from 'react';
import { solveFormula } from '../api/SATSolverApi';

/**
 * Controller Layer: useSATSolver Hook
 * Manages the state and logic for the SAT Solver.
 */
export const useSATSolver = () => {
    const [formula, setFormula] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFormulaChange = (value) => {
        setFormula(value);
    };

    const submit = async () => {
        if (!formula.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const solution = await solveFormula(formula);
            setResult(solution);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formula,
        result,
        isLoading,
        error,
        handleFormulaChange,
        submit
    };
};
