/**
 * End-to-end smoke checks for schema generation, conversion, import, and validation.
 * Run with: npx tsx scripts/smoke.ts  (or via vitest integration)
 */
import { describe, expect, it } from "vitest";
import {
  createEmptyParameter,
  generateParametersSchema,
  generateJsonSchemaString,
  validateFunctionName,
  findDuplicateParameterNames,
} from "@/lib/schema/generator";
import { toOpenAITool, toClaudeTool, formatProviderOutput } from "@/lib/schema/converters";
import { validatePayload } from "@/lib/schema/validator";
import { importSchema } from "@/lib/schema/importer";
import { generateSdkCode } from "@/lib/sdk";
import { PRESETS, clonePresetDefinition } from "@/lib/presets";
import type { FunctionDefinition } from "@/types/schema";

describe("end-to-end smoke", () => {
  it("runs the full builder workflow for weather preset", () => {
    const preset = PRESETS.find((p) => p.id === "weather")!;
    const def = clonePresetDefinition(preset);

    expect(validateFunctionName(def.name)).toBeNull();
    expect(findDuplicateParameterNames(def.parameters)).toHaveLength(0);

    const schema = generateParametersSchema(def);
    expect(schema.additionalProperties).toBe(false);
    expect(schema.required).toEqual(["city", "units"]);
    expect(schema.properties?.units?.enum).toEqual(["celsius", "fahrenheit"]);

    const openai = toOpenAITool(def) as {
      type: string;
      function: { name: string };
    };
    expect(openai.type).toBe("function");
    expect(openai.function.name).toBe("get_current_weather");

    const claude = toClaudeTool(def) as { input_schema: object };
    expect(claude.input_schema).toBeTruthy();

    expect(formatProviderOutput(def, "langchain")).toContain("@tool");
    expect(formatProviderOutput(def, "jsonschema")).toContain('"type": "object"');

    const valid = validatePayload(
      JSON.stringify({ city: "Chennai", units: "celsius" }),
      def
    );
    expect(valid.valid).toBe(true);

    const invalid = validatePayload(
      JSON.stringify({ city: "Chennai", units: "kelvin" }),
      def
    );
    expect(invalid.valid).toBe(false);

    const ts = generateSdkCode(def, "typescript", "openai");
    expect(ts).toContain("import OpenAI");
    expect(ts).toContain("get_current_weather");

    const py = generateSdkCode(def, "python", "anthropic");
    expect(py).toContain("import anthropic");
    expect(py).toContain("input_schema");

    const exported = generateJsonSchemaString(def);
    const roundTrip = importSchema(
      JSON.stringify({
        type: "function",
        function: {
          name: def.name,
          description: def.description,
          strict: true,
          parameters: JSON.parse(exported),
        },
      })
    );
    expect(roundTrip.success).toBe(true);
    expect(roundTrip.definition?.name).toBe("get_current_weather");
    expect(roundTrip.definition?.parameters.some((p) => p.name === "city")).toBe(
      true
    );
  });

  it("handles nested object + array schemas", () => {
    const def: FunctionDefinition = {
      name: "create_order",
      description: "Create an order",
      strict: true,
      parameters: [
        createEmptyParameter({
          name: "customer",
          type: "object",
          required: true,
          properties: [
            createEmptyParameter({
              name: "email",
              type: "string",
              required: true,
            }),
          ],
        }),
        createEmptyParameter({
          name: "tags",
          type: "array",
          required: false,
          items: createEmptyParameter({
            name: "item",
            type: "string",
            required: false,
          }),
        }),
      ],
    };

    const schema = generateParametersSchema(def);
    expect(schema.properties?.customer?.properties?.email?.type).toBe("string");
    expect(schema.properties?.tags?.items).toEqual({ type: "string" });

    const ok = validatePayload(
      JSON.stringify({
        customer: { email: "a@b.com" },
        tags: ["vip"],
      }),
      def
    );
    expect(ok.valid).toBe(true);

    const bad = validatePayload(
      JSON.stringify({ customer: { email: 123 } }),
      def
    );
    expect(bad.valid).toBe(false);
  });

  it("rejects invalid function names and duplicate params", () => {
    expect(validateFunctionName("bad name")).toBeTruthy();
    expect(
      findDuplicateParameterNames([
        createEmptyParameter({ name: "q" }),
        createEmptyParameter({ name: "q" }),
      ])
    ).toEqual(["q"]);
  });
});
