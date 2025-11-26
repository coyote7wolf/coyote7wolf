import { mount } from '@vue/test-utils'
import BaseBreadcrumb from './BaseBreadcrumb.vue'

describe('BaseBreadcrumb', () => {
  it('renders all breadcrumb items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Library', href: '/library' },
    ]
    const wrapper = mount(BaseBreadcrumb, { props: { items } })
    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Library')
  })
})
