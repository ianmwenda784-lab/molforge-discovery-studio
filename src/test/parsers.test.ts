import { describe, it, expect } from "vitest";
import { parseCsv, parseSdf, parseSmilesLines, toCsv } from "@/lib/parsers";

describe("parsers", () => {
  it("CSV requires a SMILES column", () => {
    const r = parseCsv("name,structure\nA,CCO\n");
    expect(r.records).toHaveLength(0);
    expect(r.errors[0]!.message).toMatch(/SMILES/);
  });
  it("CSV keeps names and reports empty SMILES cells instead of dropping them", () => {
    const r = parseCsv('Name,SMILES\n"aspirin, form A",CC(=O)Oc1ccccc1C(=O)O\nempty,\n');
    expect(r.records).toEqual([expect.objectContaining({ name: "aspirin, form A", line: 2 })]);
    expect(r.errors).toEqual([{ line: 3, message: "Empty SMILES cell." }]);
  });
  it("multiline SMILES with optional names", () => {
    const r = parseSmilesLines("CCO ethanol\n\n# c\nc1ccccc1");
    expect(r.records.map((x) => [x.input, x.name])).toEqual([["CCO", "ethanol"], ["c1ccccc1", null]]);
  });
  it("SDF splits records and flags malformed blocks", () => {
    const mb = "mol1\n  x\n\n  0  0  0  0  0  0  0  0  0  0999 V2000\nM  END\n> <p>\n1\n\n$$$$\nbad\nno end\n$$$$\n";
    const r = parseSdf(mb);
    expect(r.records).toHaveLength(1);
    expect(r.records[0]!.name).toBe("mol1");
    expect(r.errors).toHaveLength(1);
  });
  it("CSV export escapes", () => {
    expect(toCsv([{ a: 'x,"y"', b: null }], ["a", "b"])).toBe('a,b\n"x,""y""",');
  });
});
