import BaseAvatar from './BaseAvatar.vue'

export default {
  title: 'Components/BaseAvatar',
  component: BaseAvatar,
  argTypes: {
    src: { control: 'text' },
    alt: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component: '頭像元件，支援 src、alt 屬性，可用於顯示使用者大頭貼。',
      },
    },
  },
}

export const Default = (args) => ({
  components: { BaseAvatar },
  setup() {
    return { args }
  },
  template: '<BaseAvatar v-bind="args" />',
})

Default.args = {
  src: 'https://i.pravatar.cc/100',
  alt: 'Avatar',
}
