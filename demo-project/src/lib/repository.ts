import type { DiscoveryResult } from "../types/discovery_result"

export interface DiscoveryResultRepository {
  // Load the discovery result from a JSON file
  loadDiscoveryResult: () => DiscoveryResult | null
  // Save the discovery result to a JSON file
  saveDiscoveryResult: (result: DiscoveryResult) => void
  // Remove the discovery result from the repository
  removeDiscoveryResult: () => void
}

export const LocalStorageDiscoveryResultRepository = (): DiscoveryResultRepository => {
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
    loadDiscoveryResult,
    saveDiscoveryResult,
    removeDiscoveryResult,
  }
}
