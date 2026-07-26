import asyncio
from urllib.parse import unquote

from fastapi import APIRouter, Header, HTTPException

from scripts.sat import SATsolve

router = APIRouter(prefix="/api/v1", tags=["sat"])

MAX_FORMULA_CHARS = 128
MAX_VARIABLES = 12
LOGIC_SYMBOLS = {"∨", "¬", "∧", "→", "↔", "(", ")"}


@router.get("/SATsolver_script")
async def solve_sat_formula(formula: str = Header(...)) -> dict:
    decoded_formula = unquote(formula)
    if len(decoded_formula) > MAX_FORMULA_CHARS:
        raise HTTPException(
            status_code=400,
            detail=f"Formula exceeds {MAX_FORMULA_CHARS} characters",
        )

    variables = {
        character
        for character in decoded_formula
        if not character.isspace() and character not in LOGIC_SYMBOLS
    }
    if len(variables) > MAX_VARIABLES:
        raise HTTPException(
            status_code=400,
            detail=f"Formula exceeds {MAX_VARIABLES} variables",
        )

    return await asyncio.to_thread(SATsolve, decoded_formula)
