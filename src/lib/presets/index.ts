import type { FunctionDefinition } from "@/types/schema";
import { createEmptyParameter } from "@/lib/schema/generator";

export interface Preset {
  id: string;
  label: string;
  description: string;
  definition: FunctionDefinition;
}

/** Stable IDs so SSR and client never diverge */
function pid(presetId: string, name: string): string {
  return `${presetId}__${name}`;
}

export const PRESETS: Preset[] = [
  {
    id: "web-search",
    label: "Web Search Tool",
    description: "Search the web for real-time information.",
    definition: {
      name: "web_search",
      description: "Search the web for real-time information.",
      strict: true,
      parameters: [
        createEmptyParameter({
          id: pid("web-search", "query"),
          name: "query",
          type: "string",
          description: "The search query to execute.",
          required: true,
        }),
        createEmptyParameter({
          id: pid("web-search", "max_results"),
          name: "max_results",
          type: "integer",
          description: "Maximum number of results to return.",
          required: false,
          defaultValue: "5",
        }),
        createEmptyParameter({
          id: pid("web-search", "safe_search"),
          name: "safe_search",
          type: "boolean",
          description: "Whether to enable safe search filtering.",
          required: false,
          defaultValue: "true",
        }),
      ],
    },
  },
  {
    id: "database-query",
    label: "Database Query Tool",
    description: "Execute structured read-only SQL queries.",
    definition: {
      name: "execute_sql",
      description: "Execute structured read-only SQL queries.",
      strict: true,
      parameters: [
        createEmptyParameter({
          id: pid("database-query", "query"),
          name: "query",
          type: "string",
          description: "The SQL query to execute (read-only).",
          required: true,
        }),
        createEmptyParameter({
          id: pid("database-query", "limit"),
          name: "limit",
          type: "integer",
          description: "Maximum rows to return.",
          required: false,
          defaultValue: "100",
        }),
        createEmptyParameter({
          id: pid("database-query", "database"),
          name: "database",
          type: "string",
          description: "Target database identifier.",
          required: true,
        }),
      ],
    },
  },
  {
    id: "weather",
    label: "Weather API Tool",
    description: "Fetch current weather and temperature forecasts.",
    definition: {
      name: "get_current_weather",
      description: "Fetch current weather and temperature forecasts.",
      strict: true,
      parameters: [
        createEmptyParameter({
          id: pid("weather", "city"),
          name: "city",
          type: "string",
          description: "The city where the weather should be retrieved.",
          required: true,
        }),
        createEmptyParameter({
          id: pid("weather", "units"),
          name: "units",
          type: "string",
          description: "Temperature units.",
          required: true,
          enumEnabled: true,
          enumValues: ["celsius", "fahrenheit"],
        }),
      ],
    },
  },
  {
    id: "send-email",
    label: "Send Email Notification",
    description: "Send transactional email through an email gateway.",
    definition: {
      name: "send_email",
      description: "Send transactional email through an email gateway.",
      strict: true,
      parameters: [
        createEmptyParameter({
          id: pid("send-email", "to"),
          name: "to",
          type: "string",
          description: "Recipient email address.",
          required: true,
        }),
        createEmptyParameter({
          id: pid("send-email", "subject"),
          name: "subject",
          type: "string",
          description: "Email subject line.",
          required: true,
        }),
        createEmptyParameter({
          id: pid("send-email", "body"),
          name: "body",
          type: "string",
          description: "Email body content.",
          required: true,
        }),
      ],
    },
  },
  {
    id: "code-execution",
    label: "Code Execution",
    description: "Execute sandboxed code.",
    definition: {
      name: "execute_code",
      description: "Execute sandboxed code.",
      strict: true,
      parameters: [
        createEmptyParameter({
          id: pid("code-execution", "language"),
          name: "language",
          type: "string",
          description: "Programming language to execute.",
          required: true,
          enumEnabled: true,
          enumValues: ["python", "javascript", "typescript"],
        }),
        createEmptyParameter({
          id: pid("code-execution", "code"),
          name: "code",
          type: "string",
          description: "Source code to execute in the sandbox.",
          required: true,
        }),
        createEmptyParameter({
          id: pid("code-execution", "timeout"),
          name: "timeout",
          type: "integer",
          description: "Execution timeout in milliseconds.",
          required: false,
          defaultValue: "5000",
        }),
      ],
    },
  },
];

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function clonePresetDefinition(preset: Preset): FunctionDefinition {
  return structuredClone({
    ...preset.definition,
    parameters: preset.definition.parameters.map((p) => ({
      ...p,
      id: newId(),
      items: p.items ? { ...p.items, id: newId() } : undefined,
      properties: p.properties?.map((c) => ({
        ...c,
        id: newId(),
      })),
    })),
  });
}
