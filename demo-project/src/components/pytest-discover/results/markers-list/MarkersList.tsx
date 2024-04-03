import { SlIcon } from "@shoelace-style/shoelace/dist/react"
import SlTag from "@shoelace-style/shoelace/dist/react/tag/index.js"

import { copy } from "../../../../lib/clipboard"
import type { TestCase } from "../../../../types/test_case"
import "./MarkersList.css"

/* Format a test item markers */
export const MarkersList = ({
  item,
}: {
  item: TestCase
}): JSX.Element | null => {
  if (item.markers.length === 0) {
    return null
  }
  const key = (marker: string) => `${item.id}-detail-${marker}`
  const markers = Array.from(new Set(item.markers))
  return (
    <ul className="markers-list">
      {markers.map((marker) => {
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
