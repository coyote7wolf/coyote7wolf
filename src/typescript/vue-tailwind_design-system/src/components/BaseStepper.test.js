import { mount } from '@vue/test-utils'
import BaseStepper from './BaseStepper.vue'

describe('BaseStepper', () => {
  it('renders all steps', () => {
    const steps = ['A', 'B', 'C']
    const wrapper = mount(BaseStepper, { props: { steps, current: 1 } })
    expect(wrapper.text()).toContain('A')
    expect(wrapper.text()).toContain('B')
    expect(wrapper.text()).toContain('C')
  })
})
