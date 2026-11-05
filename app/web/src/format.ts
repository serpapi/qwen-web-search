const integer = new Intl.NumberFormat('en-US')

export function formatNumber(value: number): string {
  return integer.format(value)
}

/** "1 search", "2 searches", "1,203 tokens" */
export function formatCount(value: number, singular: string, plural = `${singular}s`): string {
  return `${formatNumber(value)} ${value === 1 ? singular : plural}`
}

export function formatSeconds(seconds: number): string {
  return `${seconds.toFixed(1)} s`
}
