import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input.js"
import SlInput, {
  type SlInputEvent,
} from "@shoelace-style/shoelace/dist/react/input/index.js"
import type MiniSearch from "minisearch"
import { useCallback, useEffect, useState } from "react"

import { type IncludedExcludeStatus, newIncludeExcludeFilter } from "../../lib/filter"
import {
  type ResultsRepository,
  newLocalStorageResultsRepository,
} from "../../lib/repository"
import { newSearchEngine, sanitize, search } from "../../lib/search"
import { type Statistics, computeStats } from "../../lib/stats"
import type { DiscoveryResult } from "../../types/discovery_result"
import type { TestItem } from "../../types/test_item"
import MarkersFilters from "./markers-filters/MarkersFilters"
import { PaginationControl } from "./pagination/PaginationControl"
import { SearchResults } from "./search-results/SearchResults"
import { SettingsBar } from "./settings/SettingsBar"
import { SettingsButton } from "./settings/SettingsButton"
import { TestItemFocused } from "./test-item-focused/TestItemFocused"
import { TestStats } from "./test-stats/TestStats"

const doInitialize = (
  result: DiscoveryResult,
  repository: ResultsRepository,
  engine: MiniSearch<TestItem>,
  setItems: (items: TestItem[]) => void,
  setFilteredItems: (items: TestItem[]) => void,
  setMarkers: (markers: string[]) => void,
  setStats: (stats: Statistics) => void,
  filter: (item: TestItem) => boolean,
) => {
  // Save in local storage
  repository.saveResults(result)
  // Gather all items
  const newItems = result.items.map(sanitize)
  const newfilteredItems = newItems.filter(filter)
  // Update state
  setItems(newItems)
  setMarkers(Array.from(new Set(newItems.map((item) => item.markers).flat())))
  // Initialize search engine
  engine.addAllAsync(newItems).catch((error) => {
    console.error("failed to add items to search engine: ", error)
  })
  // Update state
  setStats(computeStats(newfilteredItems))
  setFilteredItems(newfilteredItems)
}

const doSearch = (
  items: TestItem[],
  engine: MiniSearch<TestItem>,
  searchTerms: string,
  limit: number,
  setOffset: (offset: number) => void,
  setStats: (stats: Statistics) => void,
  setFilteredItems: (items: TestItem[]) => void,
  filter: (item: TestItem) => boolean,
) => {
  setOffset(0)
  if (searchTerms === "") {
    const newfilteredItems = items.filter(filter)
    setStats(computeStats(newfilteredItems))
    setFilteredItems(newfilteredItems)
    return
  }
  const newfilteredItems = search(engine, searchTerms, {
    boost: { node_id: 2 },
    filter: filter,
    limit: limit,
  })
  setStats(computeStats(newfilteredItems))
  setFilteredItems(newfilteredItems)
}

export interface TestSearchProps {
  result: DiscoveryResult
}

