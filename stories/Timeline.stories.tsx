import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Timeline, type TimelineStep } from '@/components/ui/timeline'

const meta = {
  title: 'Custom/Timeline',
  component: Timeline,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Timeline>

export default meta
type Story = StoryObj<typeof meta>

const sampleSteps: TimelineStep[] = [
  {
    id: '1',
    title: 'Activation Energy',
    description: 'Learn how to make starting easier by reducing friction',
    status: 'completed',
  },
  {
    id: '2',
    title: 'Inversion',
    description: 'Think backwards to avoid failure and find success',
    status: 'current',
  },
  {
    id: '3',
    title: 'Deprival-Superreaction',
    description: 'Understand how scarcity affects decision making',
    status: 'locked',
  },
  {
    id: '4',
    title: 'Commitment and Consistency',
    description: 'Use small commitments to drive big changes',
    status: 'locked',
  },
  {
    id: '5',
    title: 'Social Proof',
    description: 'Leverage the power of collective behavior',
    status: 'locked',
  },
]

export const Default: Story = {
  args: {
    steps: sampleSteps,
  },
}

export const Interactive: Story = {
  args: {
    steps: sampleSteps,
    onStepClick: (step) => {
      console.log('Clicked step:', step)
    },
  },
}

export const AllCompleted: Story = {
  args: {
    steps: sampleSteps.map(step => ({ ...step, status: 'completed' as const })),
  },
}

export const ShortTimeline: Story = {
  args: {
    steps: [
      {
        id: '1',
        title: 'Start Here',
        status: 'completed',
      },
      {
        id: '2',
        title: 'In Progress',
        status: 'current',
      },
      {
        id: '3',
        title: 'Coming Next',
        status: 'locked',
      },
    ],
  },
}

export const WithLongContent: Story = {
  args: {
    steps: [
      {
        id: '1',
        title: 'First Principles Thinking',
        description: 'Break down complex problems into fundamental truths and build up from there. This mental model helps you think clearly and avoid assumptions.',
        status: 'completed',
      },
      {
        id: '2',
        title: 'The Map is Not the Territory',
        description: 'Remember that representations of reality are not reality itself. Our models and abstractions, while useful, always leave something out.',
        status: 'current',
      },
      {
        id: '3',
        title: 'Circle of Competence',
        description: 'Know what you know and, more importantly, know what you don\'t know. Operating within your circle of competence leads to better decisions.',
        status: 'locked',
      },
    ],
  },
}