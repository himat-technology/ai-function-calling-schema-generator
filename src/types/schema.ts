export type ParameterType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "array"
  | "object";

export interface ParameterDefinition {
  id: string;
  name: string;
  type: ParameterType;
  description: string;
  required: boolean;
  enumEnabled?: boolean;
  enumValues?: string[];
  defaultValue?: string;
  nullable?: boolean;
  /** For array type: item schema (single child definition) */
  items?: ParameterDefinition;
  /** For object type: nested properties */
  properties?: ParameterDefinition[];
}

export interface FunctionDefinition {
  name: string;
  description: string;
  strict: boolean;
  parameters: ParameterDefinition[];
}

export type ProviderFormat = "openai" | "claude" | "langchain" | "jsonschema";
export type SdkLanguage = "typescript" | "python";
export type SdkProvider = "openai" | "anthropic" | "langchain";

export interface JsonSchemaObject {
  type?: string | string[];
  description?: string;
  properties?: Record<string, JsonSchemaObject>;
  required?: string[];
  additionalProperties?: boolean;
  enum?: (string | number | boolean)[];
  items?: JsonSchemaObject;
  default?: unknown;
  [key: string]: unknown;
}

export interface ValidationDiagnostic {
  ok: boolean;
  message: string;
  path?: string;
}

export interface PayloadValidationResult {
  valid: boolean;
  errors: string[];
  diagnostics: ValidationDiagnostic[];
  parseError?: string;
}

export interface ImportResult {
  success: boolean;
  definition?: FunctionDefinition;
  format?: "jsonschema" | "openai" | "claude" | "unknown";
  error?: string;
}

export const PARAMETER_TYPES: ParameterType[] = [
  "string",
  "number",
  "integer",
  "boolean",
  "array",
  "object",
];

export const ARRAY_ITEM_TYPES: ParameterType[] = [
  "string",
  "number",
  "integer",
  "boolean",
  "object",
];
