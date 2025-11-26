import BaseRadio from './BaseRadio.vue'

export default {
  title: 'Components/BaseRadio',
  component: BaseRadio,
  argTypes: {
    modelValue: { control: 'boolean' },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    onChange: { action: 'change' },
  },
  parameters: {
    docs: {
      description: {
        component: '單選框，支援 v-model、label、disabled、change 事件。',
      },
    },
  },
}

export const Default = (args) => ({
  components: { BaseRadio },
  setup() {
    return { args }
  },
  template: '<BaseRadio v-bind="args" @change="args.onChange">{{ args.label }}</BaseRadio>',
})

Default.args = {
  modelValue: false,
  label: '選我',
  disabled: false,
}
