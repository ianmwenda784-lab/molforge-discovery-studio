"""MolForge AI — RDKit microservice (FastAPI).

Deploy anywhere that runs Python (Fly.io, Cloud Run, Render, a VM) then set
RDKIT_SERVICE_URL (and RDKIT_SERVICE_TOKEN if SERVICE_TOKEN is set here) in
MolForge's project secrets.

Run locally:  pip install -r requirements.txt && uvicorn main:app --port 8000
"""
import os
from typing import Literal

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field
from rdkit import Chem, rdBase
from rdkit.Chem import QED, Crippen, Descriptors, Lipinski, rdMolDescriptors
from rdkit.Chem.Draw import rdMolDraw2D
from rdkit.Chem.FilterCatalog import FilterCatalog, FilterCatalogParams

SERVICE_VERSION = "1.0.0"
TOKEN = os.environ.get("SERVICE_TOKEN")
MAX_RECORDS = 2000

app = FastAPI(title="MolForge RDKit service", version=SERVICE_VERSION)

_params = FilterCatalogParams()
for cat in (FilterCatalogParams.FilterCatalogs.PAINS, FilterCatalogParams.FilterCatalogs.BRENK):
    _params.AddCatalog(cat)
CATALOG = FilterCatalog(_params)


def auth(authorization: str | None = Header(default=None)):
    if TOKEN and authorization != f"Bearer {TOKEN}":
        raise HTTPException(status_code=401, detail="unauthorized")


class Record(BaseModel):
    input: str = Field(max_length=200_000)
    format: Literal["smiles", "molblock"]


class ProcessRequest(BaseModel):
    records: list[Record] = Field(max_length=MAX_RECORDS)


class DepictRequest(BaseModel):
    smiles: str = Field(max_length=5000)
    width: int = Field(default=320, ge=64, le=1200)
    height: int = Field(default=240, ge=64, le=1200)


@app.get("/health", dependencies=[Depends(auth)])
def health():
    return {"status": "ok", "rdkit_version": rdBase.rdkitVersion, "service_version": SERVICE_VERSION}


def _parse(rec: Record):
    rdBase.LogToPythonStderr()
    if rec.format == "smiles":
        mol = Chem.MolFromSmiles(rec.input.strip(), sanitize=False)
    else:
        mol = Chem.MolFromMolBlock(rec.input, sanitize=False, removeHs=False)
    if mol is None:
        return None, "Could not parse structure (syntax error)."
    try:
        Chem.SanitizeMol(mol)
        mol = Chem.RemoveHs(mol)
    except Exception as e:  # valence, kekulization, aromaticity errors
        return None, f"Sanitization failed: {e}"
    if mol.GetNumAtoms() == 0:
        return None, "Structure contains no atoms."
    return mol, None


def _process(i: int, rec: Record):
    mol, err = _parse(rec)
    if mol is None:
        return {"index": i, "valid": False, "error": err}
    mw = Descriptors.MolWt(mol)
    clogp = Crippen.MolLogP(mol)
    hbd = Lipinski.NumHDonors(mol)
    hba = Lipinski.NumHAcceptors(mol)
    violations = sum([mw > 500, clogp > 5, hbd > 5, hba > 10])
    alerts = [
        {"catalog": str(m.GetProp("FilterSet")) if m.HasProp("FilterSet") else "filter", "description": m.GetDescription()}
        for m in CATALOG.GetMatches(mol)
    ]
    try:
        qed = QED.qed(mol)
    except Exception:
        qed = None
    return {
        "index": i,
        "valid": True,
        "error": None,
        "canonical_smiles": Chem.MolToSmiles(mol, isomericSmiles=True, canonical=True),
        "inchikey": Chem.MolToInchiKey(mol) or None,
        "formula": rdMolDescriptors.CalcMolFormula(mol),
        "descriptors": {
            "mw": round(mw, 4),
            "clogp": round(clogp, 4),
            "hbd": hbd,
            "hba": hba,
            "tpsa": round(rdMolDescriptors.CalcTPSA(mol), 4),
            "rotatable_bonds": rdMolDescriptors.CalcNumRotatableBonds(mol),
            "ring_count": rdMolDescriptors.CalcNumRings(mol),
            "aromatic_ring_count": rdMolDescriptors.CalcNumAromaticRings(mol),
            "heavy_atoms": mol.GetNumHeavyAtoms(),
            "qed": round(qed, 4) if qed is not None else None,
        },
        "lipinski_violations": int(violations),
        "alerts": alerts,
    }


@app.post("/process", dependencies=[Depends(auth)])
def process(req: ProcessRequest):
    return {"rdkit_version": rdBase.rdkitVersion, "results": [_process(i, r) for i, r in enumerate(req.records)]}


@app.post("/depict", dependencies=[Depends(auth)])
def depict(req: DepictRequest):
    mol = Chem.MolFromSmiles(req.smiles)
    if mol is None:
        raise HTTPException(status_code=422, detail="invalid SMILES")
    d = rdMolDraw2D.MolDraw2DSVG(req.width, req.height)
    opts = d.drawOptions()
    opts.clearBackground = False
    opts.setBackgroundColour((0, 0, 0, 0))
    opts.updateAtomPalette({6: (0.9, 0.92, 0.95)})
    opts.setSymbolColour((0.9, 0.92, 0.95))
    opts.legendColour = (0.9, 0.92, 0.95)
    d.DrawMolecule(mol)
    d.FinishDrawing()
    return {"svg": d.GetDrawingText()}
