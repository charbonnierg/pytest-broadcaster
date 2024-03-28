export const readJSONInto = (
  el: HTMLInputElement | null,
  writer: (result: any) => void,
) => {
  if (el?.files == null || el.files.length == 0) {
    return
  }
  const file = el.files[0]
  const reader = new FileReader()
  reader.onload = (event) => {
    const from = event.target as FileReader
    const content = from.result
    const result = JSON.parse(content as string)
    writer(result)
  }
  reader.readAsText(file)
}
