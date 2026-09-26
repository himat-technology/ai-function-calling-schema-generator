"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import type { FunctionDefinition, ProviderFormat } from "@/types/schema";
import { formatProviderOutput } from "@/lib/schema/converters";
import { copyToClipboard } from "@/lib/utils";
import { useToast } from "./Toast";

const TABS: { id: ProviderFormat; label: string }[] = [
  { id: "openai", label: "OpenAI" },
  { id: "claude", label: "Claude" },
  { id: "langchain", label: "LangChain" },
  { id: "jsonschema", label: "JSON Schema" },
];

interface Props {
  definition: FunctionDefinition;
}

export function ProviderTabs({ definition }: Props) {
  const [provider, setProvider] = useState<ProviderFormat>("openai");
  const { toast } = useToast();

  const output = useMemo(
    () => formatProviderOutput(definition, provider),
    [definition, provider]
  );

  const handleCopy = async () => {
    const ok = await copyToClipboard(output);
    toast(ok ? "Provider format copied" : "Copy failed", ok ? "success" : "error");
  };

  return (
    <section
      className="card card-accent-cyan p-4 sm:p-6"
      aria-labelledby="provider-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 id="provider-heading" className="section-title">
          4. Provider Format Converter
        </h2>
        <button type="button" className="btn btn-secondary" onClick={handleCopy}>
          <Copy className="size-3.5" />
          Copy
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Provider formats"
        className="flex flex-wrap gap-1 border-b border-border mb-4"
      >
        {TABS.map((tab) => (
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

      <pre
        className="code-block"
        role="tabpanel"
        tabIndex={0}
        aria-label={`${provider} format output`}
      >
        {output}
      </pre>
    </section>
  );
}
