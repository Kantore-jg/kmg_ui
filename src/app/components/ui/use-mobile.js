import { ref, onMounted, onUnmounted, watchEffect } from 'vue'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const isMobile = ref(false) // Default to false or undefined logic if needed to match hydration
  // In Vue composition API, we can just use ref

  const onChange = () => {
    if (typeof window !== 'undefined') {
      isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
    }
  }

  onMounted(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener('change', onChange)
    onChange() // Initial check
    
    onUnmounted(() => {
      mql.removeEventListener('change', onChange)
    })
  })

  return isMobile
}
