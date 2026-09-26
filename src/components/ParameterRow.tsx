"use client";

import {
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import type { ParameterDefinition, ParameterType } from "@/types/schema";
import { ARRAY_ITEM_TYPES, PARAMETER_TYPES } from "@/types/schema";
import { createEmptyParameter } from "@/lib/schema/generator";
import { NestedPropertyBuilder } from "./NestedPropertyBuilder";

interface Props {
  parameter: ParameterDefinition;
  index: number;
  total: number;
  duplicateWarning?: boolean;
  onChange: (updates: Partial<ParameterDefinition>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (direction: "up" | "down") => void;
  onNestedChange: (properties: ParameterDefinition[]) => void;
  onArrayItemType: (type: ParameterType) => void;
  dragHandleProps?: {
    draggable: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragEnd: () => void;
  };
}

export function ParameterRow({
  parameter,
  index,
  total,
  duplicateWarning,
  onChange,
  onDelete,
  onDuplicate,
  onMove,
  onNestedChange,
  onArrayItemType,
  dragHandleProps,
}: Props) {
  return (
    <article
      className="rounded-lg border border-border bg-code-bg/30 p-3 sm:p-4"
      aria-label={`Parameter ${parameter.name || index + 1}`}
    >
      <div className="flex items-start gap-2 mb-3">
        <button
          type="button"
          className="btn-ghost mt-1 cursor-grab active:cursor-grabbing hidden sm:inline-flex"
          aria-label="Drag to reorder"
          title="Drag to reorder"
          {...dragHandleProps}
        >
          <GripVertical className="size-4" />
        </button>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor={`param-name-${parameter.id}`}>
              Parameter name
            </label>
            <input
              id={`param-name-${parameter.id}`}
              className="input font-mono"
              value={parameter.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="city"
              spellCheck={false}
              aria-invalid={duplicateWarning}
            />
            {duplicateWarning && (
              <p className="text-xs text-error mt-1">Duplicate parameter name</p>
            )}
          </div>
          <div>
            <label className="label" htmlFor={`param-type-${parameter.id}`}>
              Data type
            </label>
            <select
              id={`param-type-${parameter.id}`}
              className="select"
              value={parameter.type}
              onChange={(e) =>
                onChange({ type: e.target.value as ParameterType })
              }
            >
              {PARAMETER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            className="btn-ghost"
            aria-label="Move up"
            disabled={index === 0}
            onClick={() => onMove("up")}
          >
            <ChevronUp className="size-4" />
          </button>
          <button
            type="button"
            className="btn-ghost"
            aria-label="Move down"
            disabled={index === total - 1}
            onClick={() => onMove("down")}
          >
            <ChevronDown className="size-4" />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <label className="label" htmlFor={`param-desc-${parameter.id}`}>
          Description
        </label>
        <input
          id={`param-desc-${parameter.id}`}
          className="input"
          value={parameter.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="The city where the weather should be retrieved."
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-3">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={parameter.required}
            onChange={(e) => onChange({ required: e.target.checked })}
            className="accent-primary size-4"
          />
          Required
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(parameter.nullable)}
            onChange={(e) => onChange({ nullable: e.target.checked })}
            className="accent-primary size-4"
          />
          Nullable
        </label>
        {parameter.type === "string" && (
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(parameter.enumEnabled)}
              onChange={(e) =>
                onChange({
                  enumEnabled: e.target.checked,
                  enumValues: e.target.checked
                    ? parameter.enumValues?.length
                      ? parameter.enumValues
                      : [""]
                    : parameter.enumValues,
                })
              }
              className="accent-primary size-4"
            />
            Enable Enum
          </label>
        )}
      </div>

      <div className="mb-3">
        <label className="label" htmlFor={`param-default-${parameter.id}`}>
          Default value
        </label>
        <input
          id={`param-default-${parameter.id}`}
          className="input font-mono"
          value={parameter.defaultValue ?? ""}
          onChange={(e) => onChange({ defaultValue: e.target.value })}
          placeholder="optional"
        />
      </div>

      {parameter.type === "string" && parameter.enumEnabled && (
        <div className="mb-3 rounded-md border border-border p-3">
          <p className="label mb-2">Enum values</p>
          <div className="space-y-2">
            {(parameter.enumValues ?? []).map((val, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input font-mono"
                  value={val}
                  onChange={(e) => {
                    const next = [...(parameter.enumValues ?? [])];
                    next[i] = e.target.value;
                    onChange({ enumValues: next });
                  }}
                  placeholder="celsius"
                  aria-label={`Enum value ${i + 1}`}
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  aria-label={`Remove enum value ${i + 1}`}
                  onClick={() => {
                    const next = (parameter.enumValues ?? []).filter(
                      (_, idx) => idx !== i
                    );
                    onChange({ enumValues: next });
                  }}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-secondary mt-2"
            onClick={() =>
              onChange({
                enumValues: [...(parameter.enumValues ?? []), ""],
              })
            }
          >
            <Plus className="size-3.5" />
            Add value
          </button>
        </div>
      )}

      {parameter.type === "array" && (
        <div className="mb-3 rounded-md border border-border p-3">
          <label className="label" htmlFor={`array-item-${parameter.id}`}>
            Array item type
          </label>
          <select
            id={`array-item-${parameter.id}`}
            className="select"
            value={parameter.items?.type ?? "string"}
            onChange={(e) =>
              onArrayItemType(e.target.value as ParameterType)
            }
          >
            {ARRAY_ITEM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {parameter.items?.type === "object" && (
            <div className="mt-3">
              <NestedPropertyBuilder
                properties={parameter.items.properties ?? []}
                onChange={(props) =>
                  onChange({
                    items: {
                      ...(parameter.items ?? createEmptyParameter({ name: "item", type: "object" })),
                      properties: props,
                    },
                  })
                }
              />
            </div>
          )}
        </div>
      )}

      {parameter.type === "object" && (
        <div className="mb-3">
          <NestedPropertyBuilder
            properties={parameter.properties ?? []}
            onChange={onNestedChange}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1 border-t border-border/60">
        <button type="button" className="btn btn-secondary" onClick={onDuplicate}>
          <Copy className="size-3.5" />
          Duplicate
        </button>
        <button type="button" className="btn btn-danger" onClick={onDelete}>
          <Trash2 className="size-3.5" />
          Delete
        </button>
      </div>
    </article>
  );
}
