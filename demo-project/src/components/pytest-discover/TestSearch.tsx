import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input.js"
import SlInput, {
  type SlInputEvent,
} from "@shoelace-style/shoelace/dist/react/input/index.js"
import type { SearchOptions, SearchResult } from "minisearch"
import type MiniSearch from "minisearch"
import { useCallback, useEffect, useState } from "react"

import { type IncludedExcludeStatus, newIncludeExcludeFilter } from "../../lib/filter"
import {
  type ResultsRepository,
  newLocalStorageResultsRepository,
} from "../../lib/repository"
import { newSearchEngine } from "../../lib/search"
import { type Statistics, computeStats } from "../../lib/stats"
import type { DiscoveryResult } from "../../types/discovery_result"
import type { TestItem as TestItemProperties } from "../../types/test_item"
import MarkersFilters from "./markers-filters/MarkersFilters"
import { PaginationControl } from "./pagination/PaginationControl"
import { SearchResults } from "./search-results/SearchResults"
import { SettingsBar } from "./settings/SettingsBar"
import { SettingsButton } from "./settings/SettingsButton"
import { TestItemFocused } from "./test-item-focused/TestItemFocused"
import { type TestItemProps } from "./test-item-preview/TestItemPreview"
import { TestStats } from "./test-stats/TestStats"

const sanitize = (item: any): TestItemProperties => {
  const { node_id, ...rest } = item
  return {
    id: node_id,
    node_id: node_id,
    ...rest,
  }
}

const transform = (item: TestItemProperties) => {
  return (onClick: (item: TestItemProperties) => void) => {
    return {
      onClick,
      properties: {
        id: item.node_id,
        node_id: item.node_id,
        name: item.name,
        markers: item.markers,
        parameters: item.parameters,
        file: item.file,
        doc: item.doc,
        module: item.module,
        parent: item.parent,
      },
    }
  }
}

const fromSearchResult = (result: SearchResult): TestItemProperties => {
  return result as unknown as TestItemProperties
}

const doInitialize = (
  result: DiscoveryResult,
  repository: ResultsRepository,
  engine: MiniSearch<TestItemProperties>,
  setItems: (items: TestItemProperties[]) => void,
  setFilteredItems: (items: TestItemProps[]) => void,
  setMarkers: (markers: Set<string>) => void,
  setStats: (stats: Statistics) => void,
  onItemClicked: (item: TestItemProperties) => void,
  filter: (item: TestItemProperties) => boolean,
) => {
  // Save in local storage
  repository.saveResults(result)
  // Gather all items
  const newItems = result.items.map(sanitize)
  const newfilteredItems = newItems.filter(filter)
  // Update state
  setItems(newItems)
  setMarkers(new Set(newItems.map((item) => item.markers).flat()))
  // Initialize search engine
  engine.addAllAsync(newItems).catch((error) => {
    console.error("failed to add items to search engine: ", error)
  })
  // Update state
  setStats(computeStats(newfilteredItems))
  setFilteredItems(newfilteredItems.map((item) => transform(item)(onItemClicked)))
}

const doSearch = (
  items: TestItemProperties[],
  engine: MiniSearch<TestItemProperties>,
  search: string,
  limit: number,
  setOffset: (offset: number) => void,
  setStats: (stats: Statistics) => void,
  setFilteredItems: (items: TestItemProps[]) => void,
  setFocusedItem: (item: TestItemProperties | null) => void,
  filter: (item: TestItemProperties) => boolean,
) => {
  const options = {
    // Boost nodeid
    boost: { id: 2 },
    // Filter results using markers
    filter: (result) => filter(result as unknown as TestItemProperties),
    // Limit results
    limit: limit,
  } as SearchOptions
  // Reset offset
  setOffset(0)
  if (search === "") {
    const newfilteredItems = items.filter(filter)
    setStats(computeStats(newfilteredItems))
    setFilteredItems(newfilteredItems.map((item) => transform(item)(setFocusedItem)))
  } else {
    const newfilteredItems = engine.search(search, options)
    setStats(computeStats(newfilteredItems.map(fromSearchResult)))
    setFilteredItems(
      newfilteredItems.map((item) => transform(fromSearchResult(item))(setFocusedItem)),
    )
  }
}

