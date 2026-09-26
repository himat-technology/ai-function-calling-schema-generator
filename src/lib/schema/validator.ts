import Ajv, { type ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import type {
  FunctionDefinition,
  JsonSchemaObject,
  PayloadValidationResult,
  ValidationDiagnostic,
} from "@/types/schema";
import { generateParametersSchema } from "./generator";

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  validateSchema: false,
});
addFormats(ajv);

function formatAjvError(err: ErrorObject): string {
  const path = err.instancePath || "/";
  const prop =
    typeof err.params?.missingProperty === "string"
      ? err.params.missingProperty
      : null;

  switch (err.keyword) {
    case "required":
      return `Missing required property: ${prop ?? "unknown"}`;
    case "type":
      return `${path === "/" ? "Value" : path.slice(1)} must be ${err.params.type as string}`;
    case "enum":
      return `Invalid enum value at ${path === "/" ? "root" : path.slice(1)}`;
    case "additionalProperties":
      return `Unexpected additional property: ${String(err.params.additionalProperty)}`;
    default:
      return `${path}: ${err.message ?? "validation failed"}`;
  }
}

function buildDiagnostics(
  payload: unknown,
  schema: JsonSchemaObject,
  ajvErrors: ErrorObject[] | null | undefined
): ValidationDiagnostic[] {
  const diagnostics: ValidationDiagnostic[] = [
    { ok: true, message: "Valid JSON" },
  ];

  const properties = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  const obj =
    payload !== null && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : null;

  if (!obj) {
    diagnostics.push({
      ok: false,
      message: "Payload must be a JSON object",
    });
    return diagnostics;
  }

  for (const key of required) {
    if (!(key in obj)) {
      diagnostics.push({
        ok: false,
        message: `Missing required property: ${key}`,
        path: key,
      });
    }
  }

  for (const [key, value] of Object.entries(obj)) {
    const propSchema = properties[key];
    if (!propSchema) {
      if (schema.additionalProperties === false) {
        diagnostics.push({
          ok: false,
          message: `Unexpected additional property: ${key}`,
          path: key,
        });
      }
      continue;
    }

    const expectedType = normalizeType(propSchema.type);
    const actualOk = matchesType(value, expectedType, propSchema);
    if (actualOk) {
      diagnostics.push({
        ok: true,
        message: `${key} is a ${describeType(expectedType, propSchema)}`,
        path: key,
      });
    } else {
      diagnostics.push({
        ok: false,
        message: `${key} must be ${describeType(expectedType, propSchema)}`,
        path: key,
      });
    }

    if (propSchema.enum && !propSchema.enum.includes(value as never)) {
      diagnostics.push({
        ok: false,
        message: `Invalid enum value for ${key}`,
        path: key,
      });
    }
  }

  // Include remaining AJV errors not already covered
  if (ajvErrors) {
    for (const err of ajvErrors) {
      const msg = formatAjvError(err);
      if (!diagnostics.some((d) => d.message === msg)) {
        diagnostics.push({ ok: false, message: msg, path: err.instancePath });
      }
    }
  }

  return diagnostics;
}

function normalizeType(
  type: string | string[] | undefined
): string | string[] | undefined {
  return type;
}

function describeType(
  type: string | string[] | undefined,
  schema: JsonSchemaObject
): string {
  if (schema.enum) {
    return `one of [${schema.enum.map(String).join(", ")}]`;
  }
  if (Array.isArray(type)) {
    return type.join(" | ");
  }
  return type ?? "unknown";
}

function matchesType(
  value: unknown,
  type: string | string[] | undefined,
  schema: JsonSchemaObject
): boolean {
  const types = Array.isArray(type) ? type : type ? [type] : [];
  if (types.length === 0) return true;

  return types.some((t) => {
    switch (t) {
      case "string":
        return typeof value === "string";
      case "number":
        return typeof value === "number" && Number.isFinite(value);
      case "integer":
        return typeof value === "number" && Number.isInteger(value);
      case "boolean":
        return typeof value === "boolean";
      case "array":
        return Array.isArray(value);
      case "object":
        return value !== null && typeof value === "object" && !Array.isArray(value);
      case "null":
        return value === null;
      default:
        return true;
    }
  }) || (schema.enum ? schema.enum.includes(value as never) : false);
}

export function validatePayload(
  payloadText: string,
  definition: FunctionDefinition
): PayloadValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payloadText);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    return {
      valid: false,
      errors: [`Invalid JSON: ${message}`],
      diagnostics: [{ ok: false, message: `Invalid JSON: ${message}` }],
      parseError: message,
    };
  }

  const schema = generateParametersSchema(definition);
  const validate = ajv.compile(schema);
  const valid = validate(parsed);
  const errors = (validate.errors ?? []).map(formatAjvError);
  const diagnostics = buildDiagnostics(parsed, schema, validate.errors);

  return {
    valid: Boolean(valid),
    errors: valid ? [] : errors.length > 0 ? errors : ["Validation failed"],
    diagnostics,
  };
}

export function validateAgainstSchema(
  payload: unknown,
  schema: JsonSchemaObject
): { valid: boolean; errors: string[] } {
  const validate = ajv.compile(schema);
  const valid = validate(payload);
  return {
    valid: Boolean(valid),
    errors: (validate.errors ?? []).map(formatAjvError),
  };
}
