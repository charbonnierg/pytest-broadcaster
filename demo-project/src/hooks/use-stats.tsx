import { useEffect, useState } from "react"

import { type Statistics, computeStats } from "../lib/stats"
import type { DiscoveryResult } from "../types/discovery_result"

export const useStats = (result: DiscoveryResult | null): Statistics | null => {
  const [stats, setStats] = useState<Statistics | null>(null)
  useEffect(() => {
    if (result == null) {
      setStats(null)
      return
    }
    setStats(computeStats(result))
  }, [result])
  return stats
}
