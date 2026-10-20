import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { importCompounds, type ImportSummary } from "@/lib/rdkit.functions";
import { parseCsv, parseSdf, parseSmilesLines, type ParseResult } from "@/lib/parsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

type Mode = "manual" | "paste" | "csv" | "sdf";
const MAX_FILE = 10 * 1024 * 1024;

export function ImportDialog({ projectId, trigger }: { projectId: string; trigger: ReactNode }) {
  const qc = useQueryClient();
  const run = useServerFn(importCompounds);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("manual");
  const [smiles, setSmiles] = useState("");
  const [name, setName] = useState("");
  const [paste, setPaste] = useState("");
  const [file, setFile] = useState<{ name: string; size: number; parsed: ParseResult } | null>(null);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<(ImportSummary & { parseErrors: ParseResult["errors"] }) | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>, kind: "csv" | "sdf") {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_FILE) { toast.error("File exceeds 10 MB limit."); return; }
    const text = await f.text();
    setFile({ name: f.name, size: f.size, parsed: kind === "csv" ? parseCsv(text) : parseSdf(text) });
  }

  async function submit() {
    let parsed: ParseResult;
    if (mode === "manual") parsed = { records: smiles.trim() ? [{ input: smiles.trim(), format: "smiles", name: name.trim() || null, line: 1 }] : [], errors: [] };
    else if (mode === "paste") parsed = parseSmilesLines(paste);
    else parsed = file?.parsed ?? { records: [], errors: [] };
    if (!parsed.records.length) {
      toast.error(parsed.errors[0]?.message ?? "No structures to import.");
      if (parsed.errors.length) setSummary({ datasetId: "", serviceAvailable: true, accepted: 0, invalid: 0, duplicates: 0, uncalculated: 0, outcomes: [], parseErrors: parsed.errors });
      return;
    }
    if (parsed.records.length > 2000) { toast.error("Max 2,000 records per import. Split the file."); return; }
    setBusy(true);
    try {
      const res = await run({
        data: {
          projectId,
          sourceType: mode,
          datasetName: mode === "manual" ? `Manual entry ${new Date().toLocaleString()}` : mode === "paste" ? `Pasted SMILES ${new Date().toLocaleString()}` : file!.name,
          fileName: mode === "csv" || mode === "sdf" ? file!.name : null,
          fileSize: mode === "csv" || mode === "sdf" ? file!.size : null,
          records: parsed.records,
        },
      });
      setSummary({ ...res, parseErrors: parsed.errors });
      qc.invalidateQueries();
      if (res.serviceAvailable) toast.success(`${res.accepted} compound(s) calculated and stored`);
      else toast.warning(`${res.accepted} structure(s) stored without calculation — RDKit unavailable`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  const reset = () => { setSummary(null); setSmiles(""); setName(""); setPaste(""); setFile(null); };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import compounds</DialogTitle>
          <DialogDescription>Original input is preserved. Structures are parsed, sanitized and deduplicated by canonical SMILES with RDKit.</DialogDescription>
        </DialogHeader>
        {summary ? <SummaryView s={summary} onMore={reset} /> : (
          <Tabs value={mode} onValueChange={(v) => { setMode(v as Mode); setFile(null); }}>
            <TabsList><TabsTrigger value="manual">SMILES</TabsTrigger><TabsTrigger value="paste">Multiline</TabsTrigger><TabsTrigger value="csv">CSV</TabsTrigger><TabsTrigger value="sdf">SDF</TabsTrigger></TabsList>
            <TabsContent value="manual" className="space-y-3 pt-2">
              <div className="space-y-1.5"><Label>SMILES</Label><Input className="font-mono" value={smiles} onChange={(e) => setSmiles(e.target.value)} placeholder="CC(=O)Oc1ccccc1C(=O)O" /></div>
              <div className="space-y-1.5"><Label>Name (optional)</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            </TabsContent>
            <TabsContent value="paste" className="space-y-1.5 pt-2">
              <Label>One SMILES per line, optionally followed by a name</Label>
              <Textarea rows={10} className="font-mono text-xs" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={"CCO ethanol\nc1ccccc1 benzene"} />
            </TabsContent>
            <TabsContent value="csv" className="space-y-2 pt-2">
              <p className="text-sm text-muted-foreground">Requires a <code className="font-mono text-cyan">SMILES</code> column. Optional: <code className="font-mono">name</code>/<code className="font-mono">id</code>, <code className="font-mono">tags</code> (separated by ; or |).</p>
              <Input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e, "csv")} />
            </TabsContent>
            <TabsContent value="sdf" className="space-y-2 pt-2">
              <p className="text-sm text-muted-foreground">V2000/V3000 molblocks separated by <code className="font-mono">$$$$</code>. The first header line is used as the name.</p>
              <Input type="file" accept=".sdf,.sd,.mol" onChange={(e) => onFile(e, "sdf")} />
            </TabsContent>
            {file && (
              <p className="mt-3 text-sm">{file.name}: <b>{file.parsed.records.length}</b> records found{file.parsed.errors.length > 0 && <span className="text-destructive"> · {file.parsed.errors.length} could not be read</span>}</p>
            )}
            <div className="mt-4 flex justify-end"><Button variant="brand" onClick={submit} disabled={busy}>{busy ? "Processing…" : "Import"}</Button></div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

const outcomeLabel = {
  calculated: "Stored · calculated",
  stored_uncalculated: "Stored · not calculated",
  invalid: "Rejected · invalid",
  duplicate_in_batch: "Skipped · duplicate in import",
  duplicate_in_project: "Skipped · already in project",
};

function SummaryView({ s, onMore }: { s: ImportSummary & { parseErrors: ParseResult["errors"] }; onMore: () => void }) {
  const issues = s.outcomes.filter((o) => o.outcome !== "calculated");
  return (
    <div className="space-y-4">
      {!s.serviceAvailable && s.datasetId && (
        <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">
          RDKit is unavailable: {s.serviceMessage} All structures were saved with their original input and marked <b>Not calculated</b>. No descriptors were generated, and duplicates can't be checked until RDKit runs.
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[["Stored", s.accepted], ["Invalid", s.invalid], ["Duplicates", s.duplicates], ["Unreadable", s.parseErrors.length]].map(([l, v]) => (
          <div key={l} className="rounded-md border bg-muted/40 p-3"><p className="text-xs text-muted-foreground">{l}</p><p className="font-mono text-xl">{v}</p></div>
        ))}
      </div>
      {(issues.length > 0 || s.parseErrors.length > 0) && (
        <div className="max-h-72 overflow-auto rounded-md border">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card text-left text-muted-foreground"><tr><th className="p-2">Rec</th><th className="p-2">Input</th><th className="p-2">Result</th><th className="p-2">Detail</th></tr></thead>
            <tbody>
              {s.parseErrors.map((e) => (<tr key={`p${e.line}`} className="border-t"><td className="p-2 font-mono">{e.line}</td><td className="p-2">—</td><td className="p-2 text-destructive">Unreadable</td><td className="p-2">{e.message}</td></tr>))}
              {issues.map((o, i) => (
                <tr key={i} className="border-t"><td className="p-2 font-mono">{o.line}</td><td className="max-w-48 truncate p-2 font-mono" title={o.input}>{o.name ? `${o.name}: ` : ""}{o.input.split("\n")[0]}</td><td className="whitespace-nowrap p-2">{outcomeLabel[o.outcome]}</td><td className="p-2">{o.message}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-end"><Button variant="outline" onClick={onMore}>Import more</Button></div>
    </div>
  );
}
