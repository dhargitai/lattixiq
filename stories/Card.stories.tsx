import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the card content area where you can place any content.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
}

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Simple Card</CardTitle>
      </CardHeader>
      <CardContent>
        <p>A simple card with just a title and content.</p>
      </CardContent>
    </Card>
  ),
}

export const WithGradient: Story = {
  render: () => (
    <Card className="w-[350px] bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
      <CardHeader>
        <CardTitle>Gradient Card</CardTitle>
        <CardDescription>This card has a subtle gradient background</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Perfect for feature highlights and special content.</p>
      </CardContent>
    </Card>
  ),
}

export const Interactive: Story = {
  render: () => (
    <Card className="w-[350px] cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-indigo-200">
      <CardHeader>
        <CardTitle>Interactive Card</CardTitle>
        <CardDescription>Hover over this card to see the effect</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card responds to hover with scale and shadow effects.</p>
      </CardContent>
    </Card>
  ),
}