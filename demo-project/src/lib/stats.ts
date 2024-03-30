/* stats.ts exposes utilities to compute statistics from discovery results.*/
import type { TestItem } from "../types/test_item"

// I'm sure something like that already exists in the TS standard library
// but I can't find it 😭
type HasField<K extends string, T = any> = Partial<{
  [key in K]: T
}>

export interface Statistics {
  totalCount: number
  totalMarkersCount: number
  totalFiles: number
  totalModules: number
  totalSuites: number
}

export const computeStats = (items: TestItem[]): Statistics => {
  const stats = {
    // Total count
    totalCount: items.length,
    // Markers count
    totalMarkersCount: uniqueMultiCount(items, "markers"),
    // Files count
    totalFiles: uniqueCount(items, "file"),
    // Modules count
    totalModules: uniqueCount(items, "module"),
    // Suites count
    totalSuites: Array.from(
      new Set(
        items.map(
          (item) => item.parent || item.module || item.file || item.name,
        ),
      ),
    ).length,
  }
  return stats
}

const uniqueCount = <K extends string>(
  items: HasField<K>[],
  field: K,
): number => {
  const unique = new Set(items.map((item) => item[field]))
  return Array.from(unique).filter((value) => value !== null).length
}

const uniqueMultiCount = <K extends string>(
  items: HasField<K, any[]>[],
  field: K,
): number => {
  const unique = new Set(items.flatMap((item) => item[field]))
  return Array.from(unique).filter((value) => value !== null).length
}
