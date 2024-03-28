import { SlIcon } from "@shoelace-style/shoelace/dist/react"
import SlTag from "@shoelace-style/shoelace/dist/react/tag/index.js"

import type { TestItem } from "../../types/test_item"

const copy = (value: string) => (e: any) => {
  navigator.clipboard.writeText(value)
  e?.preventDefault()
}

export const formatDoc = (doc: string | null) => {
  if (doc == null || doc == "") {
    return null
  }
  if (doc.length > 100) {
    return doc.slice(0, 100) + "..."
  }
  return doc
}

export const formatMarkers = (item: TestItem) => {
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

export const formatParameters = (item: TestItem) => {
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

export const formatModule = (item: TestItem) => {
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

export const formatParent = (item: TestItem) => {
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

export const formatFile = (item: TestItem) => {
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

export const formatNodeId = (item: TestItem) => {
  return <SlTag onClick={copy(item.node_id)}>{item.node_id}</SlTag>
}

export const formatName = (item: TestItem) => {
  if (item.name == null || item.name == "") {
    return ""
  }
  return item.name.replaceAll("_", " ")
}
