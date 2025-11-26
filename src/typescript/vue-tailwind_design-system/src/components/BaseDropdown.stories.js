import { within, userEvent } from '@storybook/testing-library'
import BaseDropdown from './BaseDropdown.vue'

export default {
  title: 'Base/Dropdown',
  component: BaseDropdown,
  argTypes: {
    onToggle: { action: 'toggle' },
  },
  parameters: {
    docs: {
      description: {
        component: '下拉選單元件，支援 toggle 事件。',
      },
    },
  },
}

const Template = (args) => ({
  components: { BaseDropdown },
  setup() {
    return { args }
  },
  template: `<BaseDropdown v-bind="args" @toggle="args.onToggle"><template #menu><a href="#">Item 1</a><a href="#">Item 2</a></template></BaseDropdown>`,
})

export const Default = Template.bind({})

Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement)
  const btn = await canvas.findByRole('button')
  await userEvent.click(btn)
}
