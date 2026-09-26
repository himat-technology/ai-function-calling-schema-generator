"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ParameterDefinition, ParameterType } from "@/types/schema";
import { PARAMETER_TYPES } from "@/types/schema";
import { createEmptyParameter } from "@/lib/schema/generator";

interface Props {
  properties: ParameterDefinition[];
  onChange: (properties: ParameterDefinition[]) => void;
  depth?: number;
}

export function NestedPropertyBuilder({
  properties,
  onChange,
  depth = 0,
}: Props) {
  const update = (id: string, updates: Partial<ParameterDefinition>) => {
    onChange(
      properties.map((p) => {
        if (p.id !== id) return p;
        const next = { ...p, ...updates };
        if (updates.type === "object" && !next.properties) {
          next.properties = [];
        }
        return next;
      })
    );
  };

  const remove = (id: string) => {
    onChange(properties.filter((p) => p.id !== id));
  };

  const add = () => {
    onChange([
      ...properties,
      createEmptyParameter({ name: "", required: true }),
    ]);
  };

  return (
    <div
      className="rounded-md border border-dashed border-border p-3 space-y-3"
      style={{ marginLeft: depth > 0 ? 8 : 0 }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">
          Nested properties
        </p>
        <button type="button" className="btn btn-secondary" onClick={add}>
          <Plus className="size-3.5" />
          Add nested
        </button>
      </div>

      {properties.length === 0 && (
        <p className="hint">No nested properties yet.</p>
      )}

      {properties.map((prop) => (
        <div
          key={prop.id}
          className="rounded-md border border-border bg-card/40 p-3 space-y-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              className="input font-mono"
              value={prop.name}
              onChange={(e) => update(prop.id, { name: e.target.value })}
              placeholder="name"
              aria-label="Nested property name"
            />
            <select
              className="select"
              value={prop.type}
              onChange={(e) =>
                update(prop.id, { type: e.target.value as ParameterType })
              }
              aria-label="Nested property type"
            >
              {PARAMETER_TYPES.filter((t) => t !== "array").map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              <option value="array">array</option>
            </select>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={prop.required}
                  onChange={(e) =>
                    update(prop.id, { required: e.target.checked })
                  }
                  className="accent-primary"
                />
                Required
              </label>
              <button
                type="button"
                className="btn btn-ghost ml-auto"
                aria-label={`Delete nested property ${prop.name || ""}`}
                onClick={() => remove(prop.id)}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
          <input
            className="input"
            value={prop.description}
            onChange={(e) => update(prop.id, { description: e.target.value })}
            placeholder="Description"
            aria-label="Nested property description"
          />
          {prop.type === "object" && (
            <NestedPropertyBuilder
              properties={prop.properties ?? []}
              onChange={(nested) => update(prop.id, { properties: nested })}
              depth={depth + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
}
