import { useCallback, useState } from "react"

import {
  type IncludedExcludeStatus,
  newIncludeExcludeFilter,
} from "../lib/filter"
import type { TestItem } from "../types/test_item"

export const useMarkersFilters = () => {
  const [values, set] = useState<string[]>([])
  const [includedMarkers, setIncludedMarkers] = useState<string[]>([])
  const [excludedMarkers, setExcludedMarkers] = useState<string[]>([])
  const markerFilter = newIncludeExcludeFilter({
    setInclude: setIncludedMarkers,
    setExclude: setExcludedMarkers,
  })
  const filter = useCallback(
    (item: TestItem): boolean =>
      markerFilter.filter(includedMarkers, excludedMarkers, ...item.markers),
    [includedMarkers, excludedMarkers],
  )
  // Define function to get marker status
  const get = useCallback(
    (marker: string): IncludedExcludeStatus =>
      markerFilter.get(includedMarkers, excludedMarkers, marker),
    [includedMarkers, excludedMarkers],
  )
  const toggle = useCallback(
    (marker: string) =>
      markerFilter.toggle(includedMarkers, excludedMarkers, marker),
    [includedMarkers, excludedMarkers],
  )
  return { filter, get, set, toggle, values }
}