/* A search component for test items. */
export const TestSearch = () => {
  const [engine] = useState(newSearchEngine())
  const repository = newLocalStorageResultsRepository()
  // Initialize UI state
  const [settingsOpened, setSettingsOpened] = useState<boolean>(false)
  const [focusOpened, setFocusOpened] = useState<boolean>(false)
  const [focusedItem, setFocusedItem] = useState<TestItem | null>(null)
  // Initialize markers state
  const [markers, setMarkers] = useState<string[]>([])
  const [includedMarkers, setIncludedMarkers] = useState<string[]>([])
  const [excludedMarkers, setExcludedMarkers] = useState<string[]>([])
  // Initialze search input state
  const [searchTerms, setSearchTerms] = useState<string>("")
  const [paginationOffset, setPaginationOffset] = useState<number>(0)
  const [searchLimit] = useState<number>(5000)
  const [paginationPageSize] = useState<number>(20)
  // Initialize settings state
  const [resultFilename, setResultFilename] = useState<string | null>(null)
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResult | null>(null)
  // Initialize search result state
  const [stats, setStats] = useState<Statistics | null>(null)
  const [items, setItems] = useState<TestItem[]>([])
  const [filteredItems, setFilteredItems] = useState<TestItem[]>([])
  const [displayedItems, setDisplayedItems] = useState<TestItem[]>([])

  // Define function to reset the state
  const reset = () => {
    setItems([])
    setMarkers([])
    setStats(null)
    setFilteredItems([])
    setDisplayedItems([])
    setSettingsOpened(true)
  }

  // Create a new filter for markers
  const markerFilter = newIncludeExcludeFilter({
    getIncluded: () => includedMarkers,
    getExcluded: () => excludedMarkers,
    setInclude: setIncludedMarkers,
    setExclude: setExcludedMarkers,
  })

  // Define function to filter items based on markers
  const filterItem = useCallback(
    (item: TestItem): boolean => markerFilter.filter(...item.markers),
    [includedMarkers, excludedMarkers],
  )

  // Define function to get marker status
  const getMarkerStatus = useCallback(
    (marker: string): IncludedExcludeStatus => markerFilter.get(marker),
    [includedMarkers, excludedMarkers],
  )

  // Observe filtered items and set displayed items
  useEffect(() => {
    setDisplayedItems(
      filteredItems.slice(paginationOffset, paginationOffset + paginationPageSize),
    )
  }, [filteredItems, paginationOffset, paginationPageSize])

  // Observe test results and update state
  useEffect(() => {
    if (discoveryResult == null) {
      // Lookup from storage
      const resultsFromStorage = repository.loadResults()
      // Reset if no content
      if (resultsFromStorage == null) {
        reset()
        return
      }
      // Set results
      setDiscoveryResult(resultsFromStorage)
      return
    }
    // Initialize search engine
    doInitialize(
      discoveryResult,
      repository,
      engine,
      setItems,
      setFilteredItems,
      setMarkers,
      setStats,
      filterItem,
    )
    // Cleanup search engine on unmount
    return () => {
      engine.removeAll()
    }
  }, [discoveryResult])

  // Observe search terms and update filtered items
  useEffect(() => {
    doSearch(
      items,
      engine,
      searchTerms,
      searchLimit,
      setPaginationOffset,
      setStats,
      setFilteredItems,
      filterItem,
    )
  }, [searchTerms, searchLimit, filterItem, items, markers])

  // Return UI component
  return (
    <div>
      <SettingsButton onClick={() => setSettingsOpened(true)} />
      <SettingsBar
        opened={settingsOpened}
        close={() => setSettingsOpened(false)}
        filename={resultFilename}
        setFilename={setResultFilename}
        setDiscoveryResult={setDiscoveryResult}
        clear={() => {
          repository.clearResults()
          setResultFilename(null)
          setDiscoveryResult(null)
        }}
      />
      <TestItemFocused
        opened={focusOpened}
        close={() => setFocusOpened(false)}
        item={focusedItem}
      />

      <TestStats stats={stats} />

      <SlInput
        helpText="Enter some text"
        value={searchTerms}
        onSlInput={(event: SlInputEvent) =>
          setSearchTerms((event.target as SlInputElement).value)
        }
      />

      <MarkersFilters
        choices={markers}
        get={getMarkerStatus}
        onClick={(marker: string) => markerFilter.toggle(marker)}
      />

      <SearchResults
        items={displayedItems}
        onItemClicked={(item: TestItem) => {
          if (focusOpened) {
            return
          }
          setFocusedItem(item)
          setFocusOpened(true)
        }}
      />

      <PaginationControl
        prev={() => {
          setPaginationOffset(Math.max(0, paginationOffset - paginationPageSize))
        }}
        next={() => {
          setPaginationOffset(
            Math.min(
              filteredItems.length - paginationPageSize,
              paginationOffset + paginationPageSize,
            ),
          )
        }}
      />
    </div>
  )
}

export default TestSearch
