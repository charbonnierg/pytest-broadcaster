import { type Dispatch, type SetStateAction, useEffect, useState } from "react"

import type { Report, ReportRepository } from "../lib/repository"

/* Hook to sync report with a repository */
export const useReport = (
  repository: ReportRepository,
): [Report | null, Dispatch<SetStateAction<Report | null>>] => {
  const [report, setReport] = useState(repository.loadReport())
  useEffect(() => {
    if (report == null) {
      repository.clearReport()
      return
    }
    repository.saveReport(report)
  }, [report])
  return [report, setReport]
}
