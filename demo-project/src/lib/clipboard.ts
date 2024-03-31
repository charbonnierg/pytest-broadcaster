/* Create a new callback that will:
 * copy a string to the clipboard
 * prevent event default.
 */
export const copy = (value: string) => (e: any) => {
  navigator.clipboard.writeText(value)
  e?.preventDefault()
}
