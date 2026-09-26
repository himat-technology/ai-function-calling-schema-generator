"use client";

import { Sparkles } from "lucide-react";
import { PRESETS, clonePresetDefinition } from "@/lib/presets";
import type { FunctionDefinition } from "@/types/schema";

interface Props {
  onSelect: (definition: FunctionDefinition) => void;
}

export function PresetSelector({ onSelect }: Props) {
  return (
    <section
      className="card card-accent-amber p-4 sm:p-6"
      aria-labelledby="presets-heading"
    >
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="size-4 text-amber-300" aria-hidden />
        <h2 id="presets-heading" className="section-title">
          Production Presets
        </h2>
      </div>
      <p className="hint mb-4">
        Load a ready-made tool definition to jump-start your schema.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelect(clonePresetDefinition(preset))}
            className="preset-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <p className="text-sm font-medium text-text mb-1">{preset.label}</p>
            <p className="text-xs text-muted line-clamp-2 mb-2">
              {preset.description}
            </p>
            <code className="preset-code text-[11px] font-mono">
              {preset.definition.name}
            </code>
          </button>
        ))}
      </div>
    </section>
  );
}
