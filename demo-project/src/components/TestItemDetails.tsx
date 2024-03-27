import { SlIcon } from "@shoelace-style/shoelace/dist/react"
import SlTag from "@shoelace-style/shoelace/dist/react/tag/index.js"

import type { TestItem as TestItemProperties } from "../types/test_item"
import "./TestItemDetails.css"

/* Properties of a test item collected by pytest */
export interface TestItemDetailsProps {
  properties: TestItemProperties
}

const copy = (value: string) => (e: any) => {
  navigator.clipboard.writeText(value)
  e?.preventDefault()
}

const formatMarkers = (item: TestItemProperties) => {
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

const formatParameters = (item: TestItemProperties) => {
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

const formatModule = (item: TestItemProperties) => {
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

const formatParent = (item: TestItemProperties) => {
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

const formatFile = (item: TestItemProperties) => {
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

const formatName = (item: TestItemProperties) => {
  if (item.name == null || item.name == "") {
    return ""
  }
  return item.name.replaceAll("_", " ")
}

export const TestItemDetails = (item: TestItemDetailsProps) => {
  return (
    <>
      <h2>
        <SlTag onClick={copy(item.properties.node_id)}>{item.properties.node_id}</SlTag>
      </h2>
      <h3>{formatName(item.properties)}</h3>
      <p>{item.properties.name}</p>
      <div>
        <h3>Metadata</h3>
        <table>
          <tbody>
            <tr>
              <td>{formatMarkers(item.properties)}</td>
            </tr>
            <tr>
              <td>{formatParameters(item.properties)}</td>
            </tr>
            <tr>
              <td>{formatFile(item.properties)}</td>
            </tr>
            <tr>
              <td>{formatModule(item.properties)}</td>
            </tr>
            <tr>
              <td>{formatParent(item.properties)}</td>
            </tr>
          </tbody>
        </table>
        <h3>Description</h3>
        <p>{item.properties.doc}</p>
      </div>
    </>
  )
}

export default TestItemDetails
