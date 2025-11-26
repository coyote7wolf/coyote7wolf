import { mount } from '@vue/test-utils'
import BaseProgress from './BaseProgress.vue'

describe('BaseProgress', () => {
  it('renders correct percent', () => {
    const wrapper = mount(BaseProgress, { props: { percent: 42 } })
    expect(wrapper.html()).toContain('width: 42%')
  })
})
