import SlBadge from "@shoelace-style/shoelace/dist/react/badge/index.js"

import "./TestStats.css"

export interface TestStatsProps {
  totalCount: number
  totalMarkersCount: number
  totalFiles: number
  totalModules: number
  totalSuites: number
}

/* A component to display test statistics */
export const TestStats = ({
  totalCount,
  totalMarkersCount,
  totalFiles,
  totalModules,
  totalSuites,
}: TestStatsProps) => {
  const variantNeutral = (value: number) => (value === 0 ? undefined : undefined)
  const variantSuccess = (value: number) => (value === 0 ? "danger" : "success")
  return (
    <div className="stats">
      <SlBadge variant={variantNeutral(totalCount)}>Total Tests</SlBadge>
      <SlBadge pill variant={variantSuccess(totalCount)}>
        {totalCount}
      </SlBadge>
      <SlBadge variant={variantNeutral(totalCount)}>Total Markers</SlBadge>
      <SlBadge pill variant={variantSuccess(totalMarkersCount)}>
        {totalMarkersCount}
      </SlBadge>
      <SlBadge variant={variantNeutral(totalFiles)}>Total Files</SlBadge>
      <SlBadge pill variant={variantSuccess(totalFiles)}>
        {totalFiles}
      </SlBadge>
      <SlBadge variant={variantNeutral(totalModules)}>Total Modules</SlBadge>
      <SlBadge pill variant={variantSuccess(totalModules)}>
        {totalModules}
      </SlBadge>
      <SlBadge variant={variantNeutral(totalSuites)}>Total Suites</SlBadge>
      <SlBadge pill variant={variantSuccess(totalSuites)}>
        {totalSuites}
      </SlBadge>
    </div>
  )
}
