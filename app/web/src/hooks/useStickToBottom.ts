import { useEffect, useLayoutEffect, useRef } from 'react'

/**
 * Keeps the end of a conversation in view as its content changes, unless the reader scrolled up. Put the returned ref
 * on an element after the content. It works whichever ancestor scrolls, since narrow and wide layouts differ.
 */
export function useStickToBottom<T extends HTMLElement>(content: unknown) {
  const endRef = useRef<T>(null)
  const pinned = useRef(true)

  useEffect(() => {
    const end = endRef.current
    if (!end) return
    const onScroll = (event: Event) => {
      const scroller = event.target
      if (!(scroller instanceof Element) || !scroller.contains(end)) return
      pinned.current = end.getBoundingClientRect().top - scroller.getBoundingClientRect().bottom < 80
    }
    // Scroll events don't bubble, but the document sees them all while they're captured.
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => document.removeEventListener('scroll', onScroll, { capture: true })
  }, [])

  useLayoutEffect(() => {
    if (pinned.current) endRef.current?.scrollIntoView({ block: 'end' })
  }, [content])

  return endRef
}
