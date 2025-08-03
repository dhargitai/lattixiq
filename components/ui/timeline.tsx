import * as React from "react";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStep {
  id: string;
  title: string;
  description?: string;
  status: "completed" | "current" | "locked";
}

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: TimelineStep[];
  onStepClick?: (step: TimelineStep) => void;
}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ className, steps, onStepClick, ...props }, ref) => (
    <div ref={ref} className={cn("relative", className)} {...props}>
      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          {/* Connection line */}
          {index < steps.length - 1 && (
            <div className="absolute left-5 top-10 h-full w-0.5 bg-border" />
          )}

          <div
            className={cn(
              "flex items-start gap-4 p-4 rounded-lg transition-all",
              onStepClick && step.status !== "locked" && "cursor-pointer hover:bg-accent",
              step.status === "current" && "bg-accent/50"
            )}
            onClick={() => onStepClick && step.status !== "locked" && onStepClick(step)}
          >
            {/* Step indicator */}
            <div
              className={cn("timeline-step", {
                "timeline-step-completed": step.status === "completed",
                "timeline-step-current": step.status === "current",
                "timeline-step-locked": step.status === "locked",
              })}
            >
              {step.status === "completed" && <Check className="w-5 h-5" />}
              {step.status === "current" && <span className="text-sm font-bold">{index + 1}</span>}
              {step.status === "locked" && <Lock className="w-4 h-4" />}
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <h3
                className={cn("font-medium", step.status === "locked" && "text-muted-foreground")}
              >
                {step.title}
              </h3>
              {step.description && (
                <p
                  className={cn(
                    "text-sm mt-1",
                    step.status === "locked" ? "text-muted-foreground/70" : "text-muted-foreground"
                  )}
                >
                  {step.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
);
Timeline.displayName = "Timeline";

export { Timeline, type TimelineStep };
