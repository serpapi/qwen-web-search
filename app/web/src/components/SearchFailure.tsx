/** What to do about the failures SerpApi and the app explain, matched case-insensitively in the reason. */
const HINTS = [
  { match: 'invalid api key', hint: 'Check SERPAPI_API_KEY in .env.' },
  { match: 'run out of searches', hint: 'Check your SerpApi plan.' },
  { match: 'unknown engine', hint: "Qwen asked for an engine that doesn't exist; it usually retries with a valid one." },
]

/** Why a search failed, from its payload ("Search failed: <reason>"), and what to do about it when that's known. */
export function SearchFailure({ payload }: { payload: string }) {
  const reason = payload.replace(/^Search failed:\s*/, '')
  const hint = HINTS.find(({ match }) => reason.toLowerCase().includes(match))?.hint

  return (
    <div className="mt-1.5 space-y-1 pl-5.5">
      <p className="text-red-900 wrap-anywhere">{reason}</p>
      {hint && <p className="text-neutral-700">{hint}</p>}
    </div>
  )
}
