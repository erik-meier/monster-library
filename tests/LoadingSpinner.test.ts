import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    expect(wrapper.find('.spinner').exists()).toBe(true)
  })

  it('renders with a message when provided', () => {
    const message = 'Loading monsters...'
    const wrapper = mount(LoadingSpinner, {
      props: { message }
    })
    expect(wrapper.text()).toContain(message)
    expect(wrapper.find('.loading-message').exists()).toBe(true)
  })

  it('renders inline when inline prop is true', () => {
    const wrapper = mount(LoadingSpinner, {
      props: { inline: true }
    })
    expect(wrapper.find('.loading-spinner.inline').exists()).toBe(true)
  })

  it('does not render message when not provided', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.find('.loading-message').exists()).toBe(false)
  })
})
