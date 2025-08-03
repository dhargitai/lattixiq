import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ScreenCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  delay?: number;
  gradient?: boolean;
}

const ScreenCard = React.forwardRef<HTMLDivElement, ScreenCardProps>(
  (
    {
      className,
      title,
      description,
      icon,
      delay = 0,
      gradient: _gradient = true,
      children,
      ...props
    },
    ref
  ) => (
    <Card
      ref={ref}
      className={cn(
        "screen-card animate-fade-in-up cursor-pointer",
        delay && `delay-${delay}`,
        className
      )}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
      {...props}
    >
      <CardHeader>
        {icon && <div className="mb-3 text-primary">{icon}</div>}
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  )
);
ScreenCard.displayName = "ScreenCard";

export { ScreenCard };
