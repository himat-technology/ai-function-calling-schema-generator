import type {
  FunctionDefinition,
  ImportResult,
  JsonSchemaObject,
  ParameterDefinition,
  ParameterType,
} from "@/types/schema";
import { createEmptyParameter } from "./generator";

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function schemaTypeToParameterType(
  type: string | string[] | undefined
): { type: ParameterType; nullable: boolean } {
  const types = Array.isArray(type) ? type : type ? [type] : ["string"];
  const nullable = types.includes("null");
  const primary =
    (types.find((t) => t !== "null") as ParameterType | undefined) ?? "string";
  const allowed: ParameterType[] = [
    "string",
    "number",
    "integer",
    "boolean",
    "array",
    "object",
  ];
  return {
    type: allowed.includes(primary) ? primary : "string",
    nullable,
  };
}

function schemaPropertyToParameter(
  name: string,
  schema: JsonSchemaObject,
  required: boolean
): ParameterDefinition {
  const { type, nullable } = schemaTypeToParameterType(schema.type);
  const param = createEmptyParameter({
    id: newId(),
    name,
    type,
    description: typeof schema.description === "string" ? schema.description : "",
    required,
    nullable,
  });

  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    param.enumEnabled = true;
    param.enumValues = schema.enum.map(String);
  }

  if (schema.default !== undefined) {
    param.defaultValue =
      typeof schema.default === "string"
        ? schema.default
        : JSON.stringify(schema.default);
  }

  if (type === "array" && schema.items && typeof schema.items === "object") {
    const itemSchema = schema.items as JsonSchemaObject;
    const itemType = schemaTypeToParameterType(itemSchema.type);
    param.items = createEmptyParameter({
      id: newId(),
      name: "item",
      type: itemType.type,
      description:
        typeof itemSchema.description === "string" ? itemSchema.description : "",
      required: false,
      nullable: itemType.nullable,
      properties:
        itemType.type === "object"
          ? objectPropertiesFromSchema(itemSchema)
          : undefined,
    });
  }

  if (type === "object") {
    param.properties = objectPropertiesFromSchema(schema);
  }

  return param;
}

function objectPropertiesFromSchema(
  schema: JsonSchemaObject
): ParameterDefinition[] {
  const props = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  return Object.entries(props).map(([name, propSchema]) =>
    schemaPropertyToParameter(
      name,
      propSchema as JsonSchemaObject,
      required.has(name)
    )
  );
}

function isOpenAITool(obj: Record<string, unknown>): boolean {
  if (obj.type === "function" && obj.function && typeof obj.function === "object") {
    return true;
  }
  if (obj.name && (obj.parameters || obj.function)) {
    return Boolean(obj.parameters) || Boolean(
      typeof obj.function === "object" &&
        obj.function !== null &&
        "parameters" in (obj.function as object)
    );
  }
  return false;
}

function isClaudeTool(obj: Record<string, unknown>): boolean {
  return (
    typeof obj.name === "string" &&
    (obj.input_schema !== undefined || obj.inputSchema !== undefined)
  );
}

function isJsonSchema(obj: Record<string, unknown>): boolean {
  return (
    obj.type === "object" ||
    obj.properties !== undefined ||
    obj.$schema !== undefined
  );
}

function fromParametersSchema(
  name: string,
  description: string,
  parameters: JsonSchemaObject,
  strict?: boolean
): FunctionDefinition {
  const params = objectPropertiesFromSchema(parameters);
  return {
    name,
    description,
    strict:
      strict ??
      parameters.additionalProperties === false,
    parameters: params,
  };
}

export function importSchema(raw: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return {
      success: false,
      error: `Invalid JSON: ${e instanceof Error ? e.message : "parse error"}`,
    };
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { success: false, error: "Schema must be a JSON object." };
  }

  const obj = parsed as Record<string, unknown>;

  try {
    // OpenAI tools array
    if (Array.isArray(obj)) {
      return { success: false, error: "Paste a single tool object, not an array." };
    }

    // OpenAI: { type: "function", function: { ... } }
    if (obj.type === "function" && obj.function && typeof obj.function === "object") {
      const fn = obj.function as Record<string, unknown>;
      const params = (fn.parameters ?? {}) as JsonSchemaObject;
      return {
        success: true,
        format: "openai",
        definition: fromParametersSchema(
          String(fn.name ?? "imported_function"),
          String(fn.description ?? ""),
          params,
          typeof fn.strict === "boolean" ? fn.strict : undefined
        ),
      };
    }

    // OpenAI shorthand: { name, description, parameters }
    if (typeof obj.name === "string" && obj.parameters && !obj.input_schema) {
      return {
        success: true,
        format: "openai",
        definition: fromParametersSchema(
          obj.name,
          String(obj.description ?? ""),
          obj.parameters as JsonSchemaObject,
          typeof obj.strict === "boolean" ? obj.strict : undefined
        ),
      };
    }

    // Claude: { name, description, input_schema }
    if (isClaudeTool(obj)) {
      const schema = (obj.input_schema ?? obj.inputSchema) as JsonSchemaObject;
      return {
        success: true,
        format: "claude",
        definition: fromParametersSchema(
          String(obj.name),
          String(obj.description ?? ""),
          schema
        ),
      };
    }

    // Raw JSON Schema
    if (isJsonSchema(obj)) {
      return {
        success: true,
        format: "jsonschema",
        definition: fromParametersSchema(
          "imported_function",
          "Imported from JSON Schema",
          obj as JsonSchemaObject
        ),
      };
    }

    if (isOpenAITool(obj)) {
      return {
        success: false,
        error: "Unrecognized OpenAI-like tool format.",
      };
    }

    return {
      success: false,
      error: "Unsupported schema format. Paste OpenAI, Claude, or JSON Schema.",
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to import schema",
    };
  }
}
