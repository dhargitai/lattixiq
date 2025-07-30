import type { Preview } from '@storybook/nextjs-vite'
import './tailwind.css'
import { withTheme } from './decorators'

const preview: Preview = {
  decorators: [withTheme],
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    },
    
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: 'oklch(0.98 0.006 263)',
        },
        {
          name: 'dark',
          value: 'oklch(0.15 0.01 263)',
        },
      ],
    },
  },
};

export default preview;