import type { FunctionDefinition } from "@/types/schema";
import { toOpenAITool } from "@/lib/schema/converters";

export function generateOpenAITypeScript(definition: FunctionDefinition): string {
  const tools = [toOpenAITool(definition)];
  return `import OpenAI from "openai";

const client = new OpenAI();

const tools = ${JSON.stringify(tools, null, 2)} as const;

async function main() {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "user", content: "Use the available tools when helpful." },
    ],
    tools: [...tools],
  });

  console.log(response.choices[0]?.message);
}

main().catch(console.error);
`;
}

export function generateOpenAIPython(definition: FunctionDefinition): string {
  const tool = toOpenAITool(definition);
  return `from openai import OpenAI

client = OpenAI()

tools = ${JSON.stringify([tool], null, 2)}

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Use the available tools when helpful."},
    ],
    tools=tools,
)

print(response.choices[0].message)
`;
}
