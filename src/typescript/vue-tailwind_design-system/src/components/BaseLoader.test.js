import { mount } from '@vue/test-utils'
import BaseLoader from './BaseLoader.vue'

describe('BaseLoader', () => {
  it('renders loader svg', () => {
    const wrapper = mount(BaseLoader)
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
