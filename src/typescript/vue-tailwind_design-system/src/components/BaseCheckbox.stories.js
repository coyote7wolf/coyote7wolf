import BaseCheckbox from './BaseCheckbox.vue'

export default {
  title: 'Components/BaseCheckbox',
  component: BaseCheckbox,
  argTypes: {
    modelValue: { control: 'boolean' },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    onChange: { action: 'change' },
  },
  parameters: {
    docs: {
      description: {
        component: '勾選框，支援 v-model、label、disabled、change 事件。',
      },
    },
  },
}

export const Default = (args) => ({
  components: { BaseCheckbox },
  setup() {
    return { args }
  },
  template: '<BaseCheckbox v-bind="args" @change="args.onChange">{{ args.label }}</BaseCheckbox>',
})

Default.args = {
  modelValue: false,
  label: '勾選我',
  disabled: false,
}
