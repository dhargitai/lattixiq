import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Input } from '@/components/ui/input'
import { Search, Mail, Lock } from 'lucide-react'

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter text...',
  },
}

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'your@email.com',
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
}

export const Disabled: Story = {
  args: {
    type: 'text',
    placeholder: 'Disabled input',
    disabled: true,
    value: 'Cannot edit this',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-2">
      <label htmlFor="email" className="text-sm font-medium">
        Email Address
      </label>
      <Input id="email" type="email" placeholder="your@email.com" />
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10" placeholder="Search..." />
      </div>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10" type="email" placeholder="Email" />
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10" type="password" placeholder="Password" />
      </div>
    </div>
  ),
}

export const FormExample: Story = {
  render: () => (
    <form className="w-full max-w-sm space-y-4">
      <div className="space-y-2">
        <label htmlFor="goal" className="text-sm font-medium">
          What is your single biggest challenge right now?
        </label>
        <Input
          id="goal"
          placeholder="e.g., I want to stop procrastinating on my big projects"
          className="w-full"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2 hover:bg-primary/90 transition-colors"
      >
        Create My Roadmap
      </button>
    </form>
  ),
}