export const solveSatFormula = async (formula) => {
  const response = await fetch('/api/v1/python/SATsolver_script', {
    method: 'GET',
    headers: {
      formula: encodeURIComponent(formula),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `SAT request failed with HTTP ${response.status}`);
  }

  return response.json();
};
