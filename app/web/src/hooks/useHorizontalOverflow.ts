import { useCallback, useState } from 'react'

/** Whether an element's content is wider than the element, so it scrolls sideways. Put the returned ref on it. */
export function useHorizontalOverflow() {
  const [overflows, setOverflows] = useState(false)

  const ref = useCallback((element: HTMLElement | null) => {
    if (!element) return
    const observer = new ResizeObserver(() => setOverflows(element.scrollWidth > element.clientWidth))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, overflows] as const
}
