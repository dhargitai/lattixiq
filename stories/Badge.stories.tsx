import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Badge } from '@/components/ui/badge'
import { Check, Lock, AlertCircle } from 'lucide-react'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'success'],
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Badge',
  },
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Success</Badge>
    </div>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success">
        <Check className="mr-1 h-3 w-3" />
        Completed
      </Badge>
      <Badge variant="default">
        <AlertCircle className="mr-1 h-3 w-3" />
        In Progress
      </Badge>
      <Badge variant="secondary">
        <Lock className="mr-1 h-3 w-3" />
        Locked
      </Badge>
    </div>
  ),
}

export const StepIndicators: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Badge variant="success" className="h-8 w-8 rounded-full p-0 flex items-center justify-center">
        <Check className="h-4 w-4" />
      </Badge>
      <Badge variant="default" className="h-8 w-8 rounded-full p-0 flex items-center justify-center">
        2
      </Badge>
      <Badge variant="secondary" className="h-8 w-8 rounded-full p-0 flex items-center justify-center">
        <Lock className="h-3 w-3" />
      </Badge>
    </div>
  ),
}

export const StatusBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium w-20">Success:</span>
        <Badge variant="success">Active</Badge>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium w-20">Warning:</span>
        <Badge variant="default">Pending</Badge>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium w-20">Error:</span>
        <Badge variant="destructive">Failed</Badge>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium w-20">Info:</span>
        <Badge variant="secondary">Archived</Badge>
      </div>
    </div>
  ),
}

export const CountBadges: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span>Notifications</span>
        <Badge variant="destructive">5</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span>Messages</span>
        <Badge variant="default">12</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span>Updates</span>
        <Badge variant="secondary">3</Badge>
      </div>
    </div>
  ),
}