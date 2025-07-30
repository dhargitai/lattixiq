import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BottomNavigation, type NavItem } from '@/components/ui/bottom-navigation'
import { Home, BookOpen, Settings, User } from 'lucide-react'
import { useState } from 'react'

const meta = {
  title: 'Custom/BottomNavigation',
  component: BottomNavigation,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BottomNavigation>

export default meta
type Story = StoryObj<typeof meta>

const sampleItems: NavItem[] = [
  {
    id: 'home',
    label: 'My Toolkit',
    icon: <Home className="w-5 h-5" />,
  },
  {
    id: 'learn',
    label: 'Learn',
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: <User className="w-5 h-5" />,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />,
  },
]

export const Default: Story = {
  args: {
    items: sampleItems,
    activeItem: 'home',
  },
}

export const Interactive: Story = {
  args: {
    items: sampleItems,
  },
  render: (args) => {
    const [activeItem, setActiveItem] = useState('home')
    
    return (
      <div className="relative h-screen bg-background">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Bottom Navigation Demo</h2>
          <p className="text-muted-foreground">
            Current page: <strong>{activeItem}</strong>
          </p>
        </div>
        <BottomNavigation
          {...args}
          activeItem={activeItem}
          onItemClick={(item) => setActiveItem(item.id)}
        />
      </div>
    )
  },
}

export const TwoItems: Story = {
  args: {
    items: [
      {
        id: 'toolkit',
        label: 'My Toolkit',
        icon: <Home className="w-5 h-5" />,
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <Settings className="w-5 h-5" />,
      },
    ],
    activeItem: 'toolkit',
  },
}

export const WithContent: Story = {
  args: {
    items: sampleItems,
  },
  render: (args) => {
    const [activeItem, setActiveItem] = useState('home')
    
    const content: Record<string, React.ReactNode> = {
      home: (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">My Toolkit</h1>
          <p>Welcome to your personal growth hub.</p>
        </div>
      ),
      learn: (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Learn</h1>
          <p>Discover powerful mental models.</p>
        </div>
      ),
      profile: (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <p>View your progress and achievements.</p>
        </div>
      ),
      settings: (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          <p>Customize your experience.</p>
        </div>
      ),
    }
    
    return (
      <div className="relative h-screen bg-background">
        <div className="h-full pb-16 overflow-auto">
          {content[activeItem]}
        </div>
        <BottomNavigation
          {...args}
          activeItem={activeItem}
          onItemClick={(item) => setActiveItem(item.id)}
        />
      </div>
    )
  },
}