import SlCard from "@shoelace-style/shoelace/dist/react/card/index.js"
import SlCopyButton from "@shoelace-style/shoelace/dist/react/copy-button/index.js"
import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js"
import SlTag from "@shoelace-style/shoelace/dist/react/tag/index.js"
import SlTooltip from "@shoelace-style/shoelace/dist/react/tooltip/index.js"

import type { TestItem as TestItemProperties } from "../types/test_item"
import "./TestItem.css"
import { formatFile, formatMarkers, formatName } from "./TestItemDetails"

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
  return (
    <SlTooltip content={formatName(item.properties)}>
      <SlCard
        key={item.properties.node_id}
        onClick={() => {
          item.onClick(item.properties)
        }}
      >
        <h3>{item.properties.name}</h3>
        {formatMarkers(item.properties)}
        <p>{formatFile(item.properties)}</p>
        {formatDoc(item.properties.doc)}
      </SlCard>
    </SlTooltip>
  )
}

export default TestItem
