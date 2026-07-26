import React from "react";
import { useSATSolver } from "../../hooks/useSATSolver";
import SolverControls from "../../Components/Fun/SATSolver/SolverControls";
import SolverResults from "../../Components/Fun/SATSolver/SolverResults";
import PageTemplate from "../../Components/Common/PageTemplate";
import Callout from "../../Components/Common/Callout";

/**
 * View: SATSolver Page
 *
 * Binds to the useSATSolver ViewModel to present the SAT Solver interface.
 */
function SATSolver() {
  // Bind to the ViewModel
  const { state, actions } = useSATSolver();

  return (
    <PageTemplate
      title="Truth table generator"
      date="Jan 2026"
      tag="Filthy cheat tool for PHIL1012"
    >
      <div className="mb-md">
        <p className="text-body">
          This simple tool will brute-force the entire truth table of your boolean SAT formula.
          Made to test out asynchronous page updates.
        </p>

        <Callout emoji="🧠" variant="note">
          <div className="space-y-md">
            <div>
              <h2 className="mb-xs font-semibold">Recognized operators</h2>
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
              <h2 className="mb-xs font-semibold">Variables</h2>
              <span>Any non-operator, non-whitespace character </span>
              <span className="opacity-75">(e.g., <code className="px-sm py-2xs bg-code text-primary rounded font-mono text-base">a</code>, <code className="px-sm py-2xs bg-code text-primary rounded font-mono text-base">x</code>, <code className="px-sm py-2xs bg-code text-primary rounded font-mono text-base">p</code>)</span>
            </div>

            <div>
              <h2 className="mb-xs font-semibold">Important notes</h2>
              <ul className="list-disc list-inside space-y-xs">
                <li>Parser is left-associative with equal precedence — use parentheses to guarantee order of operations</li>
                <li>Example: <code className="px-sm py-2xs bg-code text-primary rounded font-mono text-base">(x ∧ y) ∨ z</code> is good</li>
                <li>Avoid too many variables (exponential combinations!)</li>
              </ul>
            </div>
          </div>
        </Callout>

        <SolverControls
          formula={state.formula}
          onChange={actions.handleFormulaChange}
          onSubmit={actions.submit}
          isLoading={state.isLoading}
        />
      </div>

      <SolverResults result={state.result} error={state.error} />
    </PageTemplate>
  );
}

export default SATSolver;
