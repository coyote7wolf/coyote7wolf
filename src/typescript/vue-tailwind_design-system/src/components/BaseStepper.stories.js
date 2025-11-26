import BaseStepper from './BaseStepper.vue'

export default {
  title: 'Base/Stepper',
  component: BaseStepper,
}

const Template = (args) => ({
  components: { BaseStepper },
  setup() {
    return { args }
  },
  template: '<BaseStepper v-bind="args" />',
})

export const Default = Template.bind({})
Default.args = {
  steps: ['Step 1', 'Step 2', 'Step 3'],
  current: 1,
}
