/* repository.ts exposes utilities to load and save discovery results.*/
import type { DiscoveryResult } from "../types/discovery_result"

export interface Report {
  result: DiscoveryResult
  filename: string
}

// ReportRepository is a repository to load and save discovery results.
export interface ReportRepository {
  // Load the discovery result from a JSON file
  loadReport: () => Report | null
  // Save the discovery result to a JSON file
  saveReport: (results: Report) => void
  // Remove the discovery result from the repository
  clearReport: () => void
}

// newLocalStorageReportRepository creates a new ReportRepository that uses the local storage.
export const newLocalStorageReportRepository = (): ReportRepository => {
  const loadReport = () => {
    const current = localStorage.getItem("discovery_result")
    if (current == null) {
      return null
    }
    return JSON.parse(current) as Report
  }

  const saveReport = (results: Report) => {
    localStorage.setItem("discovery_result", JSON.stringify(results))
  }

  const clearReport = () => {
    localStorage.removeItem("discovery_result")
  }

  return {
    loadReport,
    saveReport,
    clearReport,
  }
}
