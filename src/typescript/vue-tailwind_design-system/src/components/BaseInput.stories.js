import BaseInput from './BaseInput.vue'

export default {
  title: 'Components/BaseInput',
  component: BaseInput,
  argTypes: {
    modelValue: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    onInput: { action: 'input' },
    onChange: { action: 'change' },
  },
  parameters: {
    docs: {
      description: {
        component: '基本輸入框，支援 v-model、placeholder、disabled、input/change 事件。',
      },
    },
  },
}

export const Default = (args) => ({
  components: { BaseInput },
  setup() {
    return { args }
  },
  template: '<BaseInput v-bind="args" @input="args.onInput" @change="args.onChange" />',
})

Default.args = {
  modelValue: '',
  placeholder: '輸入內容...',
  disabled: false,
}
