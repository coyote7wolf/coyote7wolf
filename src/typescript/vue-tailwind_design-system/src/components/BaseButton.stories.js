import BaseButton from './BaseButton.vue'

export default {
  title: 'Components/BaseButton',
  component: BaseButton,
  argTypes: {
    label: { control: 'text' },
    color: { control: { type: 'select', options: ['primary', 'secondary', 'danger'] } },
    onClick: { action: 'clicked' },
  },
}

const Template = (args) => ({
  components: { BaseButton },
  setup() {
    return { args }
  },
  template: `<BaseButton :color=\"args.color\" @click=\"args.onClick\">{{ args.label }}</BaseButton>`,
})

export const Primary = Template.bind({})
Primary.args = {
  label: 'Primary Button',
  color: 'primary',
}

export const Secondary = Template.bind({})
Secondary.args = {
  label: 'Secondary Button',
  color: 'secondary',
}

export const Danger = Template.bind({})
Danger.args = {
  label: 'Danger Button',
  color: 'danger',
}

export const DarkMode = Template.bind({})
DarkMode.args = {
  label: 'Dark Mode Button',
  color: 'primary',
}
DarkMode.parameters = {
  backgrounds: { default: 'dark' },
  docs: {
    description: {
      story: '在 Storybook 右上角切換 dark mode，或在 preview.js 設定 backgrounds。',
    },
  },
}
