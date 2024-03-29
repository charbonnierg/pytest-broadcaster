import { useCallback, useEffect, useState } from "react"

import type { ResultsRepository } from "../lib/repository"
import { newSearchEngine, sanitize, search } from "../lib/search"
import { type Statistics, computeStats } from "../lib/stats"
import type { DiscoveryResult } from "../types/discovery_result"
import type { TestItem } from "../types/test_item"
import { useMarkersFilters } from "./markers-filters"

export const useSearchResults = (
  repository: ResultsRepository,
  defaultLimit: number,
  defaultPageSize: number,
) => {
  const markers = useMarkersFilters()
  const [engine] = useState(newSearchEngine())
  const [terms, setTerms] = useState<string>("")
  const [offset, setOffset] = useState<number>(0)
  const [limit] = useState<number>(defaultLimit)
  const [pageSize] = useState<number>(defaultPageSize)
  const [allItems, setAllItems] = useState<TestItem[]>([])
  const [matchingItems, setMatchingItems] = useState<TestItem[]>([])
  const [results, setResults] = useState<TestItem[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [report, setReport] = useState<DiscoveryResult | null>(repository.loadResults())

  const nextPage = useCallback(() => {
    setOffset(Math.min(matchingItems.length - pageSize, offset + pageSize))
  }, [matchingItems, offset, pageSize])

  const prevPage = useCallback(() => {
    setOffset(Math.max(0, offset - pageSize))
  }, [offset, pageSize])

  // Observe test results and update state
  useEffect(() => {
    if (report == null) {
      const resultsFromStorage = repository.loadResults()
      if (resultsFromStorage != null) {
        setReport(resultsFromStorage)
        return
      }
      setAllItems([])
      markers.set([])
      setStatistics(null)
      setMatchingItems([])
      setResults([])
      return
    }
    // Save in local storage
    repository.saveResults(report)
    // Gather all items
    const newItems = report.items.map(sanitize)
    const newfilteredItems = newItems.filter(markers.filter)
    // Update state
    setAllItems(newItems)
    markers.set(Array.from(new Set(newItems.map((item) => item.markers).flat())))
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
  }, [report])

  // Observe filtered items and set displayed items
  useEffect(() => {
    setResults(matchingItems.slice(offset, offset + pageSize))
  }, [matchingItems, offset, pageSize])

  // Observe search terms and update filtered items
  useEffect(() => {
    setOffset(0)
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

  return {
    report,
    offset,
    limit,
    markers,
    results,
    statistics,
    terms,
    setReport,
    setTerms,
    nextPage,
    prevPage,
    reset: () => {
      setAllItems([])
      markers.set([])
      setStatistics(null)
      setMatchingItems([])
      setResults([])
      engine.removeAll()
    },
  }
}
