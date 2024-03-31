import type { IncludedExcludeStatus as IncludeExcludeStatus } from "../../../../lib/filter"
import { FilterBadge } from "../../../widgets/filter-badge/FilterBadge"
import "./MarkersFilters.css"

interface MarkersFiltersProps {
  choices: string[]
  get: (marker: string) => IncludeExcludeStatus
  onClick: (marker: string) => void
}

export const MarkersFilters = ({
  choices,
  get,
  onClick,
}: MarkersFiltersProps) => {
  return (
    <div className="markers-filters">
      {Array.from(choices).map((marker) => (
        <FilterBadge
          key={marker}
          value={marker}
          status={get(marker)}
          onClick={onClick}
        />
      ))}
    </div>
  )
}

export default MarkersFilters
