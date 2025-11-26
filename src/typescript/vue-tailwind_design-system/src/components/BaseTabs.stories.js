import { within, userEvent } from '@storybook/testing-library'
import BaseTabs from './BaseTabs.vue'

export default {
  title: 'Components/BaseTabs',
  component: BaseTabs,
  argTypes: {
    tabs: { control: 'object' },
    active: { control: 'number' },
    onChange: { action: 'change' },
  },
  parameters: {
    docs: {
      description: {
        component: '分頁元件，支援 tabs、active、change 事件。',
      },
    },
  },
}

export const Default = (args) => ({
  components: { BaseTabs },
  setup() {
    return { args }
  },
  template: `<BaseTabs v-bind="args" @change="args.onChange" />`,
})

Default.args = {
  tabs: ['Tab 1', 'Tab 2', 'Tab 3'],
  active: 0,
}

Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement)
  const tab = await canvas.findByText('Tab 2')
  await userEvent.click(tab)
}
