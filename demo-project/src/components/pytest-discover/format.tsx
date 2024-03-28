import { SlIcon } from "@shoelace-style/shoelace/dist/react"
import SlTag from "@shoelace-style/shoelace/dist/react/tag/index.js"

import type { TestItem } from "../../types/test_item"

/* Create a new callback that will:
 * copy a string to the clipboard
 * prevent event default.
 */
const copy = (value: string) => (e: any) => {
  navigator.clipboard.writeText(value)
  e?.preventDefault()
}

/* Format a test item name */
export const sanitizeName = (item: TestItem): string => {
  if (item.name == null || item.name == "") {
    return ""
  }
  return item.name.replaceAll("_", " ")
}

/* Format a test item docstring */
export const truncateDescription = (doc: string | null): string => {
  if (doc == null || doc == "") {
    return ""
  }
  if (doc.length > 100) {
    return doc.slice(0, 100) + "..."
  }
  return doc
}

/* Format a test item markers */
export const formatMarkers = (item: TestItem): JSX.Element | null => {
  if (item.markers.length === 0) {
    return null
  }
  const key = (marker: string) => `${item.id}-detail-${marker}`
  return (
    <ul>
      {item.markers.map((marker) => {
        return (
          <li key={key(marker)}>
            <SlTag pill variant="neutral" onClick={copy(marker)}>
              <SlIcon name="tag"></SlIcon>
              {marker}
            </SlTag>
          </li>
        )
      })}
    </ul>
  )
}

/* Format a test item parameters */
export const formatParameters = (item: TestItem): JSX.Element | null => {
  if (Object.keys(item.parameters).length === 0) {
    return null
  }
  const key = (name: string) => `${item.id}-param-${name}`
  return (
    <ul>
      {Object.entries(item.parameters).map(([name, value]) => {
        return (
          <li key={key(name)}>
            <SlTag onClick={copy(name)}>
              <SlIcon name="gear"></SlIcon>
              {name} ({value})
            </SlTag>
          </li>
        )
      })}
    </ul>
  )
}

/* Format a test item module name */
export const formatModule = (item: TestItem): JSX.Element | null => {
  if (item.module == null || item.module == "") {
    return null
  }
  return (
    <>
      <SlTag onClick={copy(item.module)}>
        <SlIcon name="box"></SlIcon>
        {item.module}
      </SlTag>
    </>
  )
}

/* Format a test item parent name */
export const formatParent = (item: TestItem): JSX.Element | null => {
  if (item.parent == null || item.parent == "") {
    return null
  }
  return (
    <>
      <SlTag onClick={copy(item.parent)}>
        <SlIcon name="diagram-2"></SlIcon>
        {item.parent}
      </SlTag>
    </>
  )
}

/* Format a test item file name */
export const formatFile = (item: TestItem): JSX.Element | null => {
  if (item.file == null || item.file == "") {
    return null
  }
  return (
    <>
      <SlTag onClick={copy(item.file)}>
        <SlIcon name="filetype-py"></SlIcon>
        {item.file}
      </SlTag>
    </>
  )
}

/* Format a test item node id */
export const formatNodeId = (item: TestItem): JSX.Element => {
  return <SlTag onClick={copy(item.node_id)}>{item.node_id}</SlTag>
}
