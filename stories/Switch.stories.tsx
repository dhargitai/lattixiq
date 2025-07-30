import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'

const meta = {
  title: 'UI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const Checked: Story = {
  args: {
    checked: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState(false)
    
    return (
      <div className="flex items-center space-x-2">
        <Switch
          id="airplane-mode"
          checked={checked}
          onCheckedChange={setChecked}
        />
        <label
          htmlFor="airplane-mode"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Airplane Mode {checked ? 'On' : 'Off'}
        </label>
      </div>
    )
  },
}

export const NotificationSettings: Story = {
  render: () => {
    const [dailyReminder, setDailyReminder] = useState(true)
    const [emailNotifications, setEmailNotifications] = useState(false)
    const [pushNotifications, setPushNotifications] = useState(true)
    
    return (
      <div className="w-full max-w-sm space-y-4">
        <h3 className="text-lg font-medium">Notification Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="daily-reminder" className="text-sm font-medium">
              Daily Reminder
            </label>
            <Switch
              id="daily-reminder"
              checked={dailyReminder}
              onCheckedChange={setDailyReminder}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label htmlFor="email-notifications" className="text-sm font-medium">
              Email Notifications
            </label>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label htmlFor="push-notifications" className="text-sm font-medium">
              Push Notifications
            </label>
            <Switch
              id="push-notifications"
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
        </div>
      </div>
    )
  },
}

export const WithDescription: Story = {
  render: () => {
    const [enabled, setEnabled] = useState(false)
    
    return (
      <div className="w-full max-w-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label htmlFor="marketing" className="text-sm font-medium">
              Marketing emails
            </label>
            <p className="text-xs text-muted-foreground">
              Receive emails about new products and features
            </p>
          </div>
          <Switch
            id="marketing"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>
      </div>
    )
  },
}