export interface TestSearchProps {
  result: DiscoveryResult
}

/* A search component for test items. */
export const TestSearch = () => {
  const engine = newSearchEngine()
  const repository = newLocalStorageResultsRepository()
  // Initialize UI state
  const [settingsOpened, setSettingsOpened] = useState<boolean>(false)
  const [focusOpened, setFocusOpened] = useState<boolean>(false)
  const [focusedItem, setFocusedItem] = useState<TestItemProperties | null>(null)
  // Initialize search input
  const [includedMarkers, setIncludedMarkers] = useState<string[]>([])
  const [excludedMarkers, setExcludedMarkers] = useState<string[]>([])
  const [search, setSearch] = useState<string>("")
  const [offset, setOffset] = useState<number>(0)
  // Initialize hidden search input
  const [limit] = useState<number>(5000)
  const [pagination] = useState<number>(20)
  // Initialize state
  const [resultFile, setResultFile] = useState<string>("")
  const [testResult, setTestResult] = useState<DiscoveryResult | null>(null)
  const [markers, setMarkers] = useState<Set<string>>(new Set<string>())
  const [stats, setStats] = useState<Statistics | null>(null)
  const [items, setItems] = useState<TestItemProperties[]>([])
  const [filteredItems, setFilteredItems] = useState<TestItemProps[]>([])
  const [displayedItems, setDisplayedItems] = useState<TestItemProps[]>([])

  // Define function to reset the state
  const reset = () => {
    setItems([])
    setMarkers(new Set<string>())
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
    (item: TestItemProperties): boolean => markerFilter.filter(...item.markers),
    [includedMarkers, excludedMarkers],
  )

  // Define function to get marker status
  const getMarkerStatus = useCallback(
    (marker: string): IncludedExcludeStatus => markerFilter.get(marker),
    [includedMarkers, excludedMarkers],
  )

  // Observe filtered items and set displayed items
  useEffect(() => {
    setDisplayedItems(filteredItems.slice(offset, offset + pagination))
  }, [filteredItems, offset, pagination])

  // Observe test results and update state
  useEffect(() => {
    if (testResult == null) {
      // Lookup from storage
      const resultsFromStorage = repository.loadResults()
      // Reset if no content
      if (resultsFromStorage == null) {
        reset()
        return
      }
      // Set results
      setTestResult(resultsFromStorage)
      return
    }
    // Initialize search engine
    doInitialize(
      testResult,
      repository,
      engine,
      setItems,
      setFilteredItems,
      setMarkers,
      setStats,
      setFocusedItem,
      filterItem,
    )
    // Cleanup search engine on unmount
    return () => {
      engine.removeAll()
    }
  }, [testResult])

  // Observe search terms and update filtered items
  useEffect(() => {
    doSearch(
      items,
      engine,
      search,
      limit,
      setOffset,
      setStats,
      setFilteredItems,
      setFocusedItem,
      filterItem,
    )
  }, [search, limit, filterItem, items, markers])

  // Return UI component
  return (
    <div>
      <SettingsButton onClick={() => setSettingsOpened(true)} />
      <SettingsBar
        opened={settingsOpened}
        close={() => setSettingsOpened(false)}
        filename={resultFile}
        setFilename={setResultFile}
        setDiscoveryResult={setTestResult}
        clear={() => {
          repository.clearResults()
          setResultFile("")
          setTestResult(null)
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
        value={search}
        onSlInput={(event: SlInputEvent) =>
          setSearch((event.target as SlInputElement).value)
        }
      />

      <MarkersFilters
        choices={markers}
        get={getMarkerStatus}
        onClick={(marker: string) => markerFilter.toggle(marker)}
      />

      <SearchResults
        items={displayedItems.map((item) => item.properties)}
        onItemClicked={(item: TestItemProperties) => {
          if (focusOpened) {
            return
          }
          setFocusedItem(item)
          setFocusOpened(true)
        }}
      />

      <PaginationControl
        prev={() => {
          setOffset(Math.max(0, offset - pagination))
        }}
        next={() => {
          setOffset(Math.min(filteredItems.length - pagination, offset + pagination))
        }}
      />
    </div>
  )
}

export default TestSearch
