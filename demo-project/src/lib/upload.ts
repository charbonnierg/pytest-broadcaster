/* upload.ts exposes utilities to read JSON files into arbitrary destination.*/

export const newJSONReader =
  (writer: (filename: string, content: any) => void) =>
  (el: HTMLInputElement | null) => {
    if (el?.files == null || el.files.length == 0) {
      return
    }
    const file = el.files[0]
    const reader = new FileReader()
    reader.onload = (event) => {
      const from = event.target as FileReader
      const content = from.result
      const result = JSON.parse(content as string)
      writer(file.name, result)
    }
    reader.readAsText(file)
  }
