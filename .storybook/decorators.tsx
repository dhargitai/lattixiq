import React from "react";

export const withTheme = (Story: React.ComponentType) => (
  <div className="min-h-screen bg-background text-foreground">
    <Story />
  </div>
);
