import SlCard from "@shoelace-style/shoelace/dist/react/card/index.js"
import SlTooltip from "@shoelace-style/shoelace/dist/react/tooltip/index.js"

import type { TestItem } from "../../../types/test_item"
import {
  formatFile,
  formatMarkers,
  sanitizeName,
  truncateDescription,
} from "../format.tsx"
import "./TestItemPreview.css"

interface TestItemPreviewProps {
  onClick: (props: TestItem) => void
  properties: TestItem
}

/* A test item collected by pytest */
export const TestItemPreview = (item: TestItemPreviewProps) => {
  return (
    <SlTooltip content={item.properties.name}>
      <SlCard
        key={item.properties.node_id}
        onClick={() => {
          item.onClick(item.properties)
        }}
      >
        <h3>{sanitizeName(item.properties)}</h3>
        {formatMarkers(item.properties)}
        <p>{formatFile(item.properties)}</p>
        {truncateDescription(item.properties.doc)}
      </SlCard>
    </SlTooltip>
  )
}

export default TestItemPreview
