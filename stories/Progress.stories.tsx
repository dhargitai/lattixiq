import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Progress } from '@/components/ui/progress'
import { useState, useEffect } from 'react'

const meta = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100 },
    },
  },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 60,
  },
}

export const Empty: Story = {
  args: {
    value: 0,
  },
}

export const Full: Story = {
  args: {
    value: 100,
  },
}

export const Animated: Story = {
  render: () => {
    const [progress, setProgress] = useState(0)
    
    useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0
          return prev + 2
        })
      }, 100)
      
      return () => clearInterval(timer)
    }, [])
    
    return (
      <div className="w-[300px] space-y-2">
        <Progress value={progress} />
        <p className="text-sm text-muted-foreground text-center">{progress}%</p>
      </div>
    )
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Small (h-1)</p>
        <Progress value={40} className="h-1" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Default (h-2)</p>
        <Progress value={60} />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Large (h-3)</p>
        <Progress value={80} className="h-3" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Extra Large (h-4)</p>
        <Progress value={90} className="h-4" />
      </div>
    </div>
  ),
}

export const RoadmapProgress: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Stop Procrastinating</span>
          <span className="text-muted-foreground">3/5 steps</span>
        </div>
        <Progress value={60} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Improve Decision Making</span>
          <span className="text-muted-foreground">1/7 steps</span>
        </div>
        <Progress value={14} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Build Better Habits</span>
          <span className="text-muted-foreground">5/5 steps</span>
        </div>
        <Progress value={100} className="bg-success/20" />
      </div>
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => {
    const milestones = [
      { label: 'Learn', value: 100 },
      { label: 'Plan', value: 100 },
      { label: 'Apply', value: 60 },
      { label: 'Reflect', value: 0 },
    ]
    
    return (
      <div className="w-[400px] space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          {milestones.map((milestone) => (
            <span key={milestone.label} className="flex-1 text-center">
              {milestone.label}
            </span>
          ))}
        </div>
        <Progress value={65} />
        <div className="flex justify-between">
          {milestones.map((milestone, index) => (
            <div
              key={milestone.label}
              className={`flex-1 text-center pt-2 ${
                milestone.value > 0 ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {milestone.value > 0 ? '✓' : '○'}
            </div>
          ))}
        </div>
      </div>
    )
  },
}