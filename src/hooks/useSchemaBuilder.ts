"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  FunctionDefinition,
  ParameterDefinition,
  ParameterType,
} from "@/types/schema";
import {
  createArrayItemParameter,
  createDefaultFunction,
  createEmptyParameter,
  findDuplicateParameterNames,
  generateParametersSchema,
  validateFunctionName,
} from "@/lib/schema/generator";
import { DRAFT_STORAGE_KEY } from "./useLocalStorage";

function cloneDefinition(def: FunctionDefinition): FunctionDefinition {
  return structuredClone(def);
}

export function useSchemaBuilder(initial?: FunctionDefinition) {
  const [definition, setDefinition] = useState<FunctionDefinition>(
    () => initial ?? createDefaultFunction()
  );

  const schema = useMemo(
    () => generateParametersSchema(definition),
    [definition]
  );

  const nameError = useMemo(
    () => validateFunctionName(definition.name),
    [definition.name]
  );

  const duplicateNames = useMemo(
    () => findDuplicateParameterNames(definition.parameters),
    [definition.parameters]
  );

  const setName = useCallback((name: string) => {
    setDefinition((d) => ({ ...d, name }));
  }, []);

  const setDescription = useCallback((description: string) => {
    setDefinition((d) => ({ ...d, description }));
  }, []);

  const setStrict = useCallback((strict: boolean) => {
    setDefinition((d) => ({ ...d, strict }));
  }, []);

  const loadDefinition = useCallback((def: FunctionDefinition) => {
    setDefinition(cloneDefinition(def));
  }, []);

  const reset = useCallback(() => {
    setDefinition(createDefaultFunction());
  }, []);

  const addParameter = useCallback(() => {
    setDefinition((d) => ({
      ...d,
      parameters: [...d.parameters, createEmptyParameter()],
    }));
  }, []);

  const updateParameter = useCallback(
    (id: string, updates: Partial<ParameterDefinition>) => {
      setDefinition((d) => ({
        ...d,
        parameters: d.parameters.map((p) => {
          if (p.id !== id) return p;
          const next = { ...p, ...updates };
          if (updates.type && updates.type !== p.type) {
            if (updates.type === "array" && !next.items) {
              next.items = createArrayItemParameter("string");
            }
            if (updates.type === "object" && !next.properties) {
              next.properties = [];
            }
            if (updates.type !== "string") {
              next.enumEnabled = false;
            }
          }
          return next;
        }),
      }));
    },
    []
  );

  const deleteParameter = useCallback((id: string) => {
    setDefinition((d) => ({
      ...d,
      parameters: d.parameters.filter((p) => p.id !== id),
    }));
  }, []);

  const duplicateParameter = useCallback((id: string) => {
    setDefinition((d) => {
      const idx = d.parameters.findIndex((p) => p.id === id);
      if (idx === -1) return d;
      const source = d.parameters[idx];
      const copy: ParameterDefinition = {
        ...structuredClone(source),
        id: crypto.randomUUID(),
        name: source.name ? `${source.name}_copy` : "",
      };
      if (copy.items) copy.items = { ...copy.items, id: crypto.randomUUID() };
      if (copy.properties) {
        copy.properties = copy.properties.map((c) => ({
          ...c,
          id: crypto.randomUUID(),
        }));
      }
      const parameters = [...d.parameters];
      parameters.splice(idx + 1, 0, copy);
      return { ...d, parameters };
    });
  }, []);

  const moveParameter = useCallback((id: string, direction: "up" | "down") => {
    setDefinition((d) => {
      const idx = d.parameters.findIndex((p) => p.id === id);
      if (idx === -1) return d;
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= d.parameters.length) return d;
      const parameters = [...d.parameters];
      [parameters[idx], parameters[target]] = [parameters[target], parameters[idx]];
      return { ...d, parameters };
    });
  }, []);

  const reorderParameters = useCallback((fromIndex: number, toIndex: number) => {
    setDefinition((d) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= d.parameters.length ||
        toIndex >= d.parameters.length
      ) {
        return d;
      }
      const parameters = [...d.parameters];
      const [item] = parameters.splice(fromIndex, 1);
      parameters.splice(toIndex, 0, item);
      return { ...d, parameters };
    });
  }, []);

  const setNestedProperties = useCallback(
    (parentId: string, properties: ParameterDefinition[]) => {
      setDefinition((d) => ({
        ...d,
        parameters: d.parameters.map((p) =>
          p.id === parentId ? { ...p, properties } : p
        ),
      }));
    },
    []
  );

  const setArrayItemType = useCallback((parentId: string, type: ParameterType) => {
    setDefinition((d) => ({
      ...d,
      parameters: d.parameters.map((p) => {
        if (p.id !== parentId) return p;
        return {
          ...p,
          items: createArrayItemParameter(type),
        };
      }),
    }));
  }, []);

  const saveDraft = useCallback(() => {
    try {
      window.localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify(definition)
      );
      return true;
    } catch {
      return false;
    }
  }, [definition]);

  const restoreDraft = useCallback((): boolean => {
    try {
      const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as FunctionDefinition;
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.parameters)) {
        return false;
      }
      setDefinition(parsed);
      return true;
    } catch {
      return false;
    }
  }, []);

  const clearDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return {
    definition,
    schema,
    nameError,
    duplicateNames,
    setName,
    setDescription,
    setStrict,
    loadDefinition,
    reset,
    addParameter,
    updateParameter,
    deleteParameter,
    duplicateParameter,
    moveParameter,
    reorderParameters,
    setNestedProperties,
    setArrayItemType,
    saveDraft,
    restoreDraft,
    clearDraft,
  };
}

export type SchemaBuilderApi = ReturnType<typeof useSchemaBuilder>;
