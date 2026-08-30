import { ToolLoopAgent, isStepCount } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { calendarTools, calendarToolsContext } from "@/tools/calendar-tools";
import { calendarAgentPrompt } from "@/prompts/system-prompts";
import { createLogger } from "@/lib/logger";

const log = createLogger("chat-agent");

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
  onStepStart: ({ stepNumber }) => {
    log.debug("step start", { stepNumber });
  },
  onToolExecutionStart: ({ toolCall }) => {
    log.info("tool call start", { tool: toolCall.toolName, input: toolCall.input });
  },
  onToolExecutionEnd: ({ toolCall, toolExecutionMs, toolOutput }) => {
    if (toolOutput.type === "tool-error") {
      log.error("tool call failed", { tool: toolCall.toolName, toolExecutionMs, error: toolOutput.error });
    } else {
      log.info("tool call done", { tool: toolCall.toolName, toolExecutionMs });
    }
  },
  onStepEnd: ({ stepNumber, usage, finishReason }) => {
    log.debug("step end", { stepNumber, finishReason, totalTokens: usage.totalTokens });
  },
  onEnd: ({ steps, usage }) => {
    log.info("agent run complete", { steps: steps.length, totalTokens: usage.totalTokens });
  },
});
