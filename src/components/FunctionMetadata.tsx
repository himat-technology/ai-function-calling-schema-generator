"use client";

import type { SchemaBuilderApi } from "@/hooks/useSchemaBuilder";

interface Props {
  builder: SchemaBuilderApi;
}

export function FunctionMetadata({ builder }: Props) {
  const { definition, nameError, setName, setDescription, setStrict } = builder;

  return (
    <section
      className="card card-accent-cyan p-4 sm:p-6"
      aria-labelledby="metadata-heading"
    >
      <h2 id="metadata-heading" className="section-title mb-1">
        1. Function Metadata &amp; Settings
      </h2>
      <p className="hint mb-5">
        Define the tool name, description, and strict schema mode.
      </p>

      <div className="grid gap-4">
        <div>
          <label htmlFor="fn-name" className="label">
            Function Name
          </label>
          <input
            id="fn-name"
            className="input font-mono"
            value={definition.name}
            onChange={(e) => setName(e.target.value)}
            placeholder="search_database"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? "fn-name-error" : "fn-name-hint"}
          />
          {nameError ? (
            <p id="fn-name-error" className="mt-1.5 text-sm text-error" role="alert">
              {nameError}
            </p>
          ) : (
            <p id="fn-name-hint" className="hint mt-1.5">
              snake_case recommended · no spaces · letters, numbers, underscores
            </p>
          )}
        </div>

        <div>
          <label htmlFor="fn-desc" className="label">
            Function Description
          </label>
          <textarea
            id="fn-desc"
            className="textarea min-h-[88px]"
            value={definition.description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Execute a web search query to fetch up-to-date information and source URLs."
            rows={3}
          />
        </div>

        <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-code-bg/50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-text">Strict Schema Mode</p>
            <p className="hint mt-1">
              Sets <code className="font-mono text-xs">additionalProperties: false</code>.
              Recommended for strict structured tool calling.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            className="toggle"
            aria-checked={definition.strict}
            aria-label="Strict schema mode"
            onClick={() => setStrict(!definition.strict)}
          />
        </div>
      </div>
    </section>
  );
}
