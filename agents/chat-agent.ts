import { ToolLoopAgent, isStepCount } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { calendarTools, calendarToolsContext } from "@/tools/calendar-tools";
import { calendarAgentPrompt } from "@/prompts/system-prompts";

export const chatAgent = new ToolLoopAgent({
  model: openai("gpt-5.6-luna"),
  instructions: calendarAgentPrompt,
  tools: calendarTools,
  stopWhen: isStepCount(10),
  // Placeholder - always overridden per-request by prepareCall below, which
  // injects the real authenticated userId from callOptionsSchema.
  toolsContext: calendarToolsContext(""),
  callOptionsSchema: z.object({ userId: z.string() }),
  prepareCall: ({ options, ...settings }) => ({
    ...settings,
    toolsContext: calendarToolsContext(options.userId),
  }),
});
