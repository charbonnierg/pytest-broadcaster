import { useCallback, useEffect, useState } from "react"

import type { ReportRepository } from "../lib/repository"
import { newSearchEngine, sanitize, search } from "../lib/search"
import type { TestItem } from "../types/test_item"
import { useMarkersFilters } from "./use-markers-filters"
import { useReport } from "./use-report"
import { useStats } from "./use-stats"

/* Hook to perform search on test report */
export const useSearchResults = (
  repository: ReportRepository,
  filter: string | null,
  defaultLimit: number,
) => {
  const markers = useMarkersFilters()
  const [report, setReport] = useReport(repository)
  const [engine] = useState(newSearchEngine())
  const [terms, setTerms] = useState<string>("")
  const [limit] = useState<number>(defaultLimit)
  const [allItems, setAllItems] = useState<TestItem[]>([])
  const [results, setResults] = useState<TestItem[]>([])
  const statistics = useStats(report)
  const filterFunc = useCallback(
    (item: TestItem): boolean => {
      if (filter == null || filter == "") {
        return markers.filter(item)
      }
      if (!item.node_id.startsWith(filter)) {
        return false
      }
      return markers.filter(item)
    },
    [filter, markers.filter],
  )
  // Observe test results and update state
  useEffect(() => {
    if (!report) {
      setAllItems([])
      markers.set([])
      setResults([])
      return
    }
    // Gather all items
    const newItems = report.result.items.map(sanitize)
    const newfilteredItems = newItems.filter(filterFunc)
    // Update state
    setAllItems(newItems)
    markers.set(
      Array.from(new Set(newItems.map((item) => item.markers).flat())),
    )
    // Initialize search engine
    engine.addAllAsync(newItems).catch((error) => {
      console.error("failed to add items to search engine: ", error)
    })
    // Update state
    setResults(newfilteredItems)
    // Cleanup search engine on unmount
    return () => {
      engine.removeAll()
    }
  }, [report])

  // Observe search terms and update filtered items
  useEffect(() => {
    if (terms === "") {
      const newfilteredItems = allItems.filter(filterFunc)
      setResults(newfilteredItems)
      return
    }
    const newfilteredItems = search(engine, terms, {
      boost: { node_id: 2 },
      filter: filterFunc,
      limit: limit,
    })
    setResults(newfilteredItems)
  }, [terms, allItems, filterFunc])

  return {
    report,
    setReport,
    limit,
    markers,
    results,
    statistics,
    terms,
    setTerms,
    reset: () => {
      setAllItems([])
      markers.set([])
      setResults([])
      engine.removeAll()
    },
  }
}
