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

        return str(formula_stack[-1].pop())


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
            return "Formula is incorrectly formatted.\n"

    ans += ("---" * (len(variables) + 3) + "\n")

    return ans


'''
DEBUG
'''

if __name__ == "__main__":
    print(SATsolve("¬(((((¬a ∧ ¬b) ∧ c) ∨ ((¬a ∧ b) ∧ ¬c)) ∨ ((a ∧ ¬b) ∧ ¬c)) ∨  ((a ∧ b) ∧ c))"))

    print(SATsolve("((x ∨ ¬(¬y ∨ (z ∧ ¬z)) ∨ w))"))
