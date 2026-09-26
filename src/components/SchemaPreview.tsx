"use client";

import { useMemo } from "react";
import { Copy, Download, RotateCcw, Wand2 } from "lucide-react";
import type { FunctionDefinition } from "@/types/schema";
import { generateJsonSchemaString } from "@/lib/schema/generator";
import { copyToClipboard, downloadFile } from "@/lib/utils";
import { useToast } from "./Toast";

interface Props {
  definition: FunctionDefinition;
  onReset: () => void;
}

export function SchemaPreview({ definition, onReset }: Props) {
  const { toast } = useToast();
  const schemaText = useMemo(
    () => generateJsonSchemaString(definition, true),
    [definition]
  );

  const handleCopy = async () => {
    const ok = await copyToClipboard(schemaText);
    toast(ok ? "Schema copied to clipboard" : "Copy failed", ok ? "success" : "error");
  };

  const handleDownload = () => {
    const name = definition.name.trim() || "schema";
    downloadFile(schemaText, `${name}.schema.json`, "application/json");
    toast("Downloaded JSON schema", "success");
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(schemaText);
      void JSON.stringify(parsed, null, 2);
      toast("JSON is already formatted", "info");
    } catch {
      toast("Schema is not valid JSON", "error");
    }
  };

  return (
    <section
      className="card card-accent-emerald p-4 sm:p-6"
      aria-labelledby="schema-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 id="schema-heading" className="section-title">
          3. JSON Schema
        </h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-secondary" onClick={handleCopy}>
            <Copy className="size-3.5" />
            Copy Schema
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDownload}
          >
            <Download className="size-3.5" />
            Download .json
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleFormat}>
            <Wand2 className="size-3.5" />
            Format JSON
          </button>
          <button type="button" className="btn btn-ghost" onClick={onReset}>
            <RotateCcw className="size-3.5" />
            Reset
          </button>
        </div>
      </div>
      <pre className="code-block" tabIndex={0} aria-label="Generated JSON Schema">
        {schemaText}
      </pre>
    </section>
  );
}
