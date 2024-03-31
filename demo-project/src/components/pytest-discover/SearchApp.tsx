import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input.js"
import SlInput, {
  type SlInputEvent,
} from "@shoelace-style/shoelace/dist/react/input/index.js"
import { type ReactNode, useEffect, useState } from "react"

import { useSearchResults } from "../../hooks/use-search-results"
import { newLocalStorageReportRepository } from "../../lib/repository"
import type { TestItem } from "../../types/test_item"
import "./SearchApp.css"
import FileNavigation from "./file-navigation/FileNavigation.tsx"
import MarkersFilters from "./markers-filters/MarkersFilters"
import { SearchResults } from "./search-results/SearchResults"
import { ReportFooter } from "./settings/ReportFooter.tsx"
import { TestItemFocused } from "./test-item-focused/TestItemFocused"

export interface SearchAppProps {
  children: ReactNode
}

/* A search component for test items. */
export const SearchApp = ({ children }: SearchAppProps) => {
  // Create new repository
  const repository = newLocalStorageReportRepository()
  // Initialize UI state
  const [navigationOpened, setNavigationOpened] = useState<boolean>(false)
  const [settingsOpened, setSettingsOpened] = useState<boolean>(false)
  const [focusOpened, setFocusOpened] = useState<boolean>(false)
  const [focusedItem, setFocusedItem] = useState<TestItem | null>(null)
  // Initialize search state
  const {
    setTerms,
    filter,
    setFilter,
    terms,
    results,
    markers,
    statistics,
    report,
    setReport,
  } = useSearchResults(repository, 5000)
  // Open settings if there is no discovery result
  useEffect(() => {
    if (report == null) {
      setSettingsOpened(true)
      return
    }
  }, [report])

  return (
    <div className="search-app">
      <div className="search-navigation" data-open={navigationOpened}>
        {
          <FileNavigation
            open={navigationOpened}
            filter={filter}
            setFilter={setFilter}
            setOpen={setNavigationOpened}
            report={report}
          />
        }
      </div>
      <div className="search-container">
        <header>{children}</header>
        <div className="search-body">
          <div className="search-input">
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
          </div>
          <div className="search-results">
            <SearchResults
              items={results}
              pageSize={20}
              onItemClicked={(item: TestItem) => {
                if (focusOpened) {
                  return
                }
                setFocusedItem(item)
                setFocusOpened(true)
              }}
            />
          </div>
        </div>
      </div>
      <div className="search-focus">
        <TestItemFocused
          opened={focusOpened}
          close={() => setFocusOpened(false)}
          item={focusedItem}
        />
      </div>
      <ReportFooter
        open={settingsOpened}
        setOpen={setSettingsOpened}
        report={report}
        statistics={statistics}
        setReport={setReport}
      ></ReportFooter>
    </div>
  )
}

export default SearchApp
