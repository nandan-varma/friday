import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function askQuestion(prompt: string) {
  const result = await generateText({
    model: openai("gpt-4o-mini"),
    prompt,
  });
  return result.text;
}
