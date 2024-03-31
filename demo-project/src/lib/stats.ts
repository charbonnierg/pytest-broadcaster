/* stats.ts exposes utilities to compute statistics from discovery results.*/
import type { DiscoveryResult } from "../types/discovery_result"

// I'm sure something like that already exists in the TS standard library
// but I can't find it 😭
type HasField<K extends string, T = any> = Partial<{
  [key in K]: T
}>

export interface Statistics {
  totalCount: number
  totalMarkersCount: number
  totalFiles: number
  totalErrors: number
  totalWarnings: number
  totalModules: number
  totalSuites: number
}

export const computeStats = (result: DiscoveryResult): Statistics => {
  const stats = {
    // Total count
    totalCount: result.items.length,
    // Total errors
    totalErrors: result.errors.length,
    // Total warnings
    totalWarnings: result.warnings.length,
    // Markers count
    totalMarkersCount: uniqueMultiCount(result.items, "markers"),
    // Files count
    totalFiles: uniqueCount(result.items, "file"),
    // Modules count
    totalModules: uniqueCount(result.items, "module"),
    // Suites count
    totalSuites: Array.from(
      new Set(
        result.items.map(
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
