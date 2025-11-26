import BaseBreadcrumb from './BaseBreadcrumb.vue'

export default {
  title: 'Base/Breadcrumb',
  component: BaseBreadcrumb,
}

const Template = (args) => ({
  components: { BaseBreadcrumb },
  setup() {
    return { args }
  },
  template: '<BaseBreadcrumb v-bind="args" />',
})

export const Default = Template.bind({})
Default.args = {
  items: [
    { label: 'Home', href: '/' },
    { label: 'Library', href: '/library' },
    { label: 'Data', href: '/library/data' },
  ],
}
