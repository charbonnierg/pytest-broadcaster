import type { IncludedExcludeStatus } from "../../../lib/filter"
import MarkersFilters from "./markers-filters/MarkersFilters"
import { SearchBar } from "./search-bar/SearchBar"

export const SearchInput = ({
  terms,
  setTerms,
  markers,
}: {
  terms: string
  setTerms: (terms: string) => void
  markers: {
    values: string[]
    get: (marker: string) => IncludedExcludeStatus
    toggle: (marker: string) => void
  }
}) => {
  return (
    <div>
      <SearchBar terms={terms} setTerms={setTerms}></SearchBar>
      <MarkersFilters
        choices={markers.values}
        get={markers.get}
        onClick={(marker: string) => markers.toggle(marker)}
      />
    </div>
  )
}
