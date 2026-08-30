import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

function Spinner({
  className,
  strokeWidth,
}: Pick<React.ComponentProps<"svg">, "className" | "strokeWidth">) {
  return (
    <HugeiconsIcon
      icon={Loading03Icon}
      strokeWidth={typeof strokeWidth === "number" ? strokeWidth : 2}
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
    />
  );
}

export { Spinner };
