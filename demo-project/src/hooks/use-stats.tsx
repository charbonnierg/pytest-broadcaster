import { useEffect, useState } from "react"

import { type Report } from "../lib/repository"
import { type Statistics, computeStats } from "../lib/stats"

/* Hook to compute statistics each time a report changes. */
export const useStats = (report: Report | null): Statistics | null => {
  const [stats, setStats] = useState<Statistics | null>(null)
  useEffect(() => {
    if (report == null) {
      setStats(null)
      return
    }
    setStats(computeStats(report.result))
  }, [report])
  return stats
}
