import { useEffect, useState } from "react"

import type { ReportRepository } from "../lib/repository"
import { newSearchEngine, sanitize, search } from "../lib/search"
import { type Statistics, computeStats } from "../lib/stats"
import type { TestItem } from "../types/test_item"
import { useMarkersFilters } from "./use-markers-filters"
import { useReport } from "./use-report"

export const useSearchResults = (
  repository: ReportRepository,
  defaultLimit: number,
  // defaultPageSize: number,
) => {
  const markers = useMarkersFilters()
  const report = useReport(repository)
  const [engine] = useState(newSearchEngine())
  const [terms, setTerms] = useState<string>("")
  // const [offset, setOffset] = useState<number>(0)
  const [limit] = useState<number>(defaultLimit)
  // const [pageSize] = useState<number>(defaultPageSize)
  const [allItems, setAllItems] = useState<TestItem[]>([])
  const [matchingItems, setMatchingItems] = useState<TestItem[]>([])
  // const [results, setResults] = useState<TestItem[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)

  // const nextPage = useCallback(() => {
  //   setOffset(Math.min(matchingItems.length - pageSize, offset + pageSize))
  // }, [matchingItems, offset, pageSize])

  // const prevPage = useCallback(() => {
  //   setOffset(Math.max(0, offset - pageSize))
  // }, [offset, pageSize])

  // Observe test results and update state
  useEffect(() => {
    if (!report.result || !report.filename) {
      setAllItems([])
      markers.set([])
      setStatistics(null)
      setMatchingItems([])
      // setResults([])
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
    setStatistics(computeStats(newfilteredItems))
    setMatchingItems(newfilteredItems)
    // Cleanup search engine on unmount
    return () => {
      engine.removeAll()
    }
  }, [report.result])

  // Observe search terms and update filtered items
  useEffect(() => {
    // setOffset(0)
    if (terms === "") {
      const newfilteredItems = allItems.filter(markers.filter)
      setStatistics(computeStats(newfilteredItems))
      setMatchingItems(newfilteredItems)
      return
    }
    const newfilteredItems = search(engine, terms, {
      boost: { node_id: 2 },
      filter: markers.filter,
      limit: limit,
    })
    setStatistics(computeStats(newfilteredItems))
    setMatchingItems(newfilteredItems)
  }, [terms, allItems, markers.filter, markers.values])

  // Observe filtered items and set displayed items
  // useEffect(() => {
  //   setResults(matchingItems.slice(offset, offset + pageSize))
  // }, [matchingItems, offset, pageSize])

  return {
    report,
    // offset,
    limit,
    markers,
    results: matchingItems,
    statistics,
    terms,
    setReport: report.set,
    setTerms,
    // nextPage,
    // prevPage,
    reset: () => {
      setAllItems([])
      markers.set([])
      setStatistics(null)
      setMatchingItems([])
      // setResults([])
      engine.removeAll()
    },
  }
}
