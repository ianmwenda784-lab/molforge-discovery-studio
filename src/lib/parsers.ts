export type ParsedRecord = {
  input: string;
  format: "smiles" | "molblock";
  name: string | null;
  tags?: string[] | undefined;
  line: number;
};
export type ParseResult = { records: ParsedRecord[]; errors: { line: number; message: string }[] };

/** Multiline SMILES: "SMILES [whitespace name]" per line; blank lines and # comments skipped. */
export function parseSmilesLines(text: string): ParseResult {
  const records: ParsedRecord[] = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    const m = line.match(/^(\S+)(?:\s+(.+))?$/);
    if (!m) return;
    records.push({ input: m[1], format: "smiles", name: m[2]?.trim() || null, line: i + 1 });
  });
  return { records, errors: [] };
}

/** RFC4180-ish CSV parser (quotes, escaped quotes, CRLF). */
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else q = false;
      } else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

export function parseCsv(text: string): ParseResult {
  const rows = parseCsvRows(text.replace(/^\uFEFF/, ""));
  if (!rows.length) return { records: [], errors: [{ line: 1, message: "File is empty." }] };
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const si = header.findIndex((h) => h === "smiles" || h === "canonical_smiles" || h === "smi");
  if (si < 0) return { records: [], errors: [{ line: 1, message: `Required "SMILES" column not found. Columns: ${rows[0].join(", ")}` }] };
  const ni = header.findIndex((h) => ["name", "id", "compound_id", "compound", "title"].includes(h));
  const ti = header.findIndex((h) => h === "tags");
  const records: ParsedRecord[] = [];
  const errors: ParseResult["errors"] = [];
  rows.slice(1).forEach((r, i) => {
    const line = i + 2;
    if (r.every((c) => !c.trim())) return;
    const smi = (r[si] ?? "").trim();
    if (!smi) { errors.push({ line, message: "Empty SMILES cell." }); return; }
    records.push({
      input: smi,
      format: "smiles",
      name: ni >= 0 ? (r[ni] ?? "").trim() || null : null,
      tags: ti >= 0 ? (r[ti] ?? "").split(/[;|]/).map((t) => t.trim()).filter(Boolean) : undefined,
      line,
    });
  });
  return { records, errors };
}

/** SDF: split on $$$$; molblock = up to and including "M  END"; name = first header line. */
export function parseSdf(text: string): ParseResult {
  const records: ParsedRecord[] = [];
  const errors: ParseResult["errors"] = [];
  const blocks = text.replace(/\r\n/g, "\n").split(/^\$\$\$\$\s*$/m);
  let lineNo = 1;
  blocks.forEach((b, idx) => {
    const startLine = lineNo;
    lineNo += b.split("\n").length;
    const block = b.replace(/^\n/, "");
    if (!block.trim()) return;
    const end = block.indexOf("M  END");
    if (end < 0) { errors.push({ line: startLine, message: `Record ${idx + 1}: missing "M  END" — not a valid molblock.` }); return; }
    const molblock = block.slice(0, end + 6) + "\n";
    const name = block.split("\n")[0]?.trim() || null;
    records.push({ input: molblock, format: "molblock", name, line: idx + 1 });
  });
  return { records, errors };
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [columns.join(","), ...rows.map((r) => columns.map((c) => esc(r[c])).join(","))].join("\n");
}
