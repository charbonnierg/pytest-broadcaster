import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input.js"
import SlInput, {
  type SlInputEvent,
} from "@shoelace-style/shoelace/dist/react/input/index.js"
import { useEffect, useState } from "react"

import { useSearchResults } from "../../hooks/use-search-results"
import { newLocalStorageReportRepository } from "../../lib/repository"
import type { DiscoveryResult } from "../../types/discovery_result"
import type { TestItem } from "../../types/test_item"
import MarkersFilters from "./markers-filters/MarkersFilters"
import { PaginationControl } from "./pagination/PaginationControl"
import { SearchResults } from "./search-results/SearchResults"
import { SettingsBar } from "./settings/SettingsBar"
import { SettingsButton } from "./settings/SettingsButton"
import { TestItemFocused } from "./test-item-focused/TestItemFocused"
import { TestStats } from "./test-stats/TestStats"

export interface SearchAppProps {
  report: DiscoveryResult
}

/* A search component for test items. */
export const SearchApp = () => {
  // Create new repository
  const repository = newLocalStorageReportRepository()
  // Initialize UI state
  const [settingsOpened, setSettingsOpened] = useState<boolean>(false)
  const [focusOpened, setFocusOpened] = useState<boolean>(false)
  const [focusedItem, setFocusedItem] = useState<TestItem | null>(null)
  // Initialize search state
  const {
    setTerms,
    setReport,
    nextPage,
    prevPage,
    terms,
    results,
    markers,
    statistics,
    report: discoveryResult,
  } = useSearchResults(repository, 5000, 20)

  // Open settings if there is no discovery result
  useEffect(() => {
    if (discoveryResult == null) {
      setSettingsOpened(true)
    }
  }, [discoveryResult])

  return (
    <div>
      <SettingsButton onClick={() => setSettingsOpened(true)} />
      <SettingsBar
        opened={settingsOpened}
        onClose={() => setSettingsOpened(false)}
        result={discoveryResult.get()}
        setReport={setReport}
        onClear={() => {
          repository.clearReport()
          setReport(null)
        }}
      />
      <TestItemFocused
        opened={focusOpened}
        close={() => setFocusOpened(false)}
        item={focusedItem}
      />

      <TestStats stats={statistics} />

      <SlInput
        helpText="Enter some text"
        value={terms}
        onSlInput={(event: SlInputEvent) =>
          setTerms((event.target as SlInputElement).value)
        }
      />

      <MarkersFilters
        choices={markers.values}
        get={markers.get}
        onClick={(marker: string) => markers.toggle(marker)}
      />

      <SearchResults
        items={results}
        onItemClicked={(item: TestItem) => {
          if (focusOpened) {
            return
          }
          setFocusedItem(item)
          setFocusOpened(true)
        }}
      />

      <PaginationControl prev={prevPage} next={nextPage} />
    </div>
  )
}

export default SearchApp
