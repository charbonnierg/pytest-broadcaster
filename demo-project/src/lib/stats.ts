/* stats.ts exposes utilities to compute statistics from discovery results.*/
import type { DiscoveryResult, TestModule } from "../types/discovery_result"
import type { TestCase } from "../types/test_case"
import type { TestSuite } from "../types/test_suite"

// I'm sure something like that already exists in the TS standard library
// but I can't find it 😭
type HasField<K extends string, T = any> = Partial<{
  [key in K]: T
}>

export interface Statistics {
  totalErrors: number
  totalWarnings: number
  totalCases: number
  totalMarkersCount: number
  totalDirectories: number
  totalModules: number
  totalSuites: number
}

const sum = (a: number, b: number) => a + b

export const computeStats = (result: DiscoveryResult): Statistics => {
  const items = result.collect_reports.flatMap((report) =>
    report.items.filter((item) => item.node_type != "directory"),
  ) as (TestModule | TestCase | TestSuite)[]
  const stats = {
    // Total errors
    totalErrors: result.errors.length,
    // Total warnings
    totalWarnings: result.warnings.length,
    // Total count
    totalCases: result.collect_reports
      .map((report) => report.items.length)
      .reduce(sum, 0),
    // Markers count
    totalMarkersCount: Array.from(
      new Set(items.flatMap((item) => item.markers)),
    ).length,
    // Files count
    totalDirectories: result.collect_reports
      .map(
        (report) =>
          report.items.filter((item) => item.node_type == "directory").length,
      )
      .reduce(sum, 0),
    // Modules count
    totalModules: result.collect_reports
      .map(
        (report) =>
          report.items.filter((item) => item.node_type == "module").length,
      )
      .reduce(sum, 0),
    // Suites count
    totalSuites: result.collect_reports
      .map(
        (report) =>
          report.items.filter((item) => item.node_type == "suite").length,
      )
      .reduce(sum, 0),
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
