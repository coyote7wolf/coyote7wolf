import BasePagination from './BasePagination.vue'

export default {
  title: 'Components/BasePagination',
  component: BasePagination,
  argTypes: {
    page: { control: 'number' },
  },
}

export const Default = (args) => ({
  components: { BasePagination },
  setup() {
    return { args }
  },
  template: `<BasePagination v-bind="args" />`,
})

Default.args = {
  page: 1,
}
