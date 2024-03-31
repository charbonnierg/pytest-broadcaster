import { SlIcon } from "@shoelace-style/shoelace/dist/react"
import SlTag from "@shoelace-style/shoelace/dist/react/tag/index.js"

import { copy } from "../../../../lib/clipboard"
import type { TestItem } from "../../../../types/test_item"
import "./MarkersList.css"

/* Format a test item markers */
export const MarkersList = ({
  item,
}: {
  item: TestItem
}): JSX.Element | null => {
  if (item.markers.length === 0) {
    return null
  }
  const key = (marker: string) => `${item.id}-detail-${marker}`
  return (
    <ul className="markers-list">
      {item.markers.map((marker) => {
        return (
          <li key={key(marker)}>
            <SlTag
              pill
              variant="neutral"
              className="marker"
              onClick={copy(marker)}
            >
              <SlIcon name="bookmark-plus"></SlIcon>
              {marker}
            </SlTag>
          </li>
        )
      })}
    </ul>
  )
}
