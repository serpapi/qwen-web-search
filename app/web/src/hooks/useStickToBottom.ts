import { useEffect, useLayoutEffect, useRef } from 'react'

/** Keeps a scroll container at the bottom as content changes, unless the reader scrolled up. */
export function useStickToBottom<T extends HTMLElement>(content: unknown) {
  const ref = useRef<T>(null)
  const pinned = useRef(true)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const onScroll = () => {
      pinned.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80
    }
    element.addEventListener('scroll', onScroll)
    return () => element.removeEventListener('scroll', onScroll)
  }, [])

  useLayoutEffect(() => {
    const element = ref.current
    if (element && pinned.current) element.scrollTop = element.scrollHeight
  }, [content])

  return ref
}
