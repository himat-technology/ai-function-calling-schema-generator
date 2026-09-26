import type {
  FunctionDefinition,
  JsonSchemaObject,
  ParameterDefinition,
  ParameterType,
} from "@/types/schema";

function resolveType(
  type: ParameterType,
  nullable?: boolean
): string | string[] {
  if (nullable) {
    return [type, "null"];
  }
  return type;
}

function parameterToSchema(param: ParameterDefinition): JsonSchemaObject {
  const schema: JsonSchemaObject = {
    type: resolveType(param.type, param.nullable),
  };

  if (param.description.trim()) {
    schema.description = param.description.trim();
  }

  if (
    param.type === "string" &&
    param.enumEnabled &&
    param.enumValues &&
    param.enumValues.length > 0
  ) {
    schema.enum = param.enumValues.filter((v) => v.trim() !== "");
  }

  if (param.defaultValue !== undefined && param.defaultValue !== "") {
    schema.default = coerceDefault(param.type, param.defaultValue);
  }

  if (param.type === "array") {
    if (param.items) {
      schema.items = parameterToSchema(param.items);
    } else {
      schema.items = { type: "string" };
    }
  }

  if (param.type === "object") {
    const nested = param.properties ?? [];
    schema.properties = {};
    for (const child of nested) {
      if (!child.name.trim()) continue;
      schema.properties[child.name.trim()] = parameterToSchema(child);
    }
    const required = nested
      .filter((p) => p.required && p.name.trim())
      .map((p) => p.name.trim());
    if (required.length > 0) {
      schema.required = required;
    }
    schema.additionalProperties = false;
  }

  return schema;
}

function coerceDefault(type: ParameterType, value: string): unknown {
  switch (type) {
    case "number": {
      const n = Number(value);
      return Number.isFinite(n) ? n : value;
    }
    case "integer": {
      const n = parseInt(value, 10);
      return Number.isFinite(n) ? n : value;
    }
    case "boolean":
      if (value === "true") return true;
      if (value === "false") return false;
      return value;
    case "array":
    case "object":
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
}

/** Build a JSON Schema object for function parameters */
export function generateParametersSchema(
  definition: FunctionDefinition
): JsonSchemaObject {
  const properties: Record<string, JsonSchemaObject> = {};
  const required: string[] = [];

  for (const param of definition.parameters) {
    const name = param.name.trim();
    if (!name) continue;
    properties[name] = parameterToSchema(param);
    if (param.required) {
      required.push(name);
    }
  }

  const schema: JsonSchemaObject = {
    type: "object",
    properties,
  };

  if (required.length > 0) {
    schema.required = required;
  }

  if (definition.strict) {
    schema.additionalProperties = false;
  }

  return schema;
}

export function generateJsonSchemaString(
  definition: FunctionDefinition,
  pretty = true
): string {
  const schema = generateParametersSchema(definition);
  return pretty ? JSON.stringify(schema, null, 2) : JSON.stringify(schema);
}

export function createEmptyParameter(
  overrides?: Partial<ParameterDefinition>
): ParameterDefinition {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `param_${Math.random().toString(36).slice(2)}_${Date.now()}`;

  return {
    id,
    name: "",
    type: "string",
    description: "",
    required: true,
    enumEnabled: false,
    enumValues: [],
    nullable: false,
    ...overrides,
  };
}

export function createArrayItemParameter(
  type: ParameterType = "string"
): ParameterDefinition {
  return createEmptyParameter({
    name: "item",
    type,
    required: false,
    description: "",
    properties: type === "object" ? [] : undefined,
  });
}

export function createDefaultFunction(): FunctionDefinition {
  return {
    name: "search_database",
    description:
      "Execute a web search query to fetch up-to-date information and source URLs.",
    strict: true,
    parameters: [
      createEmptyParameter({
        id: "default-param-query",
        name: "query",
        type: "string",
        description: "Search query",
        required: true,
      }),
    ],
  };
}

export function validateFunctionName(name: string): string | null {
  if (!name.trim()) {
    return "Function name is required.";
  }
  if (/\s/.test(name)) {
    return "Function name cannot contain spaces.";
  }
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    return "Use letters, numbers, and underscores only (snake_case recommended).";
  }
  if (name.length > 64) {
    return "Function name must be 64 characters or fewer.";
  }
  return null;
}

export function findDuplicateParameterNames(
  parameters: ParameterDefinition[]
): string[] {
  const seen = new Map<string, number>();
  for (const p of parameters) {
    const n = p.name.trim();
    if (!n) continue;
    seen.set(n, (seen.get(n) ?? 0) + 1);
  }
  return [...seen.entries()].filter(([, c]) => c > 1).map(([n]) => n);
}
