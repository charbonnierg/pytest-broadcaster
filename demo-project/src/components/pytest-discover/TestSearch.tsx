import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input.js"
import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js"
import SlDrawer from "@shoelace-style/shoelace/dist/react/drawer/index.js"
import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js"
import SlInput, {
  type SlInputEvent,
} from "@shoelace-style/shoelace/dist/react/input/index.js"
import SlTag from "@shoelace-style/shoelace/dist/react/tag/index.js"
import type { SearchOptions, SearchResult } from "minisearch"
import type MiniSearch from "minisearch"
import { useCallback, useEffect, useRef, useState } from "react"

import { type IncludedExcludeStatus, newIncludeExcludeFilter } from "../../lib/filter"
import { newLocalStorageResultsRepository } from "../../lib/repository"
import { newSearchEngine } from "../../lib/search"
import { type Statistics, computeStats } from "../../lib/stats"
import { newJSONReader } from "../../lib/upload"
import type { DiscoveryResult } from "../../types/discovery_result"
import type { TestItem as TestItemProperties } from "../../types/test_item"
import TestItem, { type TestItemProps } from "./TestItem"
import TestItemDetails from "./TestItemDetails"
import "./TestSearch.css"
import { TestStats } from "./TestStats"

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

const SettingsButton = ({ onClick }: { onClick: () => void }) => (
  <SlButton
    className="floating-button"
    aria-label="Settings"
    variant="default"
    onClick={onClick}
  >
    Settings
  </SlButton>
)

