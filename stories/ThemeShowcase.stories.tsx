import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { ScreenCard } from '@/components/ui/screen-card'
import { Brain, Target, BookOpen, Lightbulb } from 'lucide-react'

const meta = {
  title: 'Theme/Showcase',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ColorPalette: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">LattixIQ Color Palette</h2>
        <p className="text-muted-foreground mb-6">Serene Minimalist Design System</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <div className="h-24 rounded-lg bg-primary" />
          <p className="text-sm font-medium">Primary</p>
          <p className="text-xs text-muted-foreground">Indigo-600</p>
        </div>
        <div className="space-y-2">
          <div className="h-24 rounded-lg bg-secondary" />
          <p className="text-sm font-medium">Secondary</p>
          <p className="text-xs text-muted-foreground">Indigo-100</p>
        </div>
        <div className="space-y-2">
          <div className="h-24 rounded-lg bg-accent" />
          <p className="text-sm font-medium">Accent</p>
          <p className="text-xs text-muted-foreground">Indigo-100</p>
        </div>
        <div className="space-y-2">
          <div className="h-24 rounded-lg bg-muted" />
          <p className="text-sm font-medium">Muted</p>
          <p className="text-xs text-muted-foreground">Neutral-100</p>
        </div>
        <div className="space-y-2">
          <div className="h-24 rounded-lg bg-success" />
          <p className="text-sm font-medium">Success</p>
          <p className="text-xs text-muted-foreground">Green-500</p>
        </div>
        <div className="space-y-2">
          <div className="h-24 rounded-lg bg-destructive" />
          <p className="text-sm font-medium">Destructive</p>
          <p className="text-xs text-muted-foreground">Red-500</p>
        </div>
        <div className="space-y-2">
          <div className="h-24 rounded-lg border bg-background" />
          <p className="text-sm font-medium">Background</p>
          <p className="text-xs text-muted-foreground">Indigo-50</p>
        </div>
        <div className="space-y-2">
          <div className="h-24 rounded-lg bg-foreground" />
          <p className="text-sm font-medium">Foreground</p>
          <p className="text-xs text-muted-foreground">Indigo-900</p>
        </div>
      </div>
    </div>
  ),
}

export const ComponentShowcase: Story = {
  render: () => (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-4">Component Library</h2>
        <p className="text-muted-foreground">All components styled with our serene theme</p>
      </div>
      
      <div className="space-y-8">
        {/* Buttons */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </section>
        
        {/* Cards */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Simple Card</CardTitle>
                <CardDescription>With description</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Card content goes here.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
              <CardHeader>
                <CardTitle>Gradient Card</CardTitle>
                <CardDescription>Subtle gradient background</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">For special content.</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer">
              <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
                <CardDescription>Hover to see effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Responds to interaction.</p>
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* Badges */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Badges</h3>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="success">Success</Badge>
          </div>
        </section>
        
        {/* Form Elements */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Form Elements</h3>
          <div className="max-w-sm space-y-4">
            <Input placeholder="Enter your goal..." />
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Enable notifications</label>
              <Switch />
            </div>
            <Progress value={65} />
          </div>
        </section>
      </div>
    </div>
  ),
}

export const AnimationShowcase: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Animations & Transitions</h2>
        <p className="text-muted-foreground">Smooth, calming animations for better UX</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScreenCard
          title="Fade In Up"
          description="Cards animate in with a subtle upward motion"
          icon={<Brain className="w-8 h-8" />}
          delay={100}
        />
        <ScreenCard
          title="Staggered Animation"
          description="Sequential animations create visual hierarchy"
          icon={<Target className="w-8 h-8" />}
          delay={200}
        />
        <ScreenCard
          title="Hover Effects"
          description="Gentle scale and shadow on interaction"
          icon={<BookOpen className="w-8 h-8" />}
          delay={300}
        />
        <ScreenCard
          title="Smooth Transitions"
          description="All state changes are smoothly animated"
          icon={<Lightbulb className="w-8 h-8" />}
          delay={400}
        />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Interactive Elements</h3>
        <div className="flex flex-wrap gap-4">
          <Button className="hover-scale">Hover Scale</Button>
          <Card className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300">
            <p className="text-sm">Hover for shadow</p>
          </Card>
          <Badge className="animate-pulse">Pulsing Badge</Badge>
        </div>
      </div>
    </div>
  ),
}

export const Typography: Story = {
  render: () => (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold mb-4">Typography Scale</h2>
        <p className="text-muted-foreground">Clean, readable text hierarchy</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Heading 1 - 4xl Bold</h1>
          <p className="text-muted-foreground">For main page titles</p>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold">Heading 2 - 3xl Bold</h2>
          <p className="text-muted-foreground">For section headers</p>
        </div>
        
        <div>
          <h3 className="text-2xl font-semibold">Heading 3 - 2xl Semibold</h3>
          <p className="text-muted-foreground">For subsection headers</p>
        </div>
        
        <div>
          <h4 className="text-xl font-semibold">Heading 4 - xl Semibold</h4>
          <p className="text-muted-foreground">For card titles</p>
        </div>
        
        <div>
          <p className="text-base">Body Text - Base size</p>
          <p className="text-muted-foreground">For general content and descriptions</p>
        </div>
        
        <div>
          <p className="text-sm">Small Text - sm</p>
          <p className="text-sm text-muted-foreground">For secondary information and captions</p>
        </div>
        
        <div>
          <p className="text-xs">Extra Small - xs</p>
          <p className="text-xs text-muted-foreground">For labels and meta information</p>
        </div>
      </div>
    </div>
  ),
}