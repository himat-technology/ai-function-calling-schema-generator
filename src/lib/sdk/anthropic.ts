import type { FunctionDefinition } from "@/types/schema";
import { toClaudeTool } from "@/lib/schema/converters";

export function generateAnthropicTypeScript(
  definition: FunctionDefinition
): string {
  const tool = toClaudeTool(definition);
  return `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const tools = [${JSON.stringify(tool, null, 2)}] as const;

async function main() {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    tools: [...tools],
    messages: [
      { role: "user", content: "Use the available tools when helpful." },
    ],
  });

  console.log(response.content);
}

main().catch(console.error);
`;
}

export function generateAnthropicPython(definition: FunctionDefinition): string {
  const tool = toClaudeTool(definition);
  return `import anthropic

client = anthropic.Anthropic()

tools = [${JSON.stringify(tool, null, 2)}]

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    tools=tools,
    messages=[
        {"role": "user", "content": "Use the available tools when helpful."},
    ],
)

print(message.content)
`;
}
