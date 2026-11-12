/** Shown when a request never reached server.py. */
export const SERVER_UNREACHABLE = "Can't reach the app server. Run `python server.py` in `app/`."

/** True when the response came from Vite's dev proxy because server.py isn't running: it answers 502 for those. */
export function isProxyError(response: Response): boolean {
  return response.status === 502
}

/** An HTTP error from server.py, which logs the cause in its terminal. */
export function httpError(response: Response): string {
  return `The app server answered HTTP ${response.status}. Check the terminal running \`python server.py\`.`
}
