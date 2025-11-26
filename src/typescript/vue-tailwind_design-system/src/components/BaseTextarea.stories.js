import BaseTextarea from './BaseTextarea.vue'

export default {
  title: 'Components/BaseTextarea',
  component: BaseTextarea,
  argTypes: {
    modelValue: { control: 'text' },
    placeholder: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component: '多行文字輸入框，支援 v-model、placeholder。',
      },
    },
  },
}

export const Default = (args) => ({
  components: { BaseTextarea },
  setup() {
    return { args }
  },
  template: '<BaseTextarea v-bind="args" />',
})

Default.args = {
  modelValue: '',
  placeholder: '請輸入內容...',
}
