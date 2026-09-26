"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Play, X } from "lucide-react";
import type { FunctionDefinition, PayloadValidationResult } from "@/types/schema";
import { validatePayload } from "@/lib/schema/validator";
import { samplePayloadFromDefinition } from "@/lib/utils";

interface Props {
  definition: FunctionDefinition;
}

export function PayloadTester({ definition }: Props) {
  const schemaKey = useMemo(
    () =>
      JSON.stringify({
        name: definition.name,
        strict: definition.strict,
        parameters: definition.parameters.map((p) => ({
          name: p.name,
          type: p.type,
          required: p.required,
          nullable: p.nullable,
          enumEnabled: p.enumEnabled,
          enumValues: p.enumValues,
          itemsType: p.items?.type,
          properties: p.properties?.map((c) => ({
            name: c.name,
            type: c.type,
            required: c.required,
          })),
        })),
      }),
    [definition]
  );
  const [payload, setPayload] = useState(() =>
    samplePayloadFromDefinition(definition)
  );
  const [result, setResult] = useState<PayloadValidationResult | null>(null);

  useEffect(() => {
    setPayload(samplePayloadFromDefinition(definition));
    setResult(null);
    // Refresh sample when the generated schema shape changes
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: schemaKey drives refresh
  }, [schemaKey]);

  const handleValidate = () => {
    setResult(validatePayload(payload, definition));
  };

  return (
    <section
      className="card card-accent-rose p-4 sm:p-6"
      aria-labelledby="payload-heading"
    >
      <h2 id="payload-heading" className="section-title mb-1">
        5. JSON Payload Tester
      </h2>
      <p className="hint mb-4">
        Enter sample arguments and validate them against the live JSON Schema.
      </p>

      <label htmlFor="payload-input" className="label">
        Sample arguments
      </label>
      <textarea
        id="payload-input"
        className="textarea min-h-[160px] mb-3"
        value={payload}
        onChange={(e) => {
          setPayload(e.target.value);
          setResult(null);
        }}
        spellCheck={false}
        aria-describedby="payload-hint"
      />
      <p id="payload-hint" className="hint mb-4">
        Example: {"{"} &quot;query&quot;: &quot;AI agents&quot;, &quot;max_results&quot;: 5 {"}"}
      </p>

      <button type="button" className="btn btn-primary mb-4" onClick={handleValidate}>
        <Play className="size-3.5" />
        Validate Payload
      </button>

      {result && (
        <div className="space-y-3" aria-live="polite">
          <div
            className={`inline-flex items-center gap-2 badge ${
              result.valid ? "badge-success" : "badge-error"
            }`}
          >
            {result.valid ? (
              <Check className="size-3.5" aria-hidden />
            ) : (
              <X className="size-3.5" aria-hidden />
            )}
            {result.valid ? "VALID" : "INVALID"}
          </div>

          <ul className="space-y-1.5 rounded-lg border border-border bg-code-bg/50 p-3">
            {result.diagnostics.map((d, i) => (
              <li
                key={`${d.message}-${i}`}
                className={`flex items-start gap-2 text-sm font-mono ${
                  d.ok ? "text-success" : "text-error"
                }`}
              >
                <span aria-hidden>{d.ok ? "✓" : "✕"}</span>
                <span>{d.message}</span>
              </li>
            ))}
          </ul>

          {!result.valid && result.errors.length > 0 && (
            <div className="rounded-lg border border-error/30 bg-error/5 p-3">
              <p className="text-sm font-medium text-error mb-2">Errors</p>
              <ul className="space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i} className="text-sm text-error/90">
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
