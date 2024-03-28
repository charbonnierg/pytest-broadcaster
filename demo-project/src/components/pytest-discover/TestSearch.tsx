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

import { newIncludeExcludeFilter } from "../../lib/filter"
import { newSearchEngine } from "../../lib/search"
import { type Statistics, computeStats } from "../../lib/stats"
import { readJSONInto as readUploadedJSON } from "../../lib/upload"
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
  const [drawerOpened, setDrawerOpened] = useState<boolean>(false)
  const [dialogOpened, setDialogOpened] = useState<boolean>(false)
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

  // Define function to reset the state
  const reset = () => {
    setItems([])
    setAllMarkers(new Set<string>())
    setStats(null)
    setFilteredItems([])
    setDisplayedItems([])
    setDrawerOpened(true)
  }

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

  // Define callback to react to marker selection
  const onMarkerSelected = (marker: string) => markerFilter.toggle(marker)

  // Define callback to react to search input
  // Cast element, this is required as per the official doc
  // https://shoelace.style/frameworks/react#event-handling
  const onSearchTermsUpdated = (event: SlInputEvent) =>
    setSearch((event.target as SlInputElement).value)

  // Define callback to react to item clicked and open dialog
  const onItemClicked = (item: TestItemProperties) => {
    if (dialogOpened) {
      return
    }
    setFocusedItem(item)
    setDialogOpened(true)
  }

  // Observe filtered items and set displayed items
  useEffect(() => {
    setDisplayedItems(filteredItems.slice(offset, offset + pagination))
  }, [filteredItems, offset, pagination])

  // Observe test file and set test results
  useEffect(() => {
    const el = uploadFileRef.current as HTMLInputElement | null
    readUploadedJSON(el, setTestResult)
  }, [resultFile])

  // Observe test results and update state
  useEffect(() => {
    if (testResult == null) {
      // Lookup in local storage
      const content = localStorage.getItem("testResult")
      // Reset if no content
      if (content == null) {
        reset()
        return
      }
      // Parse and set results
      const result = JSON.parse(content)
      setTestResult(result)
      return
    }
    // Save in local storage
    localStorage.setItem("testResult", JSON.stringify(testResult))
    // Gather all items
    const newItems = testResult.items.map(sanitize)
    const newMarkers = new Set(newItems.map((item) => item.markers).flat())
    const newfilteredItems = newItems.filter(filterAccordingToMarkerFilter)
    // Update state
    setItems(newItems)
    // Initialize search engine
    engine.addAllAsync(newItems).catch((error) => {
      console.error("failed to add items to search engine: ", error)
    })
    // Update state
    setAllMarkers(newMarkers)
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
      {/* The drawer */}
      <SlDrawer
        label="Settings"
        open={drawerOpened}
        onSlRequestClose={(e) => {
          if (e.detail.source === "overlay") {
            e.preventDefault()
          }
        }}
        onSlAfterHide={() => setDrawerOpened(false)}
      >
        <form>
          <input
            ref={uploadFileRef}
            type="file"
            id="file-upload"
            value={resultFile}
            onChange={(evt) => {
              setResultFile(evt.target.value)
            }}
          />
        </form>
        <SlButton
          variant="default"
          onClick={() => {
            const el = uploadFileRef.current
            if (el == null) {
              return
            }
            el.click()
          }}
        >
          Upload file
        </SlButton>
        <SlButton
          variant="default"
          onClick={() => {
            localStorage.removeItem("testResult")
            setResultFile("")
            setTestResult(null)
          }}
        >
          Clear all
        </SlButton>
        <SlButton variant="default" slot="footer" onClick={() => setDrawerOpened(false)}>
          Close
        </SlButton>
      </SlDrawer>

      {/* The dialog */}
      {focusedItem && (
        <SlDrawer
          no-header
          className="focused-item"
          placement="bottom"
          open={dialogOpened}
          onSlRequestClose={(e) => {
            if (e.detail.source === "overlay") {
              e.preventDefault()
            }
          }}
          onSlAfterHide={() => setDialogOpened(false)}
        >
          <TestItemDetails properties={focusedItem}></TestItemDetails>
          <SlButton
            className="close-focused-item"
            variant="default"
            onClick={() => setDialogOpened(false)}
          >
            Close
          </SlButton>
        </SlDrawer>
      )}

      {/* The floating button */}
      <SlButton
        className="floating-button"
        aria-label="Settings"
        variant="default"
        onClick={() => setDrawerOpened(true)}
      >
        Settings
      </SlButton>

      {/* The statistics */}
      {stats && <TestStats stats={stats} />}

      {/* The input */}
      <SlInput
        helpText="Enter some text"
        value={search}
        onSlInput={onSearchTermsUpdated}
      />

      {/* The filter */}
      <div className="tags-selection">
        {Array.from(allMarkers).map((marker) => {
          return (
            <SlTag
              key={marker}
              pill
              variant={
                includedMarkers.includes(marker)
                  ? "success"
                  : excludedMarkers.includes(marker)
                    ? "danger"
                    : "neutral"
              }
              onClick={() => onMarkerSelected(marker)}
              data-state={
                includedMarkers.includes(marker)
                  ? "selected"
                  : excludedMarkers.includes(marker)
                    ? "excluded"
                    : ""
              }
            >
              <SlIcon name="tag"></SlIcon>
              {marker}
            </SlTag>
          )
        })}
      </div>

      {/* The results */}
      <ul role="list" className="card-grid">
        {displayedItems.map((item) => (
          <TestItem key={item.properties.node_id} {...item} onClick={onItemClicked} />
        ))}
        <div></div>
      </ul>
      {/* Controls */}
      <div className="control-buttons">
        <SlButton
          variant="default"
          onClick={() => {
            setOffset(Math.max(0, offset - pagination))
          }}
        >
          Prev
        </SlButton>
        <SlButton
          variant="default"
          onClick={() => {
            setOffset(Math.min(filteredItems.length - pagination, offset + pagination))
          }}
        >
          Next
        </SlButton>
      </div>
    </div>
  )
}

export default TestSearch
