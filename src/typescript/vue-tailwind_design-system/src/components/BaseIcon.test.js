import { mount } from '@vue/test-utils'
import BaseIcon from './BaseIcon.vue'

describe('BaseIcon', () => {
  it('renders correct icon', () => {
    const wrapper = mount(BaseIcon, { props: { icon: 'check' } })
    expect(wrapper.html()).toContain('svg')
  })
  it('applies size class', () => {
    const wrapper = mount(BaseIcon, { props: { icon: 'check', size: 'lg' } })
    expect(wrapper.classes()).toContain('w-6')
  })
})
