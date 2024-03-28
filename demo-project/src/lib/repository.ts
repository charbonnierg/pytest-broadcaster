/* repository.ts exposes utilities to load and save discovery results.*/
import type { DiscoveryResult } from "../types/discovery_result"

// DiscoveryResultRepository is a repository to load and save discovery results.
export interface ResultsRepository {
  // Load the discovery result from a JSON file
  loadResults: () => DiscoveryResult | null
  // Save the discovery result to a JSON file
  saveResults: (result: DiscoveryResult) => void
  // Remove the discovery result from the repository
  clearResults: () => void
}

// LocalStorageDiscoveryResultRepository is a DiscoveryResultRepository that uses the local storage.
export const newLocalStorageResultsRepository = (): ResultsRepository => {
  const loadDiscoveryResult = () => {
    const result = localStorage.getItem("discovery_result")
    if (result == null) {
      return null
    }
    return JSON.parse(result)
  }

  const saveDiscoveryResult = (result: DiscoveryResult) => {
    localStorage.setItem("discovery_result", JSON.stringify(result))
  }

  const removeDiscoveryResult = () => {
    localStorage.removeItem("discovery_result")
  }

  return {
    loadResults: loadDiscoveryResult,
    saveResults: saveDiscoveryResult,
    clearResults: removeDiscoveryResult,
  }
}
