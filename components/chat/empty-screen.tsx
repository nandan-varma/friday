

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">
          Welcome to Calendar AI Chatbot!
        </h1>
        <p className="leading-normal text-muted-foreground">
          This is an Chat Bot that uses a large language model (LLM)
          to schedule and add events to your calendar.
        </p>
      </div>
    </div>
  )
}
