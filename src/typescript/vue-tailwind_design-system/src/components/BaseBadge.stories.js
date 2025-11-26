import BaseBadge from './BaseBadge.vue'

export default {
  title: 'Components/BaseBadge',
  component: BaseBadge,
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['gray', 'blue', 'green', 'red', 'yellow'],
    },
    label: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component: '徽章/標籤元件，支援多種顏色與自訂內容。',
      },
    },
  },
}

export const Default = (args) => ({
  components: { BaseBadge },
  setup() {
    return { args }
  },
  template: '<BaseBadge :color="args.color">{{ args.label }}</BaseBadge>',
})

Default.args = {
  color: 'gray',
  label: '標籤',
}
