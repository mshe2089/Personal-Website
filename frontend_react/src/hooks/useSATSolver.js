import { useState } from 'react';
import { solveSatFormula } from '../api/SatApi';

export const useSATSolver = () => {
  const [formula, setFormula] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!formula.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      setResult(await solveSatFormula(formula));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    state: {
      formula,
      result,
      isLoading,
      error,
      isValid: formula.trim().length > 0,
      status: isLoading ? 'SOLVING' : 'READY',
    },
    actions: {
      handleFormulaChange: setFormula,
      submit,
    },
  };
};
