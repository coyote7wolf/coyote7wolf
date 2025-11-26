import { mount } from '@vue/test-utils'
import BaseDropdown from './BaseDropdown.vue'
import { nextTick } from 'vue'

describe('BaseDropdown', () => {
  it('renders slot content', async () => {
    const wrapper = mount(BaseDropdown, {
      slots: { menu: '<a href="#">Test</a>' },
    })
    wrapper.vm.open = true
    await nextTick()
    expect(wrapper.find('a').text()).toBe('Test')
  })
})
