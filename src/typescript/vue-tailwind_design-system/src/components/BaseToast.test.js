import { mount } from '@vue/test-utils'
import BaseToast from './BaseToast.vue'

import { vi } from 'vitest'
describe('BaseToast', () => {
  it('shows toast and removes after duration', async () => {
    vi.useFakeTimers()
    const wrapper = mount(BaseToast)
    wrapper.vm.show({ message: 'Test', type: 'success', icon: 'check', duration: 100 })
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Test')
    vi.advanceTimersByTime(200)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).not.toContain('Test')
    vi.useRealTimers()
  })
})
