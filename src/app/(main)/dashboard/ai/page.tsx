"use client";

import dynamic from "next/dynamic";

const AIChat = dynamic(
  () => import("@/components/ai-chat").then((mod) => ({ default: mod.AIChat })),
  {
    loading: () => <div>Loading AI Chat...</div>,
  },
);

export default function AIAssistantPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <AIChat onEventCreate={() => {}} onEventClick={() => {}} />
    </div>
  );
}
