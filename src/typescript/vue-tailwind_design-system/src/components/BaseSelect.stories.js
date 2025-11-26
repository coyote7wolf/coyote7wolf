import BaseSelect from './BaseSelect.vue'

export default {
  title: 'Components/BaseSelect',
  component: BaseSelect,
  argTypes: {
    modelValue: { control: 'text' },
    disabled: { control: 'boolean' },
    onChange: { action: 'change' },
  },
  parameters: {
    docs: {
      description: {
        component: '下拉選單，支援 v-model、disabled、change 事件。',
      },
    },
  },
}

export const Default = (args) => ({
  components: { BaseSelect },
  setup() {
    return { args }
  },
  template: `<BaseSelect v-bind="args" @change="args.onChange">
    <option value="">請選擇</option>
    <option value="A">A</option>
    <option value="B">B</option>
  </BaseSelect>`,
})

Default.args = {
  modelValue: '',
  disabled: false,
}
