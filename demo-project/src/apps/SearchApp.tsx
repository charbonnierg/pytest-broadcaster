import {
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react"

import FileTree from "../components/pytest-discover/file-tree/FileTree.tsx"
import { SearchInput } from "../components/pytest-discover/input/SearchInput.tsx"
import { ReportDetails } from "../components/pytest-discover/results/report-details/ReportDetails.tsx"
import { ReportStatus } from "../components/pytest-discover/results/report-status/ReportStatus.tsx"
import TestItemDetails from "../components/pytest-discover/results/test-item-details/TestItemDetails.tsx"
import { TestItemGrid } from "../components/pytest-discover/results/test-item-grid/TestItemGrid.tsx"
import { BottomDrawer } from "../components/regions/bottom-drawer/BottomDrawer.tsx"
import { StickyFooter } from "../components/regions/sticky-footer/StickyFooter.tsx"
import { ActionLabel } from "../components/widgets/action-label/ActionLabel.tsx"
import { useSearchResults } from "../hooks/use-search-results.tsx"
import { getFilename } from "../lib/files.ts"
import { newLocalStorageReportRepository } from "../lib/repository.ts"
import type { TestItem } from "../types/test_item"
import "./SearchApp.css"

/* A search component for test items. */
export const SearchApp = (props: PropsWithChildren) => {
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
  const filename = useCallback(
    () => (report == null ? "No test report" : getFilename(report.filename)),
    [report],
  )
  return (
    <div className="search-app">
      <div className="search-navigation" data-open={navigationOpened}>
        {
          <FileTree
            open={navigationOpened}
            filter={filter}
            setFilter={setFilter}
            setOpen={setNavigationOpened}
            report={report}
          />
        }
      </div>
      <div className="search-container">
        <header>{props.children}</header>
        <div className="search-body">
          <SearchInput terms={terms} setTerms={setTerms} markers={markers} />
          <TestItemGrid
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
      {/* The sticky footer at the bottom of the page */}
      <StickyFooter open={settingsOpened} setOpen={setSettingsOpened}>
        {/* The content of the footer when closed */}
        <ReportStatus
          report={report}
          setReport={setReport}
          statistics={statistics}
        />
        {/* The title of the footer when opened */}
        <StickyFooter.Title>
          <ActionLabel
            as="h2"
            icon="trash3"
            value={filename()}
            onClick={() => setReport(null)}
          />
        </StickyFooter.Title>
        {/* The body of the footer when opened */}
        <StickyFooter.Body>
          <ReportDetails report={report} setReport={setReport} />
        </StickyFooter.Body>
      </StickyFooter>
      {/* A drawer opened from the bottom of the page which focuses on a test item */}
      <BottomDrawer opened={focusOpened} close={() => setFocusOpened(false)}>
        <TestItemDetails item={focusedItem} />
      </BottomDrawer>
    </div>
  )
}

export default SearchApp
