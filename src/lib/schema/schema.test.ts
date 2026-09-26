import { describe, expect, it } from "vitest";
import {
  createEmptyParameter,
  generateParametersSchema,
  validateFunctionName,
} from "@/lib/schema/generator";
import { toClaudeTool, toOpenAITool } from "@/lib/schema/converters";
import { validatePayload } from "@/lib/schema/validator";
import { PRESETS, clonePresetDefinition } from "@/lib/presets";
import type { FunctionDefinition } from "@/types/schema";

function baseDef(
  overrides: Partial<FunctionDefinition> = {}
): FunctionDefinition {
  return {
    name: "demo_tool",
    description: "Demo",
    strict: true,
    parameters: [],
    ...overrides,
  };
}

describe("schema generation", () => {
  it("generates required parameters", () => {
    const def = baseDef({
      parameters: [
        createEmptyParameter({
          name: "query",
          type: "string",
          description: "Search query",
          required: true,
        }),
        createEmptyParameter({
          name: "limit",
          type: "integer",
          required: false,
        }),
      ],
    });
    const schema = generateParametersSchema(def);
    expect(schema.type).toBe("object");
    expect(schema.required).toEqual(["query"]);
    expect(schema.properties?.query?.type).toBe("string");
    expect(schema.properties?.limit?.type).toBe("integer");
  });

  it("generates enum values", () => {
    const def = baseDef({
      parameters: [
        createEmptyParameter({
          name: "units",
          type: "string",
          required: true,
          enumEnabled: true,
          enumValues: ["celsius", "fahrenheit"],
        }),
      ],
    });
    const schema = generateParametersSchema(def);
    expect(schema.properties?.units?.enum).toEqual([
      "celsius",
      "fahrenheit",
    ]);
  });

  it("generates array schemas", () => {
    const def = baseDef({
      parameters: [
        createEmptyParameter({
          name: "tags",
          type: "array",
          required: true,
          items: createEmptyParameter({
            name: "item",
            type: "string",
            required: false,
          }),
        }),
      ],
    });
    const schema = generateParametersSchema(def);
    expect(schema.properties?.tags?.type).toBe("array");
    expect(schema.properties?.tags?.items).toEqual({ type: "string" });
  });

  it("generates nested object schemas", () => {
    const def = baseDef({
      parameters: [
        createEmptyParameter({
          name: "customer",
          type: "object",
          required: true,
          properties: [
            createEmptyParameter({
              name: "name",
              type: "string",
              required: true,
            }),
            createEmptyParameter({
              name: "email",
              type: "string",
              required: false,
            }),
          ],
        }),
      ],
    });
    const schema = generateParametersSchema(def);
    const customer = schema.properties?.customer;
    expect(customer?.type).toBe("object");
    expect(customer?.required).toEqual(["name"]);
    expect(customer?.properties?.email?.type).toBe("string");
    expect(customer?.additionalProperties).toBe(false);
  });

  it("applies strict mode additionalProperties", () => {
    const strict = generateParametersSchema(baseDef({ strict: true }));
    const loose = generateParametersSchema(baseDef({ strict: false }));
    expect(strict.additionalProperties).toBe(false);
    expect(loose.additionalProperties).toBeUndefined();
  });
});

describe("provider conversion", () => {
  it("converts to OpenAI format", () => {
    const def = baseDef({
      parameters: [
        createEmptyParameter({ name: "q", type: "string", required: true }),
      ],
    });
    const tool = toOpenAITool(def) as {
      type: string;
      function: { name: string; strict: boolean; parameters: { type: string } };
    };
    expect(tool.type).toBe("function");
    expect(tool.function.name).toBe("demo_tool");
    expect(tool.function.strict).toBe(true);
    expect(tool.function.parameters.type).toBe("object");
  });

  it("converts to Claude format", () => {
    const def = baseDef({
      parameters: [
        createEmptyParameter({ name: "q", type: "string", required: true }),
      ],
    });
    const tool = toClaudeTool(def) as {
      name: string;
      input_schema: { type: string };
    };
    expect(tool.name).toBe("demo_tool");
    expect(tool.input_schema.type).toBe("object");
  });
});

describe("payload validation", () => {
  const def = baseDef({
    name: "web_search",
    parameters: [
      createEmptyParameter({
        name: "query",
        type: "string",
        required: true,
      }),
      createEmptyParameter({
        name: "max_results",
        type: "integer",
        required: false,
      }),
      createEmptyParameter({
        name: "safe_search",
        type: "boolean",
        required: false,
      }),
      createEmptyParameter({
        name: "units",
        type: "string",
        required: false,
        enumEnabled: true,
        enumValues: ["celsius", "fahrenheit"],
      }),
    ],
  });

  it("accepts a valid payload", () => {
    const result = validatePayload(
      JSON.stringify({
        query: "AI agents",
        max_results: 5,
        safe_search: true,
        units: "celsius",
      }),
      def
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("detects missing required and wrong types", () => {
    const result = validatePayload(
      JSON.stringify({
        max_results: "five",
        safe_search: "yes",
      }),
      def
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("query"))).toBe(true);
  });

  it("detects invalid enum", () => {
    const result = validatePayload(
      JSON.stringify({ query: "x", units: "kelvin" }),
      def
    );
    expect(result.valid).toBe(false);
  });

  it("detects invalid JSON", () => {
    const result = validatePayload("{bad", def);
    expect(result.valid).toBe(false);
    expect(result.parseError).toBeTruthy();
  });
});

describe("function name validation", () => {
  it("rejects empty and spaces", () => {
    expect(validateFunctionName("")).toBeTruthy();
    expect(validateFunctionName("my tool")).toBeTruthy();
    expect(validateFunctionName("search_database")).toBeNull();
  });
});

describe("presets", () => {
  it("loads web search preset", () => {
    const preset = PRESETS.find((p) => p.id === "web-search");
    expect(preset).toBeTruthy();
    const def = clonePresetDefinition(preset!);
    expect(def.name).toBe("web_search");
    expect(def.parameters.map((p) => p.name)).toEqual([
      "query",
      "max_results",
      "safe_search",
    ]);
    const schema = generateParametersSchema(def);
    expect(schema.required).toContain("query");
  });

  it("loads all production presets", () => {
    expect(PRESETS.length).toBe(5);
    for (const preset of PRESETS) {
      const def = clonePresetDefinition(preset);
      expect(def.name).toBeTruthy();
      expect(def.parameters.length).toBeGreaterThan(0);
      const schema = generateParametersSchema(def);
      expect(schema.type).toBe("object");
    }
  });
});
