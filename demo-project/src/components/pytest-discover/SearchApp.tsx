import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input.js"
import SlInput, {
  type SlInputEvent,
} from "@shoelace-style/shoelace/dist/react/input/index.js"
import { useEffect, useState } from "react"

import { useSearchResults } from "../../hooks/use-search-results"
import { useTree } from "../../hooks/use-tree.tsx"
import { newLocalStorageReportRepository } from "../../lib/repository"
import type { DiscoveryResult } from "../../types/discovery_result"
import type { TestItem } from "../../types/test_item"
import "./SearchApp.css"
import MarkersFilters from "./markers-filters/MarkersFilters"
import { SearchResults } from "./search-results/SearchResults"
import { ReportFooter } from "./settings/ReportFooter.tsx"
import { TestItemFocused } from "./test-item-focused/TestItemFocused"

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
  const { setTerms, terms, results, markers, statistics, report } =
    useSearchResults(repository, 5000)

  // Get tree nodes
  const { nodes } = useTree(report.result)
  useEffect(() => {
    console.log(`Report (${report.result?.items.length} items):`, report.result)
    console.log(`File tree (${nodes.length} nodes):`, nodes)
  }, [nodes, report.result])
  // Open settings if there is no discovery result
  useEffect(() => {
    if (report.result == null) {
      setSettingsOpened(true)
    }
  }, [report.result])

  return (
    <div className="search-app">
      {/* <div className="navigation-sidebar">
        {report.result && <FileNavigation nodes={nodes} />}
      </div> */}
      <div className="search-focus">
        <TestItemFocused
          opened={focusOpened}
          close={() => setFocusOpened(false)}
          item={focusedItem}
        />
      </div>
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
      <div className="search-footer">
        <ReportFooter
          open={settingsOpened}
          setOpen={setSettingsOpened}
          report={report.get()}
          statistics={statistics}
          setReport={(value) => {
            report.set(value)
            if (value == null) {
              repository.clearReport()
            }
          }}
        ></ReportFooter>
      </div>
    </div>
  )
}

export default SearchApp
