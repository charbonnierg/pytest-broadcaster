import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input.js"
import SlInput, {
  type SlInputEvent,
} from "@shoelace-style/shoelace/dist/react/input/index.js"
import { useEffect, useState } from "react"

import { useSearchResults } from "../../hooks/search-result"
import { newLocalStorageResultsRepository } from "../../lib/repository"
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
  result: DiscoveryResult
}

/* A search component for test items. */
export const SearchApp = () => {
  // Create new repository
  const repository = newLocalStorageResultsRepository()
  // Initialize UI state
  const [settingsOpened, setSettingsOpened] = useState<boolean>(false)
  const [focusOpened, setFocusOpened] = useState<boolean>(false)
  const [focusedItem, setFocusedItem] = useState<TestItem | null>(null)
  // Initialize settings state
  const [resultFilename, setResultFilename] = useState<string | null>(null)
  // Initialize search state
  const {
    markers,
    terms: searchTerms,
    results,
    stats,
    setTerms: setSearchTerms,
    discoveryResult,
    setDiscoveryResult,
    prevPage,
    nextPage,
  } = useSearchResults(repository, 5000, 20)

  // Open settings if there is no discovery result
  useEffect(() => {
    if (discoveryResult == null) {
      setSettingsOpened(true)
    } else {
      setSettingsOpened(false)
    }
  }, [discoveryResult])

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