const MarkersFilters = ({
  choices,
  get,
  onClick,
}: {
  choices: Set<string>
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

const PaginationControl = ({ prev, next }: { prev: () => void; next: () => void }) => (
  <div className="control-buttons">
    <SlButton variant="default" onClick={prev}>
      Prev
    </SlButton>
    <SlButton variant="default" onClick={next}>
      Next
    </SlButton>
  </div>
)

const FocusedItem = ({
  opened,
  close,
  item,
}: {
  opened: boolean
  close: () => void
  item: TestItemProperties
}) => (
  <SlDrawer
    no-header
    className="focused-item"
    placement="bottom"
    open={opened}
    onSlRequestClose={(e) => {
      if (e.detail.source === "overlay") {
        e.preventDefault()
      }
    }}
    onSlAfterHide={close}
  >
    <TestItemDetails properties={item}></TestItemDetails>
    <SlButton className="close-focused-item" variant="default" onClick={close}>
      Close
    </SlButton>
  </SlDrawer>
)

const SettingsBar = ({
  opened,
  close,
  clear,
  filename,
  setFilename,
}: {
  opened: boolean
  close: () => void
  clear: () => void
  filename: string
  setFilename: (filename: string) => void
}) => {
  const ref = useRef<HTMLInputElement | null>(null)
  return (
    <SlDrawer
      label="Settings"
      open={opened}
      onSlRequestClose={(e) => {
        if (e.detail.source === "overlay") {
          e.preventDefault()
        }
      }}
      onSlAfterHide={close}
    >
      <form>
        <input
          ref={ref}
          type="file"
          id="file-upload"
          value={filename}
          onChange={(evt) => {
            setFilename(evt.target.value)
          }}
        />
      </form>
      <SlButton
        variant="default"
        onClick={() => {
          const el = ref.current
          if (el == null) {
            return
          }
          el.click()
        }}
      >
        Upload file
      </SlButton>
      <SlButton variant="default" onClick={clear}>
        Clear all
      </SlButton>
      <SlButton variant="default" slot="footer" onClick={close}>
        Close
      </SlButton>
    </SlDrawer>
  )
}

export interface TestSearchProps {
  result: DiscoveryResult
}

/* A search component for test items

Key Features:

- Search test using Full text search
- Filter test using markers
- Display test items
- Display more information in a drawer on click
- Close drawer on click outside
*/
export const TestSearch = () => {
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
  const [limit, setLimit] = useState<number>(5000)
  const [pagination, setPagination] = useState<number>(20)
  // Initialize state
  const uploadFileRef = useRef<HTMLInputElement | null>(null)
  const [engine, setEngine] = useState<MiniSearch<TestItemProperties>>(newSearchEngine())
  const [resultFile, setResultFile] = useState<string>("")
  const [testResult, setTestResult] = useState<DiscoveryResult | null>(null)
  const [allMarkers, setAllMarkers] = useState<Set<string>>(new Set<string>())
  const [stats, setStats] = useState<Statistics | null>(null)
  const [items, setItems] = useState<TestItemProperties[]>([])
  const [filteredItems, setFilteredItems] = useState<TestItemProps[]>([])
  // We only display a subset of items
  const [displayedItems, setDisplayedItems] = useState<TestItemProps[]>([])

  const repository = newLocalStorageResultsRepository()

  // Define function to reset the state
  const reset = () => {
    setItems([])
    setAllMarkers(new Set<string>())
    setStats(null)
    setFilteredItems([])
    setDisplayedItems([])
    setSettingsOpened(true)
  }

  // Define function to read uploaded file
  const readResultsFile = newJSONReader(setTestResult)
  // Create a new filter for markers
  const markerFilter = newIncludeExcludeFilter({
    getIncluded: () => includedMarkers,
    getExcluded: () => excludedMarkers,
    setInclude: setIncludedMarkers,
    setExclude: setExcludedMarkers,
  })

  // Define function to filter items based on markers
  const filterAccordingToMarkerFilter = useCallback(
    (item: TestItemProperties): boolean => markerFilter.filter(...item.markers),
    [includedMarkers, excludedMarkers],
  )
  // Define function to get marker status
  const getMarkerStatus = useCallback(
    (marker: string): IncludedExcludeStatus => markerFilter.get(marker),
    [includedMarkers, excludedMarkers],
  )
  // Define callback to react to marker selection
  const onMarkerSelected = (marker: string) => markerFilter.toggle(marker)

  // Define callback to react to search input
  // Cast element, this is required as per the official doc
  // https://shoelace.style/frameworks/react#event-handling
  const onSearchTermsUpdated = (event: SlInputEvent) =>
    setSearch((event.target as SlInputElement).value)

  // Define callback to react to item clicked and open dialog
  const onItemClicked = (item: TestItemProperties) => {
    if (focusOpened) {
      return
    }
    setFocusedItem(item)
    setFocusOpened(true)
  }

  // Observe filtered items and set displayed items
  useEffect(() => {
    setDisplayedItems(filteredItems.slice(offset, offset + pagination))
  }, [filteredItems, offset, pagination])

  // Observe test file and set test results
  useEffect(() => readResultsFile(uploadFileRef.current), [resultFile])

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
    // Save in local storage
    repository.saveResults(testResult)
    // Gather all items
    const newItems = testResult.items.map(sanitize)
    const newfilteredItems = newItems.filter(filterAccordingToMarkerFilter)
    // Update state
    setItems(newItems)
    setAllMarkers(new Set(newItems.map((item) => item.markers).flat()))
    // Initialize search engine
    engine.addAllAsync(newItems).catch((error) => {
      console.error("failed to add items to search engine: ", error)
    })
    // Update state
    setStats(computeStats(newfilteredItems))
    setFilteredItems(newfilteredItems.map((item) => transform(item)(setFocusedItem)))
    // Cleanup search engine on unmount
    return () => {
      engine.removeAll(newItems)
    }
  }, [testResult, engine])

  // Observe search terms and update filtered items
  useEffect(() => {
    const options = {
      // Boost nodeid
      boost: { id: 2 },
      // Filter results using markers
      filter: (result) =>
        filterAccordingToMarkerFilter(result as unknown as TestItemProperties),
      // Limit results
      limit: limit,
    } as SearchOptions
    // Reset offset
    setOffset(0)
    if (search === "") {
      const newfilteredItems = items.filter(filterAccordingToMarkerFilter)
      setStats(computeStats(newfilteredItems))
      setFilteredItems(newfilteredItems.map((item) => transform(item)(setFocusedItem)))
    } else {
      const newfilteredItems = engine.search(search, options)
      setStats(computeStats(newfilteredItems.map(fromSearchResult)))
      setFilteredItems(
        newfilteredItems.map((item) =>
          transform(fromSearchResult(item))(setFocusedItem),
        ),
      )
    }
  }, [search, limit, filterAccordingToMarkerFilter, items, allMarkers, engine])

  // Return UI component
  return (
    <div>
      {/* The settings sidebar */}
      <SettingsBar
        opened={settingsOpened}
        close={() => setSettingsOpened(false)}
        filename={resultFile}
        setFilename={setResultFile}
        clear={() => {
          repository.clearResults()
          setResultFile("")
          setTestResult(null)
        }}
      />
      {/* The focused item */}
      {focusedItem && (
        <FocusedItem
          opened={focusOpened}
          close={() => setFocusOpened(false)}
          item={focusedItem}
        />
      )}

      {/* The floating button */}
      <SettingsButton onClick={() => setSettingsOpened(true)} />

      {/* The statistics */}
      {stats && <TestStats stats={stats} />}

      {/* The input */}
      <SlInput
        helpText="Enter some text"
        value={search}
        onSlInput={onSearchTermsUpdated}
      />
      {/* The filter */}
      <MarkersFilters
        {...{ choices: allMarkers, get: getMarkerStatus, onClick: onMarkerSelected }}
      />
      {/* The results */}
      <ul role="list" className="card-grid">
        {displayedItems.map((item) => (
          <TestItem key={item.properties.node_id} {...item} onClick={onItemClicked} />
        ))}
        <div></div>
      </ul>
      {/* Controls */}
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
