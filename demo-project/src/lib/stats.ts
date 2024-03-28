import type { TestItem } from "../types/test_item"

export interface Statistics {
  totalCount: number
  totalMarkersCount: number
  totalFiles: number
  totalModules: number
  totalSuites: number
}

export const computeStats = (items: TestItem[]): Statistics => {
  const stats = {
    totalCount: items.length,
    totalMarkersCount: Array.from(new Set(items.map((item) => item.markers).flat()))
      .length,
    totalFiles: Array.from(new Set(items.map((item) => item.file))).filter(
      (file) => file !== null,
    ).length,
    totalModules: Array.from(new Set(items.map((item) => item.module))).filter(
      (module) => module !== null,
    ).length,
    totalSuites: Array.from(
      new Set(items.map((item) => item.parent || item.module || item.file)),
    ).length,
  }
  return stats
}
