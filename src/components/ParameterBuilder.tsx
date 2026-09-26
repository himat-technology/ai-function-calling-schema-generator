"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { SchemaBuilderApi } from "@/hooks/useSchemaBuilder";
import { ParameterRow } from "./ParameterRow";

interface Props {
  builder: SchemaBuilderApi;
}

export function ParameterBuilder({ builder }: Props) {
  const {
    definition,
    duplicateNames,
    addParameter,
    updateParameter,
    deleteParameter,
    duplicateParameter,
    moveParameter,
    reorderParameters,
    setNestedProperties,
    setArrayItemType,
  } = builder;

  const [dragIndex, setDragIndex] = useState<number | null>(null);

  return (
    <section
      className="card card-accent-violet p-4 sm:p-6"
      aria-labelledby="params-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <h2 id="params-heading" className="section-title">
          2. Parameter Properties
        </h2>
        <button type="button" className="btn btn-primary" onClick={addParameter}>
          <Plus className="size-4" />
          Add parameter
        </button>
      </div>
      <p className="hint mb-5">
        Add unlimited properties with types, enums, arrays, and nested objects.
      </p>

      {duplicateNames.length > 0 && (
        <div
          className="mb-4 rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-sm text-error"
          role="alert"
        >
          Duplicate parameter names: {duplicateNames.join(", ")}
        </div>
      )}

      <div className="space-y-3">
        {definition.parameters.length === 0 && (
          <p className="hint py-6 text-center border border-dashed border-border rounded-lg">
            No parameters yet. Click &quot;Add parameter&quot; or load a preset.
          </p>
        )}

        {definition.parameters.map((param, index) => (
          <ParameterRow
            key={param.id}
            parameter={param}
            index={index}
            total={definition.parameters.length}
            duplicateWarning={
              Boolean(param.name.trim()) &&
              duplicateNames.includes(param.name.trim())
            }
            onChange={(updates) => updateParameter(param.id, updates)}
            onDelete={() => deleteParameter(param.id)}
            onDuplicate={() => duplicateParameter(param.id)}
            onMove={(dir) => moveParameter(param.id, dir)}
            onNestedChange={(props) => setNestedProperties(param.id, props)}
            onArrayItemType={(type) => setArrayItemType(param.id, type)}
            dragHandleProps={{
              draggable: true,
              onDragStart: () => setDragIndex(index),
              onDragOver: (e) => {
                e.preventDefault();
              },
              onDrop: () => {
                if (dragIndex !== null && dragIndex !== index) {
                  reorderParameters(dragIndex, index);
                }
                setDragIndex(null);
              },
              onDragEnd: () => setDragIndex(null),
            }}
          />
        ))}
      </div>
    </section>
  );
}
