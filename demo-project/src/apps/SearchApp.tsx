import { type PropsWithChildren, useCallback, useEffect, useState } from "react"

import { SearchInput } from "../components/pytest-discover/input/SearchInput.tsx"
import { ReportDetails } from "../components/pytest-discover/results/report-details/ReportDetails.tsx"
import { ReportStatus } from "../components/pytest-discover/results/report-status/ReportStatus.tsx"
import TestItemDetails from "../components/pytest-discover/results/test-item-details/TestItemDetails.tsx"
import { TestItemGrid } from "../components/pytest-discover/results/test-item-grid/TestItemGrid.tsx"
import { BottomDrawer } from "../components/regions/bottom-drawer/BottomDrawer.tsx"
import { LeftSidebar } from "../components/regions/left-sidebar/LeftSidebar.tsx"
import { MainContainer } from "../components/regions/main-container/MainContainer.tsx"
import { StickyFooter } from "../components/regions/sticky-footer/StickyFooter.tsx"
import { ActionLabel } from "../components/widgets/action-label/ActionLabel.tsx"
import FileTree from "../components/widgets/file-tree/FileTree.tsx"
import { useSearchResults } from "../hooks/use-search-results.tsx"
import { getFilename } from "../lib/files.ts"
import { newLocalStorageReportRepository } from "../lib/repository.ts"
import type { TestCase } from "../types/test_case"
import "./SearchApp.css"

/* A search component for test items. */
export const SearchApp = (props: PropsWithChildren) => {
  // Initialize UI state
  const [navigationOpened, setNavigationOpened] = useState<boolean>(false)
  const [footerOpened, setFooterOpened] = useState<boolean>(false)
  const [focusOpened, setFocusOpened] = useState<boolean>(false)
  const [focusedItem, setFocusedItem] = useState<TestCase | null>(null)
  // Initialize file tree state
  const [position, setPosition] = useState<string | null>(null)
  // Initialize search state
  const { setTerms, terms, results, markers, statistics, report, setReport } =
    useSearchResults(newLocalStorageReportRepository(), position, 5000)
  // Open settings if there is no discovery result
  useEffect(() => {
    if (report == null) {
      setFooterOpened(true)
      return
    }
  }, [report])
  const filename = useCallback(
    () => (report == null ? "No test report" : getFilename(report.filename)),
    [report],
  )
  return (
    // Application is wrapped in a single div
    <div className="search-app">
      {/* The sidebar */}
      <LeftSidebar>
        <LeftSidebar.Button
          icon="filter-circle"
          onClick={() => {
            setNavigationOpened(!navigationOpened)
          }}
        />
        <LeftSidebar.Extension open={navigationOpened}>
          {navigationOpened && (
            <FileTree
              position={position}
              setPosition={setPosition}
              report={report}
            />
          )}
        </LeftSidebar.Extension>
      </LeftSidebar>

      {/* The main content of the page */}
      <MainContainer>
        <MainContainer.Header>{props.children}</MainContainer.Header>
        <SearchInput terms={terms} setTerms={setTerms} markers={markers} />
        <TestItemGrid
          items={results}
          pageSize={20}
          onItemClicked={(item: TestCase) => {
            if (focusOpened) {
              return
            }
            setFocusedItem(item)
            setFocusOpened(true)
          }}
        />
      </MainContainer>

      {/* The sticky footer at the bottom of the page */}
      <StickyFooter open={footerOpened} setOpen={setFooterOpened}>
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
            disabled={report == null}
            value={filename()}
            onClick={() => {
              setReport(null)
              setPosition(null)
            }}
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
