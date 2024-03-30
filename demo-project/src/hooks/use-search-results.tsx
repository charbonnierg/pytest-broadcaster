import { useEffect, useState } from "react"

import type { ReportRepository } from "../lib/repository"
import { newSearchEngine, sanitize, search } from "../lib/search"
import type { TestItem } from "../types/test_item"
import { useMarkersFilters } from "./use-markers-filters"
import { useReport } from "./use-report"
import { useStats } from "./use-stats"

export const useSearchResults = (
  repository: ReportRepository,
  defaultLimit: number,
) => {
  const markers = useMarkersFilters()
  const report = useReport(repository)
  const [engine] = useState(newSearchEngine())
  const [terms, setTerms] = useState<string>("")
  const [limit] = useState<number>(defaultLimit)
  const [allItems, setAllItems] = useState<TestItem[]>([])
  const [matchingItems, setMatchingItems] = useState<TestItem[]>([])
  const statistics = useStats(report.result)

  // Observe test results and update state
  useEffect(() => {
    if (!report.result || !report.filename) {
      setAllItems([])
      markers.set([])
      setMatchingItems([])
      return
    }
    // Gather all items
    const newItems = report.result.items.map(sanitize)
    const newfilteredItems = newItems.filter(markers.filter)
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
    setMatchingItems(newfilteredItems)
    // Cleanup search engine on unmount
    return () => {
      engine.removeAll()
    }
  }, [report.result])

  // Observe search terms and update filtered items
  useEffect(() => {
    if (terms === "") {
      const newfilteredItems = allItems.filter(markers.filter)
      setMatchingItems(newfilteredItems)
      return
    }
    const newfilteredItems = search(engine, terms, {
      boost: { node_id: 2 },
      filter: markers.filter,
      limit: limit,
    })
    setMatchingItems(newfilteredItems)
  }, [terms, allItems, markers.filter, markers.values])

  return {
    report,
    limit,
    markers,
    results: matchingItems,
    statistics,
    terms,
    setTerms,
    reset: () => {
      setAllItems([])
      markers.set([])
      setMatchingItems([])
      engine.removeAll()
    },
  }
}
