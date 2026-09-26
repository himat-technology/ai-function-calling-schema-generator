import type { FunctionDefinition, SdkLanguage, SdkProvider } from "@/types/schema";
import {
  generateOpenAIPython,
  generateOpenAITypeScript,
} from "./openai";
import {
  generateAnthropicPython,
  generateAnthropicTypeScript,
} from "./anthropic";
import {
  generateLangChainPython,
  generateLangChainTypeScript,
} from "./langchain";

export function generateSdkCode(
  definition: FunctionDefinition,
  language: SdkLanguage,
  provider: SdkProvider
): string {
  if (language === "typescript") {
    switch (provider) {
      case "openai":
        return generateOpenAITypeScript(definition);
      case "anthropic":
        return generateAnthropicTypeScript(definition);
      case "langchain":
        return generateLangChainTypeScript(definition);
    }
  }

  switch (provider) {
    case "openai":
      return generateOpenAIPython(definition);
    case "anthropic":
      return generateAnthropicPython(definition);
    case "langchain":
      return generateLangChainPython(definition);
  }
}
