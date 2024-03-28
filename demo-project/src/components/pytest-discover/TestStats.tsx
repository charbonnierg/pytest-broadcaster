import SlBadge from "@shoelace-style/shoelace/dist/react/badge/index.js"

import type { Statistics } from "../../lib/stats"
import "./TestStats.css"

export interface TestStatsProps {
  stats: Statistics
}

const variant = (value: number) => (value === 0 ? "danger" : "success")

const Stats = ({ label, value }: { label: string; value: number }) => {
  return (
    <>
      <SlBadge variant={undefined}>{label}</SlBadge>
      <SlBadge pill variant={variant(value)}>
        {value}
      </SlBadge>
    </>
  )
}

/* A component to display test statistics */
export const TestStats = ({
  stats: { totalCount, totalMarkersCount, totalFiles, totalModules, totalSuites },
}: TestStatsProps) => {
  return (
    <div className="stats">
      <Stats label="Total Tests" value={totalCount} />
      <Stats label="Total Markers" value={totalMarkersCount} />
      <Stats label="Total Files" value={totalFiles} />
      <Stats label="Total Modules" value={totalModules} />
      <Stats label="Total Suites" value={totalSuites} />
    </div>
  )
}
