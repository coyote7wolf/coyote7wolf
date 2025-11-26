import { mount } from '@vue/test-utils'
import BaseCollapse from './BaseCollapse.vue'

describe('BaseCollapse', () => {
  it('renders all sections', () => {
    const items = [
      { title: 'A', content: 'A content' },
      { title: 'B', content: 'B content' },
    ]
    const wrapper = mount(BaseCollapse, { props: { items } })
    expect(wrapper.text()).toContain('A')
    expect(wrapper.text()).toContain('B')
  })
})
