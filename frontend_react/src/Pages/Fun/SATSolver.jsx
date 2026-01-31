import React from "react";
import { useSATSolver } from "../../hooks/useSATSolver";
import SolverControls from "../../Components/Fun/SATSolver/SolverControls";
import SolverResults from "../../Components/Fun/SATSolver/SolverResults";
import PageTemplate from "../../Components/Common/PageTemplate";

function SATSolver() {
  const {
    formula,
    result,
    isLoading,
    error,
    handleFormulaChange,
    submit
  } = useSATSolver();

  return (
    <PageTemplate title="Truth table generator" date="Jan 2026">
      <div className="mb-md">
        <p className="text-body">
          This simple tool will brute-force the entire truth table of your boolean SAT formula.
          Made to test out asynchronous page updates.
        </p>

        <div className="mt-lg space-y-md">
          <div>
            <span className="font-semibold text-primary">Recognized operators:</span>
            <ul className="mt-xs list-disc list-inside space-y-xs text-primary">
              <li><code className="px-sm py-2xs bg-code text-primary rounded font-mono text-base">∧</code> and</li>
              <li><code className="px-sm py-2xs bg-code text-primary rounded font-mono text-base">¬</code> not</li>
              <li><code className="px-sm py-2xs bg-code text-primary rounded font-mono text-base">∨</code> or</li>
              <li><code className="px-sm py-2xs bg-code text-primary rounded font-mono text-base">→</code> implies</li>
              <li><code className="px-sm py-2xs bg-code text-primary rounded font-mono text-base">↔</code> iff</li>
              <li><code className="px-sm py-2xs bg-code text-primary rounded font-mono text-base">( )</code> parentheses</li>
            </ul>
          </div>

          <div>
            <span className="font-semibold text-primary">Variables:</span>
            <span className="ml-xs text-primary">Any non-operator, non-whitespace character</span>
            <span className="ml-xs text-secondary font-sans">(e.g., <code className="px-sm py-2xs bg-code text-primary rounded font-mono text-base">a</code>, <code className="px-sm py-2xs bg-code text-primary rounded font-mono text-base">x</code>, <code className="px-sm py-2xs bg-code text-primary rounded font-mono text-base">p</code>)</span>
          </div>

          <div className="p-md bg-tertiary border-l-4 border-accent-primary rounded">
            <div className="font-semibold text-primary mb-xs">Important Notes:</div>
            <ul className="list-disc list-inside space-y-xs text-primary">
              <li>Parser is left-associative with equal precedence — use parentheses to gaurantee order of operations</li>
              <li>Example: <code className="px-sm py-2xs bg-code text-primary rounded font-mono text-base">(x ∧ y) ∨ z</code> is good</li>
              <li>Avoid too many variables (exponential combinations!)</li>
            </ul>
          </div>
        </div>

        <SolverControls
          formula={formula}
          onChange={handleFormulaChange}
          onSubmit={submit}
          isLoading={isLoading}
        />
      </div>

      <SolverResults result={result} error={error} />
    </PageTemplate>
  );
}

export default SATSolver;
