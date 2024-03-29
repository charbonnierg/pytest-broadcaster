import { useCallback, useState } from "react"

import { type IncludedExcludeStatus, newIncludeExcludeFilter } from "../lib/filter"
import type { TestItem } from "../types/test_item"

export const useMarkersFilters = () => {
  const [values, set] = useState<string[]>([])
  const [includedMarkers, setIncludedMarkers] = useState<string[]>([])
  const [excludedMarkers, setExcludedMarkers] = useState<string[]>([])
  const markerFilter = newIncludeExcludeFilter({
    getIncluded: () => includedMarkers,
    getExcluded: () => excludedMarkers,
    setInclude: setIncludedMarkers,
    setExclude: setExcludedMarkers,
  })
  const filter = useCallback(
    (item: TestItem): boolean => markerFilter.filter(...item.markers),
    [includedMarkers, excludedMarkers],
  )
  // Define function to get marker status
  const get = useCallback(
    (marker: string): IncludedExcludeStatus => markerFilter.get(marker),
    [includedMarkers, excludedMarkers],
  )
  return { filter, get, values, set, toggle: markerFilter.toggle }
}
