import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelpModal from '@/components/HelpModal.vue'

describe('HelpModal', () => {
  it('renders when isOpen is true', () => {
    const wrapper = mount(HelpModal, {
      props: {
        isOpen: true
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    expect(wrapper.find('.modal-backdrop').exists()).toBe(true)
    expect(wrapper.find('.modal-dialog').exists()).toBe(true)
  })

  it('does not render when isOpen is false', () => {
    const wrapper = mount(HelpModal, {
      props: {
        isOpen: false
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    expect(wrapper.find('.modal-backdrop').exists()).toBe(false)
  })

  it('renders with custom title', () => {
    const title = 'Custom Help Title'
    const wrapper = mount(HelpModal, {
      props: {
        isOpen: true,
        title
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    expect(wrapper.text()).toContain(title)
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(HelpModal, {
      props: {
        isOpen: true
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    await wrapper.find('.close-btn').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close event when "Got it!" button is clicked', async () => {
    const wrapper = mount(HelpModal, {
      props: {
        isOpen: true
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    await wrapper.find('.btn-primary').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('renders default help content', () => {
    const wrapper = mount(HelpModal, {
      props: {
        isOpen: true
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    expect(wrapper.text()).toContain('Monster Builder Guide')
    expect(wrapper.text()).toContain('Keyboard Shortcuts')
    expect(wrapper.text()).toContain('Alt')
  })

  it('renders custom slot content', () => {
    const customContent = 'Custom help content'
    const wrapper = mount(HelpModal, {
      props: {
        isOpen: true
      },
      slots: {
        default: customContent
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
    expect(wrapper.text()).toContain(customContent)
  })
})
