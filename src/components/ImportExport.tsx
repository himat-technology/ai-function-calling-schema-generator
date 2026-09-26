"use client";

import { useState } from "react";
import {
  Download,
  FileCode2,
  FileJson,
  FolderOpen,
  Save,
  Trash2,
} from "lucide-react";
import type { FunctionDefinition } from "@/types/schema";
import { importSchema } from "@/lib/schema/importer";
import { generateJsonSchemaString } from "@/lib/schema/generator";
import { generateSdkCode } from "@/lib/sdk";
import { downloadFile } from "@/lib/utils";
import { useToast } from "./Toast";

interface Props {
  definition: FunctionDefinition;
  onImport: (definition: FunctionDefinition) => void;
  onSaveDraft: () => boolean;
  onRestoreDraft: () => boolean;
  onClearDraft: () => void;
  onResetRequest: () => void;
}

export function ImportExport({
  definition,
  onImport,
  onSaveDraft,
  onRestoreDraft,
  onClearDraft,
  onResetRequest,
}: Props) {
  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);
  const { toast } = useToast();

  const handleImport = () => {
    const result = importSchema(importText);
    if (!result.success || !result.definition) {
      toast(result.error ?? "Import failed", "error");
      return;
    }
    onImport(result.definition);
    setShowImport(false);
    setImportText("");
    toast(`Imported ${result.format ?? "schema"} successfully`, "success");
  };

  const exportJson = () => {
    const name = definition.name.trim() || "schema";
    downloadFile(
      generateJsonSchemaString(definition),
      `${name}.schema.json`
    );
    toast("Exported JSON schema", "success");
  };

  const exportTs = () => {
    const name = definition.name.trim() || "tool";
    downloadFile(
      generateSdkCode(definition, "typescript", "openai"),
      `${name}.ts`,
      "text/typescript"
    );
    toast("Exported TypeScript", "success");
  };

  const exportPy = () => {
    const name = definition.name.trim() || "tool";
    downloadFile(
      generateSdkCode(definition, "python", "openai"),
      `${name}.py`,
      "text/x-python"
    );
    toast("Exported Python", "success");
  };

  return (
    <section
      className="card card-accent-amber p-4 sm:p-6"
      aria-labelledby="io-heading"
    >
      <h2 id="io-heading" className="section-title mb-1">
        Import / Export &amp; Drafts
      </h2>
      <p className="hint mb-4">
        Import OpenAI, Claude, or JSON Schema. Save drafts locally in your
        browser.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setShowImport((v) => !v)}
        >
          <FolderOpen className="size-3.5" />
          Import Schema
        </button>
        <button type="button" className="btn btn-secondary" onClick={exportJson}>
          <FileJson className="size-3.5" />
          Export JSON
        </button>
        <button type="button" className="btn btn-secondary" onClick={exportTs}>
          <FileCode2 className="size-3.5" />
          Export TypeScript
        </button>
        <button type="button" className="btn btn-secondary" onClick={exportPy}>
          <Download className="size-3.5" />
          Export Python
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            const ok = onSaveDraft();
            toast(
              ok ? "Draft saved locally" : "Failed to save draft",
              ok ? "success" : "error"
            );
          }}
        >
          <Save className="size-3.5" />
          Save Draft
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            const ok = onRestoreDraft();
            toast(
              ok ? "Draft restored" : "No draft found",
              ok ? "success" : "info"
            );
          }}
        >
          Restore Draft
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            onClearDraft();
            toast("Draft cleared", "info");
          }}
        >
          <Trash2 className="size-3.5" />
          Clear Draft
        </button>
        <button type="button" className="btn btn-danger" onClick={onResetRequest}>
          Reset Builder
        </button>
      </div>

      {showImport && (
        <div className="rounded-lg border border-border p-4 space-y-3">
          <label htmlFor="import-schema" className="label">
            Paste schema (JSON Schema, OpenAI tool, or Claude tool)
          </label>
          <textarea
            id="import-schema"
            className="textarea min-h-[180px]"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='{"type":"function","function":{...}}'
            spellCheck={false}
          />
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary" onClick={handleImport}>
              Import
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowImport(false);
                setImportText("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
