import BaseSwitch from './BaseSwitch.vue'

export default {
  title: 'Components/BaseSwitch',
  component: BaseSwitch,
  argTypes: {
    modelValue: { control: 'boolean' },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    onChange: { action: 'change' },
  },
  parameters: {
    docs: {
      description: {
        component: '切換開關，支援 v-model、label、disabled、change 事件。',
      },
    },
  },
}

export const Default = (args) => ({
  components: { BaseSwitch },
  setup() {
    return { args }
  },
  template: '<BaseSwitch v-bind="args" @change="args.onChange">{{ args.label }}</BaseSwitch>',
})

Default.args = {
  modelValue: false,
  label: '開關',
  disabled: false,
}
