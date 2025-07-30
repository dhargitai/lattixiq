import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ScreenCard } from '@/components/ui/screen-card'
import { BookOpen, Target, Brain, Lightbulb } from 'lucide-react'

const meta = {
  title: 'Custom/ScreenCard',
  component: ScreenCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
    delay: {
      control: 'number',
    },
    gradient: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof ScreenCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Learn',
    description: 'Master powerful mental models',
    icon: <BookOpen className="w-8 h-8" />,
  },
}

export const GridLayout: Story = {
  args: {
    title: 'Sample Card',
    description: 'Sample description',
  },
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <ScreenCard
        title="Learn"
        description="Master powerful mental models"
        icon={<BookOpen className="w-8 h-8" />}
        delay={100}
      />
      <ScreenCard
        title="Plan"
        description="Create actionable strategies"
        icon={<Target className="w-8 h-8" />}
        delay={200}
      />
      <ScreenCard
        title="Apply"
        description="Put knowledge into practice"
        icon={<Brain className="w-8 h-8" />}
        delay={300}
      />
      <ScreenCard
        title="Reflect"
        description="Track your progress and insights"
        icon={<Lightbulb className="w-8 h-8" />}
        delay={400}
      />
    </div>
  ),
}

export const WithContent: Story = {
  args: {
    title: "Your Growth Journey",
    description: "Start your transformation today",
    icon: <Brain className="w-8 h-8" />,
  },
  render: (args) => (
    <ScreenCard {...args}>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Join thousands who have already transformed their thinking and achieved their goals.
        </p>
        <ul className="text-sm space-y-1">
          <li>✓ Evidence-based mental models</li>
          <li>✓ Personalized learning paths</li>
          <li>✓ Track your progress</li>
        </ul>
      </div>
    </ScreenCard>
  ),
}

export const NoIcon: Story = {
  args: {
    title: 'Simple Card',
    description: 'A card without an icon',
  },
}

export const LongContent: Story = {
  args: {
    title: "Welcome to LattixIQ",
    description: "Your personal growth companion",
    icon: <Brain className="w-8 h-8" />,
  },
  render: (args) => (
    <ScreenCard {...args} className="max-w-md">
      <div className="space-y-3">
        <p className="text-sm">
          LattixIQ helps you overcome mental barriers and achieve your goals through proven psychological frameworks.
        </p>
        <p className="text-sm text-muted-foreground">
          Our unique approach combines cognitive science with practical application, ensuring lasting change.
        </p>
      </div>
    </ScreenCard>
  ),
}