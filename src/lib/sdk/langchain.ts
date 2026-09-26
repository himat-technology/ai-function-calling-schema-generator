import type { FunctionDefinition, ParameterDefinition } from "@/types/schema";
import { toLangChainToolCode } from "@/lib/schema/converters";
import { generateParametersSchema } from "@/lib/schema/generator";

function mapTsType(param: ParameterDefinition): string {
  const base: Record<string, string> = {
    string: "string",
    number: "number",
    integer: "number",
    boolean: "boolean",
    array: "unknown[]",
    object: "Record<string, unknown>",
  };
  let t = base[param.type] ?? "unknown";
  if (param.nullable) t = `${t} | null`;
  if (!param.required) t = `${t} | undefined`;
  return t;
}

export function generateLangChainTypeScript(
  definition: FunctionDefinition
): string {
  const name = definition.name || "unnamed_function";
  const schema = generateParametersSchema(definition);
  const params = definition.parameters.filter((p) => p.name.trim());
  const interfaceFields = params
    .map((p) => {
      const opt = p.required ? "" : "?";
      return `  ${p.name}${opt}: ${mapTsType({ ...p, required: true })};`;
    })
    .join("\n");

  return `import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * ${definition.description || "Tool description."}
 */
export const ${toCamelCase(name)}Tool = tool(
  async (input: ${toPascalCase(name)}Input) => {
    // TODO: implement tool logic
    return JSON.stringify(input);
  },
  {
    name: ${JSON.stringify(name)},
    description: ${JSON.stringify(definition.description || "")},
    schema: ${JSON.stringify(schema, null, 2)},
  }
);

interface ${toPascalCase(name)}Input {
${interfaceFields || "  // no parameters"}
}
`;
}

export function generateLangChainPython(definition: FunctionDefinition): string {
  return toLangChainToolCode(definition);
}

function toCamelCase(snake: string): string {
  return snake.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function toPascalCase(snake: string): string {
  const camel = toCamelCase(snake);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}
