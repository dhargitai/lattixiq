import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProgressHeader } from '@/components/ui/progress-header'
import { useState, useEffect } from 'react'

const meta = {
  title: 'Custom/ProgressHeader',
  component: ProgressHeader,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100 },
    },
    showPercentage: {
      control: 'boolean',
    },
    sticky: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof ProgressHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 65,
    showPercentage: true,
    sticky: false,
  },
}

export const NonSticky: Story = {
  args: {
    value: 45,
    showPercentage: true,
    sticky: false,
  },
}

export const WithoutPercentage: Story = {
  args: {
    value: 75,
    showPercentage: false,
    sticky: false,
  },
}

export const Interactive: Story = {
  args: {
    value: 0,
    showPercentage: true,
    sticky: false,
  },
  render: (args) => {
    const [progress, setProgress] = useState(0)
    
    useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0
          return prev + 1
        })
      }, 50)
      
      return () => clearInterval(timer)
    }, [])
    
    return <ProgressHeader {...args} value={progress} />
  },
}

export const InContext: Story = {
  args: {
    value: 30,
    showPercentage: true,
    sticky: true,
  },
  render: (args) => {
    const [scrollProgress, setScrollProgress] = useState(0)
    
    useEffect(() => {
      const handleScroll = () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight
        const progress = (window.scrollY / totalHeight) * 100
        setScrollProgress(Math.min(100, Math.max(0, progress)))
      }
      
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    
    return (
      <div>
        <ProgressHeader {...args} value={scrollProgress} />
        <div className="p-8 max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Reading Progress Demo</h1>
          <p className="mb-4">
            Scroll down to see the progress bar update. The progress bar will hide when scrolling down and reappear when scrolling up.
          </p>
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i} className="mb-4 text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          ))}
        </div>
      </div>
    )
  },
}