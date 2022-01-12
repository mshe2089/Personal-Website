def SATsolve(input):
    #Funcs
    def dec_to_bin(x):
        return list(bin(x)[2:].zfill(len(variables)))

    def test(formula, assignment):
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
        formula_stack = []

        for x,i in enumerate(formula):
            if i == ')':
                try:
                    op2 = formula_stack.pop()
                    oper = formula_stack.pop()
                    op1 = formula_stack.pop()
                    l = formula_stack.pop()
                    if (oper not in opers) or (op2 not in ops) or (op1 not in ops) or (l != '('):
                        raise
                except:
                    raise BadFormulaException

                if formula_stack and formula_stack[-1] == '¬':
                    formula_stack.pop()
                    formula_stack.append(1 - opers[oper](op1, op2))
                else:
                    formula_stack.append(opers[oper](op1, op2))

            else:
                if i in ops and formula_stack and formula_stack[-1] == '¬':
                    formula_stack.pop()
                    formula_stack.append(1 - i)
                else:
                    formula_stack.append(i)

        #Parse leftovers
        if len(formula_stack) > 1:
            try:
                op2 = formula_stack.pop()
                oper = formula_stack.pop()
                op1 = formula_stack.pop()
                if (oper not in opers) or (op2 not in ops) or (op1 not in ops) or formula_stack:
                    raise
            except:
                raise BadFormulaException

            formula_stack.append(opers[oper](op1, op2))

        return str(formula_stack.pop())


    #Main printing

    if not input: return "No formula"

    symbols = set(['∨','¬','∧','→','↔','(',')'])
    variables = []

    formula = [i for i in input if not i.isspace()]

    for i in formula:
        if not (i in symbols or i in variables):
            variables.append(i)

    variables.sort()
    last_assignment = 2**len(variables)

    ans = ""
    ans += ("Formula " + input + "\n")
    ans += ("---" * (len(variables) + 3) + "\n")

    for i in variables:
        ans += (" " + i + " ")
    ans += ("   Result\n")

    ans += ("---" * (len(variables) + 3) + "\n")
    for i in range(last_assignment):
        try:
            ans += (" " + "  ".join(dec_to_bin(i)) + "  =   " + test(formula, dec_to_bin(i)) + "\n")
        except:
            ans += ("Formula is badly formatted; cannot evaluate.\n")
            break
    ans += ("---" * (len(variables) + 3) + "\n")

    return ans


'''
    Read carefully!
    This function will output the entire truth table of a SAT formula.
    It uses brute force.
    Recognized operators include conjunctions, negations, dysjunctions, implications, double implications.
    The recognized symbols are ['∧','¬','∨','→','↔','(',')']. Whitespaces will be ignored.
    Variables can be any non-operator, non-space, non-weird character.
    Make sure your input is syntactically correct and fully (but not redundantly) parenthesised.
    eg. x ∨ y ∨ z and (x) ∨ (y ∨ z) are not okay, but (x ∨ y) ∨ z is.
'''

if __name__ == "__main__":
    print(SATsolve("((((¬a ∧ ¬b) ∧ c) ∨ ((¬a ∧ b) ∧ ¬c)) ∨ ((a ∧ ¬b) ∧ ¬c)) ∨  ((a ∧ b) ∧ c)"))

    print(SATsolve("((((a ∨ b) ∨ ¬c) ∧ ((a ∨ ¬b) ∨ c)) ∧ ((¬a ∨ b) ∨ c)) ∧ ((¬a ∨ ¬b) ∨ ¬c)"))
