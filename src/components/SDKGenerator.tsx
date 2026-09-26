"use client";

import { useMemo, useState } from "react";
import { Copy, Download } from "lucide-react";
import type {
  FunctionDefinition,
  SdkLanguage,
  SdkProvider,
} from "@/types/schema";
import { generateSdkCode } from "@/lib/sdk";
import { copyToClipboard, downloadFile } from "@/lib/utils";
import { useToast } from "./Toast";

const LANGS: { id: SdkLanguage; label: string }[] = [
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
];

const PROVIDERS: { id: SdkProvider; label: string }[] = [
  { id: "openai", label: "OpenAI" },
  { id: "anthropic", label: "Anthropic" },
  { id: "langchain", label: "LangChain" },
];

interface Props {
  definition: FunctionDefinition;
}

export function SDKGenerator({ definition }: Props) {
  const [language, setLanguage] = useState<SdkLanguage>("typescript");
  const [provider, setProvider] = useState<SdkProvider>("openai");
  const { toast } = useToast();

  const code = useMemo(
    () => generateSdkCode(definition, language, provider),
    [definition, language, provider]
  );

  const handleCopy = async () => {
    const ok = await copyToClipboard(code);
    toast(ok ? "Code copied to clipboard" : "Copy failed", ok ? "success" : "error");
  };

  const handleDownload = (ext: "ts" | "py") => {
    const name = definition.name.trim() || "tool";
    const content =
      ext === "ts"
        ? generateSdkCode(definition, "typescript", provider)
        : generateSdkCode(definition, "python", provider);
    downloadFile(
      content,
      `${name}.${ext}`,
      ext === "ts" ? "text/typescript" : "text/x-python"
    );
    toast(`Downloaded .${ext} file`, "success");
  };

  return (
    <section
      className="card card-accent-violet p-4 sm:p-6"
      aria-labelledby="sdk-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 id="sdk-heading" className="section-title">
          6. SDK Code Generator
        </h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-secondary" onClick={handleCopy}>
            <Copy className="size-3.5" />
            Copy Code
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleDownload("ts")}
          >
            <Download className="size-3.5" />
            Download .ts
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleDownload("py")}
          >
            <Download className="size-3.5" />
            Download .py
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div
          role="tablist"
          aria-label="SDK language"
          className="flex gap-1 border-b border-border"
        >
          {LANGS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              className="tab"
              aria-selected={language === tab.id}
              onClick={() => setLanguage(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div
          role="tablist"
          aria-label="SDK provider"
          className="flex gap-1 border-b border-border"
        >
          {PROVIDERS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              className="tab"
              aria-selected={provider === tab.id}
              onClick={() => setProvider(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <pre className="code-block" tabIndex={0} aria-label="Generated SDK code">
        {code}
      </pre>
    </section>
  );
}
