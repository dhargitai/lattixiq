import React from "react";

export const withTheme = (Story: any) => (
  <div className="min-h-screen bg-background text-foreground">
    <Story />
  </div>
);
