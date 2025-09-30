import { onMounted, onUnmounted, nextTick, type Ref } from 'vue'

export function useFocusTrap(containerRef: Ref<HTMLElement | null>) {
  let previousActiveElement: Element | null = null
  
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ')

  const getFocusableElements = (): HTMLElement[] => {
    if (!containerRef.value) return []
    return Array.from(containerRef.value.querySelectorAll(focusableSelectors))
  }

  const trapFocus = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return

    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  const initializeFocus = async () => {
    await nextTick()
    
    // Store the previously focused element
    previousActiveElement = document.activeElement
    
    // Focus the first focusable element
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }
  }

  const restoreFocus = () => {
    if (previousActiveElement && 'focus' in previousActiveElement) {
      (previousActiveElement as HTMLElement).focus()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', trapFocus)
    initializeFocus()
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', trapFocus)
    restoreFocus()
  })

  return {
    initializeFocus,
    restoreFocus
  }
}