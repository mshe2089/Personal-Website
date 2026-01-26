import React, { useState } from "react";
import '../styles/Fonts.css';
import '../styles/SATsolver.css';

function SATsolver() {
  const [hide, setHide] = useState('hidden');
  const [formula, setFormula] = useState('');
  const [result, setResult] = useState('');

  const handleFormula = (event) => {
    setFormula(event.target.value);
  };

  const submitFormula = () => {
    console.log(encodeURIComponent(formula));
    fetch(`/api/SATsolver_script`, {  //Passing as query string
      'methods': 'GET',
      headers: {
        'Content-Type': 'application/json',
        'formula': encodeURIComponent(formula),
      }
    })
      .then(response => response.json())
      .then(response => setResult(response.result))
      .then(() => setHide(''))
      .catch(error => console.log(error))
  };

  return (
    <div className="content">
      <h1 className="title"> Truth table generator </h1>
      <br />

      <div className="entry">
        <p className="paragraph">
          This simple tool will brute force the entire truth table of your boolean SAT formula.<br />
          Made to test out asynchronus page updates. Uses some old python script I made. <br />
          <br />
          Recognized operators include conjunctions, negations, disjunctions, implications, double implications.<br />
          Recognized symbols are <b>['∧','¬','∨','→','↔','(',')']</b>. Whitespaces will be ignored.<br />
          Variables can be any non-operator, non-whitespace character.<br />
          <br />
          Parser is dumb; all operators are left-associative and have equal precidence.<br />
          For this reason, please make sure your input is sufficiently parenthesised, to avoid unintended behaviour.<br />
          eg. <b>(x ∧ y) ∨ z</b> is good because order of operations is fully specified. Try to avoid the likes of <b>x ∧ y ∨ z</b>.<br />
          Also please don't use a ton of variables, you can imagine how many combinations of assignments will be generated. <br />
        </p>

        <div className="solver-controls">
          <form id="SATsolver">
            <input type="text" id="SATformulabox" size="80" onChange={handleFormula} placeholder="eg. ((a ∨ b) ∨ ¬c) ∧ ((a ∨ ¬b) ∨ c)" />
            <button id="SATsubmit" onClick={submitFormula} type="button">Solve</button>
          </form>
        </div>
      </div>

      <hr className="divider" />

      <div id="SATresults" hidden={hide}>{result}</div>

      <hr className="divider" hidden={hide} />

      <div className="entry">
        <p className="disclaimer">
          Report bugs and submit suggestions via email.
        </p>
      </div>
    </div>
  );
}

export default SATsolver;
