import type { FunctionDefinition, JsonSchemaObject } from "@/types/schema";
import { generateParametersSchema } from "./generator";

export function toOpenAITool(definition: FunctionDefinition): object {
  return {
    type: "function",
    function: {
      name: definition.name || "unnamed_function",
      description: definition.description,
      strict: definition.strict,
      parameters: generateParametersSchema(definition),
    },
  };
}

export function toClaudeTool(definition: FunctionDefinition): object {
  return {
    name: definition.name || "unnamed_function",
    description: definition.description,
    input_schema: generateParametersSchema(definition),
  };
}

export function toLangChainToolCode(definition: FunctionDefinition): string {
  const name = definition.name || "unnamed_function";
  const desc = definition.description || "Tool description.";
  const params = definition.parameters.filter((p) => p.name.trim());

  const args = params
    .map((p) => {
      const pyType = mapToPythonType(p.type, p.nullable);
      const optional = !p.required;
      if (optional) {
        return `${p.name}: ${pyType} | None = None`;
      }
      return `${p.name}: ${pyType}`;
    })
    .join(", ");

  const bodyLines = params.map((p) => `    # ${p.name}: ${p.description || p.type}`);
  if (bodyLines.length === 0) {
    bodyLines.push("    pass");
  } else {
    bodyLines.push(`    raise NotImplementedError("Implement ${name}")`);
  }

  return `from langchain_core.tools import tool


@tool
def ${name}(${args}):
    """${escapeDocstring(desc)}"""
${bodyLines.join("\n")}
`;
}

function mapToPythonType(type: string, nullable?: boolean): string {
  const base: Record<string, string> = {
    string: "str",
    number: "float",
    integer: "int",
    boolean: "bool",
    array: "list",
    object: "dict",
  };
  const t = base[type] ?? "Any";
  return nullable ? `${t} | None` : t;
}

function escapeDocstring(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"""/g, '\\"""');
}

export function formatProviderOutput(
  definition: FunctionDefinition,
  provider: "openai" | "claude" | "langchain" | "jsonschema"
): string {
  switch (provider) {
    case "openai":
      return JSON.stringify(toOpenAITool(definition), null, 2);
    case "claude":
      return JSON.stringify(toClaudeTool(definition), null, 2);
    case "langchain":
      return toLangChainToolCode(definition);
    case "jsonschema":
    default:
      return JSON.stringify(generateParametersSchema(definition), null, 2);
  }
}

export type { JsonSchemaObject };
