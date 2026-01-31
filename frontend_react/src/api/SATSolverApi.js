/**
 * Model Layer: SAT Solver API Service
 * Handles communication with the SAT solver backend.
 * 
 * Response shape:
 * {
 *   formula: string,
 *   variables: string[],
 *   truth_table: Array<{[variable: string]: boolean, result: boolean}>,
 *   satisfiable: boolean,
 *   satisfying_assignments: Array<{[variable: string]: boolean}>
 * }
 * OR { error: string, formula: string }
 */

export const solveFormula = async (formula) => {
    try {
        const response = await fetch(`/api/v1/SATsolver_script`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'formula': encodeURIComponent(formula),
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;  // Return structured JSON directly
    } catch (error) {
        console.error("SAT Solver API failure:", error);
        throw error;
    }
};
