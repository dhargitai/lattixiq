import React from 'react'

export const withTheme = (Story: any) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Story />
    </div>
  )
}