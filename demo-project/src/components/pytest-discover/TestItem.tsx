import SlCard from "@shoelace-style/shoelace/dist/react/card/index.js"
import SlTooltip from "@shoelace-style/shoelace/dist/react/tooltip/index.js"

import type { TestItem as TestItemProperties } from "../../types/test_item"
import "./TestItem.css"
import {
  formatFile,
  formatMarkers,
  sanitizeName,
  truncateDescription,
} from "./format.tsx"

export interface TestItemProps {
  onClick: (props: TestItemProperties) => void
  properties: TestItemProperties
}

/* A test item collected by pytest */
export const TestItem = (item: TestItemProps) => {
  return (
    <SlTooltip content={sanitizeName(item.properties)}>
      <SlCard
        key={item.properties.node_id}
        onClick={() => {
          item.onClick(item.properties)
        }}
      >
        <h3>{item.properties.name}</h3>
        {formatMarkers(item.properties)}
        <p>{formatFile(item.properties)}</p>
        {truncateDescription(item.properties.doc)}
      </SlCard>
    </SlTooltip>
  )
}

export default TestItem