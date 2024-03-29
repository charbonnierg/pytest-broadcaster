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
  const [items, setItems] = useState<TestItem[]>([])
  const [filteredItems, setFilteredItems] = useState<TestItem[]>([])
  const [results, setDisplayedItems] = useState<TestItem[]>([])
  const [stats, setStats] = useState<Statistics | null>(null)

  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResult | null>(
    repository.loadResults(),
  )

  // Observe test results and update state
  useEffect(() => {
    if (discoveryResult == null) {
      const resultsFromStorage = repository.loadResults()
      if (resultsFromStorage != null) {
        setDiscoveryResult(resultsFromStorage)
        return
      }
      setItems([])
      markers.set([])
      setStats(null)
      setFilteredItems([])
      setDisplayedItems([])
      return
    }
    // Save in local storage
    repository.saveResults(discoveryResult)
    // Gather all items
    const newItems = discoveryResult.items.map(sanitize)
    const newfilteredItems = newItems.filter(markers.filter)
    // Update state
    setItems(newItems)
    markers.set(Array.from(new Set(newItems.map((item) => item.markers).flat())))
    // Initialize search engine
    engine.addAllAsync(newItems).catch((error) => {
      console.error("failed to add items to search engine: ", error)
    })
    // Update state
    setStats(computeStats(newfilteredItems))
    setFilteredItems(newfilteredItems)
    // Cleanup search engine on unmount
    return () => {
      engine.removeAll()
    }
  }, [discoveryResult])

  // Observe filtered items and set displayed items
  useEffect(() => {
    setDisplayedItems(filteredItems.slice(offset, offset + pageSize))
  }, [filteredItems, offset, pageSize])

  // Observe search terms and update filtered items
  useEffect(() => {
    setOffset(0)
    if (terms === "") {
      const newfilteredItems = items.filter(markers.filter)
      setStats(computeStats(newfilteredItems))
      setFilteredItems(newfilteredItems)
      return
    }
    const newfilteredItems = search(engine, terms, {
      boost: { node_id: 2 },
      filter: markers.filter,
      limit: limit,
    })
    setStats(computeStats(newfilteredItems))
    setFilteredItems(newfilteredItems)
  }, [terms, items, markers.filter, markers.values])

  const nextPage = useCallback(() => {
    setOffset(Math.min(filteredItems.length - pageSize, offset + pageSize))
  }, [filteredItems, offset, pageSize])

  const prevPage = useCallback(() => {
    setOffset(Math.max(0, offset - pageSize))
  }, [offset, pageSize])

  return {
    discoveryResult,
    setDiscoveryResult,
    offset,
    limit,
    markers,
    results,
    stats,
    terms,
    setTerms,
    nextPage,
    prevPage,
    reset: () => {
      setItems([])
      markers.set([])
      setStats(null)
      setFilteredItems([])
      setDisplayedItems([])
      engine.removeAll()
    },
  }
}
