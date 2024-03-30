import { useCallback, useEffect, useState } from "react"

import type { Report, ReportRepository } from "../lib/repository"
import type { DiscoveryResult } from "../types/discovery_result"

export const useReport = (repository: ReportRepository) => {
  const initial = repository.loadReport()
  const [filename, setFilename] = useState<string | undefined>(
    initial?.filename,
  )
  const [result, setResult] = useState<DiscoveryResult | null>(
    initial ? initial.result : null,
  )
  const get = useCallback((): Report | null => {
    if (filename == null) {
      return null
    }
    if (result == null) {
      return null
    }
    return { filename, result: result }
  }, [filename, result])
  const set = (savedResult: Report | null) => {
    if (savedResult == null) {
      setFilename(undefined)
      setResult(null)
      return
    }
    setFilename(savedResult.filename)
    setResult(savedResult.result)
  }
  useEffect(() => {
    if (!result) {
      return
    }
    if (!filename) {
      return
    }
    repository.saveReport({ result, filename })
    return
  }, [result, filename])
  return {
    get,
    set,
    filename,
    result,
  }
}
