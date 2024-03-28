import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js"
import SlTag from "@shoelace-style/shoelace/dist/react/tag/index.js"

import type { IncludedExcludeStatus } from "../../../lib/filter"
import "./MarkersFilters.css"

export const MarkersFilters = ({
  choices,
  get,
  onClick,
}: {
  choices: string[]
  get: (marker: string) => IncludedExcludeStatus
  onClick: (marker: string) => void
}) => {
  const variant = (marker: string) => {
    const status = get(marker)
    if (status === "included") {
      return "success"
    }
    if (status === "excluded") {
      return "danger"
    }
    return "neutral"
  }
  return (
    <div className="tags-selection">
      {Array.from(choices).map((marker) => {
        return (
          <SlTag
            key={marker}
            pill
            variant={variant(marker)}
            onClick={() => onClick(marker)}
            data-state={get(marker)}
          >
            <SlIcon name="tag"></SlIcon>
            {marker}
          </SlTag>
        )
      })}
    </div>
  )
}

export default MarkersFilters
