import { within, userEvent } from '@storybook/testing-library'
import BaseModal from './BaseModal.vue'

export default {
  title: 'Components/BaseModal',
  component: BaseModal,
  argTypes: {
    modelValue: { control: 'boolean' },
    onUpdateModelValue: { action: 'update:modelValue' },
  },
  parameters: {
    docs: {
      description: {
        component: '彈窗元件，支援 v-model、update:modelValue 事件。',
      },
    },
  },
}

export const Default = (args) => ({
  components: { BaseModal },
  setup() {
    return { args }
  },
  template: `<BaseModal v-bind="args" @update:modelValue="args.onUpdateModelValue">這是彈窗內容</BaseModal>`,
})

Default.args = {
  modelValue: true,
}

Default.play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement)
  const closeBtn = await canvas.findByRole('button')
  await userEvent.click(closeBtn)
}
