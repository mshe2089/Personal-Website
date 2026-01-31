def SATsolve(input):
    """
    SAT Solver that returns structured JSON response.
    
    Returns:
        dict: {
            "formula": str,
            "variables": list[str],
            "truth_table": list[dict],
            "satisfiable": bool,
            "satisfying_assignments": list[dict]
        }
        OR {"error": str, "formula": str} on error
    """
    
    def dec_to_bin(x, num_vars):
        return list(bin(x)[2:].zfill(num_vars))

    def test(formula, assignment, variables):
        class BadFormulaException(Exception):
            pass

        """
            Defining set of (dual operand) operations and operands
        """
        opers = {
            '∨': (lambda a, b: int(a or b)),
            '∧': (lambda a, b: int(a and b)),
            '→': (lambda a, b: int(not a or b)),
            '↔': (lambda a, b: int(a == b)),
        }
        ops = set([1,0])

        """
            Replacing all operands with their assigned values
        """
        for variable, value in zip(variables, assignment):
            formula = [int(value) if i == variable else i for i in formula]

        """
            Solving for all operations
        """
        formula_stack = [[]]

        #Adds a character to a clause, then evaluates it if complete.
        def appendChar(i):
            if i in ops and formula_stack[-1] and formula_stack[-1][-1] == '¬':
                formula_stack[-1].pop()
                formula_stack[-1].append(1 - i)
            else:
                formula_stack[-1].append(i)

            if len(formula_stack[-1]) >= 3 and formula_stack[-1][-1] != '¬':
                evalClause()

        #Evaluates the innermost clause; {variable}{operator}{variable} ==> {variable}
        def evalClause():
            try:
                op2 = formula_stack[-1].pop()
                oper = formula_stack[-1].pop()
                op1 = formula_stack[-1].pop()
                if (oper not in opers) or (op2 not in ops) or (op1 not in ops) or formula_stack[-1]: raise
            except:
                raise BadFormulaException
            formula_stack[-1].append(opers[oper](op1, op2))

        for x,i in enumerate(formula):

            if i == ')':
                try:
                    i = formula_stack[-1].pop()
                    if i not in ops or formula_stack[-1]: raise
                    formula_stack.pop()
                except:
                    raise BadFormulaException
                appendChar(i)

            elif i == '(':
                formula_stack.append([])

            else:
                appendChar(i)

        #Parse leftovers
        if len(formula_stack) > 1: raise BadFormulaException

        if len(formula_stack[-1]) > 1:
            evalClause()

        return formula_stack[-1].pop()


    # Main logic
    if not input:
        return {"error": "No formula provided", "formula": ""}

    symbols = set(['∨','¬','∧','→','↔','(',')'])
    variables = []

    formula = [i for i in input if not i.isspace()]

    for i in formula:
        if not (i in symbols or i in variables):
            variables.append(i)

    variables.sort()
    num_assignments = 2**len(variables)

    # Build truth table
    truth_table = []
    satisfying_assignments = []

    for i in range(num_assignments):
        try:
            binary_assignment = dec_to_bin(i, len(variables))
            result = test(formula, binary_assignment, variables)
            
            # Create row dictionary
            row = {}
            for var, val in zip(variables, binary_assignment):
                row[var] = bool(int(val))
            row['result'] = bool(result)
            
            truth_table.append(row)
            
            # Track satisfying assignments
            if result == 1:
                satisfying_assignment = {var: bool(int(val)) for var, val in zip(variables, binary_assignment)}
                satisfying_assignments.append(satisfying_assignment)
                
        except:
            return {"error": "Formula is incorrectly formatted", "formula": input}

    return {
        "formula": input,
        "variables": variables,
        "truth_table": truth_table,
        "satisfiable": len(satisfying_assignments) > 0,
        "satisfying_assignments": satisfying_assignments
    }


'''
DEBUG
'''

if __name__ == "__main__":
    import json
    print(json.dumps(SATsolve("¬(((((¬a ∧ ¬b) ∧ c) ∨ ((¬a ∧ b) ∧ ¬c)) ∨ ((a ∧ ¬b) ∧ ¬c)) ∨  ((a ∧ b) ∧ c))"), indent=2))
    print(json.dumps(SATsolve("((x ∨ ¬(¬y ∨ (z ∧ ¬z)) ∨ w))"), indent=2))

