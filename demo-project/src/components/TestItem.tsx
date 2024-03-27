import SlCard from "@shoelace-style/shoelace/dist/react/card/index.js"
import SlCopyButton from "@shoelace-style/shoelace/dist/react/copy-button/index.js"
import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js"
import SlTag from "@shoelace-style/shoelace/dist/react/tag/index.js"
import SlTooltip from "@shoelace-style/shoelace/dist/react/tooltip/index.js"

import type { TestItem as TestItemProperties } from "../types/test_item"
import "./TestItem.css"

/* Properties of a test item collected by pytest */
export interface TestItemProps {
  onClick: (props: TestItemProperties) => void
  properties: TestItemProperties
}

const formatDoc = (doc: string | null) => {
  if (doc == null || doc == "") {
    return null
  }
  if (doc.length > 100) {
    return doc.slice(0, 100) + "..."
  }
  return doc
}

/* A test item collected by pytest */
export const TestItem = (item: TestItemProps) => {
  const key = item.properties.node_id
  const markerKey = (marker: string) => `${item.properties.id}-${marker}`
  return (
    <SlTooltip content={item.properties.name}>
      <SlCard
        key={key}
        onClick={(e) => {
          item.onClick(item.properties)
        }}
      >
        <h3>{item.properties.name}</h3>
        {item.properties.markers.map((marker) => {
          return (
            <SlTag key={markerKey(marker)} itemType="info" pill className="left-margin">
              {marker}
            </SlTag>
          )
        })}
        <p>
          <span>
            <SlTag>
              {item.properties.file}{" "}
              <SlCopyButton
                value={item.properties.file || ""}
                disabled={item.properties.file === ""}
              >
                <SlIcon slot="copy-icon" name="clipboard"></SlIcon>
                <SlIcon slot="success-icon" name="clipboard-check"></SlIcon>
                <SlIcon slot="error-icon" name="clipboard-x"></SlIcon>
              </SlCopyButton>
            </SlTag>
          </span>
        </p>
        {formatDoc(item.properties.doc)}
      </SlCard>
    </SlTooltip>
  )
}

export default TestItem
