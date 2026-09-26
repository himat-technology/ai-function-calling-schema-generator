import { describe, expect, it } from "vitest";
import { importSchema } from "@/lib/schema/importer";

describe("schema importer", () => {
  it("imports raw JSON Schema", () => {
    const result = importSchema(
      JSON.stringify({
        type: "object",
        properties: {
          query: { type: "string", description: "q" },
        },
        required: ["query"],
        additionalProperties: false,
      })
    );
    expect(result.success).toBe(true);
    expect(result.format).toBe("jsonschema");
    expect(result.definition?.parameters[0]?.name).toBe("query");
    expect(result.definition?.strict).toBe(true);
  });

  it("imports OpenAI tool format", () => {
    const result = importSchema(
      JSON.stringify({
        type: "function",
        function: {
          name: "web_search",
          description: "Search",
          strict: true,
          parameters: {
            type: "object",
            properties: {
              query: { type: "string" },
            },
            required: ["query"],
          },
        },
      })
    );
    expect(result.success).toBe(true);
    expect(result.format).toBe("openai");
    expect(result.definition?.name).toBe("web_search");
  });

  it("imports Claude tool format", () => {
    const result = importSchema(
      JSON.stringify({
        name: "get_weather",
        description: "Weather",
        input_schema: {
          type: "object",
          properties: {
            city: { type: "string" },
          },
          required: ["city"],
        },
      })
    );
    expect(result.success).toBe(true);
    expect(result.format).toBe("claude");
    expect(result.definition?.name).toBe("get_weather");
  });

  it("rejects invalid JSON", () => {
    const result = importSchema("{nope");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Invalid JSON/);
  });
});
