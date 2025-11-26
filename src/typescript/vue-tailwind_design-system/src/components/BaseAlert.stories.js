import BaseAlert from './BaseAlert.vue'

export default {
  title: 'Components/BaseAlert',
  component: BaseAlert,
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['info', 'success', 'warning', 'error'],
    },
  },
  parameters: {
    docs: {
      description: {
        component: '警示訊息元件，支援 info/success/warning/error 類型，slot 可自訂內容。',
      },
    },
  },
}

export const Info = (args) => ({
  components: { BaseAlert },
  setup() {
    return { args }
  },
  template: '<BaseAlert v-bind="args">Info 訊息</BaseAlert>',
})
Info.args = { type: 'info' }

export const Success = (args) => ({
  components: { BaseAlert },
  setup() {
    return { args }
  },
  template: '<BaseAlert v-bind="args">成功訊息</BaseAlert>',
})
Success.args = { type: 'success' }

export const Warning = (args) => ({
  components: { BaseAlert },
  setup() {
    return { args }
  },
  template: '<BaseAlert v-bind="args">警告訊息</BaseAlert>',
})
Warning.args = { type: 'warning' }

export const Error = (args) => ({
  components: { BaseAlert },
  setup() {
    return { args }
  },
  template: '<BaseAlert v-bind="args">錯誤訊息</BaseAlert>',
})
Error.args = { type: 'error' }
