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

import { newSearchEngine } from "../lib/search"
import type { DiscoveryResult } from "../types/discovery_result"
import type { TestItem as TestItemProperties } from "../types/test_item"
import TestItem, { type TestItemProps } from "./TestItem"
import TestItemDetails from "./TestItemDetails"
import "./TestSearch.css"
import { TestStats, type TestStatsProps } from "./TestStats"

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

const computeStats = (items: TestItemProperties[]): TestStatsProps => {
  const stats = {
    totalCount: items.length,
    totalMarkersCount: Array.from(new Set(items.map((item) => item.markers).flat()))
      .length,
    totalFiles: Array.from(new Set(items.map((item) => item.file))).filter(
      (file) => file !== null,
    ).length,
    totalModules: Array.from(new Set(items.map((item) => item.module))).filter(
      (module) => module !== null,
    ).length,
    totalSuites: Array.from(
      new Set(items.map((item) => item.parent || item.module || item.file)),
    ).length,
  }
  return stats
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
  const [stats, setStats] = useState<TestStatsProps | null>(null)
  const [items, setItems] = useState<TestItemProperties[]>([])
  const [filteredItems, setFilteredItems] = useState<TestItemProps[]>([])
  // We only display a subset of items
  const [displayedItems, setDisplayedItems] = useState<TestItemProps[]>([])

  // Define callback to react to marker selection
  const onMarkerSelected = (marker: string) => {
    // Marker is neither included or excluded
    // So we include it
    if (!includedMarkers.includes(marker) && !excludedMarkers.includes(marker)) {
      setIncludedMarkers([...includedMarkers, marker])
    }
    // Marker is included so we exclude it
    else if (includedMarkers.includes(marker)) {
      setIncludedMarkers(includedMarkers.filter((m) => m !== marker))
      setExcludedMarkers([...excludedMarkers, marker])
    }
    // Marker is exclude, so we remove it from exclusion
    else {
      setExcludedMarkers(excludedMarkers.filter((m) => m !== marker))
    }
  }

  // Define callback to react to search input
  const onSearchTermsUpdated = (event: SlInputEvent) => {
    // Get element, this is required as per the official doc
    // https://shoelace.style/frameworks/react#event-handling
    const inputElement = event.target as SlInputElement
    // Update search terms
    setSearch(inputElement.value)
  }

  // Define callback to react to item clicked
  // and open dialog
  const onItemClicked = (item: TestItemProperties) => {
    setFocusedItem(item)
    if (!dialogOpened) {
      setDialogOpened(true)
    }
  }

  // Define function to filter items
  // based on markers
  const filterItem = useCallback(
    (item: TestItemProperties): boolean => {
      if (includedMarkers.length > 0) {
        if (!includedMarkers.some((marker) => item.markers.includes(marker))) {
          return false
        }
      }
      if (excludedMarkers.length > 0) {
        if (excludedMarkers.some((marker) => item.markers.includes(marker))) {
          return false
        }
      }
      return true
    },
    [includedMarkers, excludedMarkers],
  )

  // Observe filtered items and set displayed items
  useEffect(() => {
    if (filteredItems.length === 0) {
      return
    }
    const newDisplayedItems = filteredItems.slice(offset, offset + pagination)
    setDisplayedItems(newDisplayedItems)
  }, [filteredItems, offset, pagination])

  // Observe test file and set test results
  useEffect(() => {
    const el = uploadFileRef.current as HTMLInputElement | null
    if (el?.files == null || el.files.length == 0) {
      return
    }
    const file = el.files[0]
    const reader = new FileReader()
    reader.onload = (event) => {
      const from = event.target as FileReader
      const content = from.result
      const result = JSON.parse(content as string)
      setTestResult(result)
    }
    reader.readAsText(file)
  }, [resultFile])

  // Observe test results and update state
  useEffect(() => {
    if (testResult == null) {
      // Lookup in local storage
      const content = localStorage.getItem("testResult")
      if (content == null) {
        // Clean-up
        setItems([])
        setAllMarkers(new Set<string>())
        setStats(null)
        setFilteredItems([])
        setDisplayedItems([])
        return
      }
      const result = JSON.parse(content)
      setTestResult(result)
      return
    } else {
      // Save in local storage
      localStorage.setItem("testResult", JSON.stringify(testResult))
    }
    // Gather all items
    const newItems = testResult.items.map(sanitize)
    const newMarkers = new Set(newItems.map((item) => item.markers).flat())
    const newfilteredItems = newItems.filter(filterItem)
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
      filter: (result) => filterItem(result as unknown as TestItemProperties),
      // Limit results
      limit: limit,
    } as SearchOptions
    // Reset offset
    setOffset(0)
    if (search === "") {
      const newfilteredItems = items.filter(filterItem)
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
  }, [search, limit, filterItem, items, allMarkers, engine])

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
      {stats && <TestStats {...stats} />}

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
