const HANGUL = /\p{Script=Hangul}/gu
const LETTER = /\p{L}/gu
const URL = /https?:\/\/\S+/g

/**
 * "ko" for text that is mostly Korean, so it wraps between words instead of inside them (see :lang(ko) in index.css).
 * Only Korean: Chinese has no spaces, so keeping its words whole would make it overflow. Links don't count, since an
 * answer's citations are in Latin letters whatever its language.
 */
export function koreanLang(text: string): 'ko' | undefined {
  const words = text.replace(URL, '')
  const hangul = words.match(HANGUL)?.length ?? 0
  const letters = words.match(LETTER)?.length ?? 0
  return hangul > letters / 2 ? 'ko' : undefined
}
