import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js"
import { type MouseEventHandler, useEffect, useRef } from "react"

import type { Report } from "../../../../lib/repository"
import type { Statistics } from "../../../../lib/stats"
import { newJSONReader } from "../../../../lib/upload"
import type { DiscoveryResult } from "../../../../types/discovery_result"
import "./ReportStatus.css"

export const ReportStatus = ({
  report,
  setReport,
  statistics,
}: {
  report: Report | null
  statistics: Statistics | null
  setReport: (report: Report | null) => void
}) => {
  return (
    <>
      <ReportFilename report={report} setReport={setReport} />
      {report != null && (
        <>
          <PytestVersion result={report.result} />
          <PluginVersion result={report.result} />

          {statistics && (
            <>
              <ReportErrors stats={statistics} />
              <ReportWarnings stats={statistics} />
              <ReportFileCount stats={statistics} />
              <ReportSuitesCount stats={statistics} />
              <ReportTotalCount stats={statistics} />
            </>
          )}
        </>
      )}
    </>
  )
}

const ReportIndicator = ({
  icon,
  value,
  state,
  onClick,
  classNames,
}: {
  icon: string
  value: number | string
  state?: "error" | "warning" | "success"
  onClick?: MouseEventHandler<HTMLButtonElement>
  classNames?: string[]
}) => {
  if (classNames == null) {
    classNames = []
  }
  const classes = Array.from(new Set(["report-meta", classNames])).join(" ")
  return (
    <button className={classes} data-state={state} onClick={onClick}>
      <SlIcon name={icon}></SlIcon>
      <span>{value}</span>
    </button>
  )
}

const ReportFilename = ({
  report,
  setReport,
}: {
  report: Report | null
  setReport: (report: Report | null) => void
}) => {
  // Create a new reference to some HTML element
  const ref = useRef<HTMLInputElement | null>(null)
  // Reset the reference when report changes
  // This is to clear the input field when a new report is loaded
  useEffect(() => {
    if (ref.current != null) {
      ref.current.value = ""
    }
  }, [report])
  // Create a new JSON reader to read uploaded file from the HTML element
  const reader = newJSONReader((filename, r) => {
    setReport({ result: r, filename: filename })
  })
  return (
    <>
      {/* Input form is hidden */}
      <form>
        <input
          ref={ref}
          type="file"
          id="file-upload"
          onChange={(evt) => {
            console.warn(
              "file upload event",
              evt.target.value,
              evt.target.files,
            )
            const input = evt.target
            reader(input)
          }}
        />
      </form>
      <ReportIndicator
        icon="filetype-json"
        classNames={["report-filename"]}
        value={report ? report.filename : "upload a file"}
        onClick={(e) => {
          const el = ref.current
          if (el == null) {
            return
          }
          el.click()
          e.preventDefault()
        }}
      />
    </>
  )
}

const ReportTotalCount = ({ stats }: { stats: Statistics }) => {
  return <ReportIndicator icon="box" value={stats.totalCount} />
}

const ReportFileCount = ({ stats }: { stats: Statistics }) => {
  return <ReportIndicator icon="filetype-py" value={stats.totalFiles} />
}

const ReportSuitesCount = ({ stats }: { stats: Statistics }) => {
  return <ReportIndicator icon="book" value={stats.totalSuites} />
}

const ReportErrors = ({ stats }: { stats: Statistics }) => {
  return (
    <ReportIndicator
      icon="x-circle"
      value={stats.totalErrors}
      state={stats.totalErrors > 0 ? "error" : "success"}
    />
  )
}

const ReportWarnings = ({ stats }: { stats: Statistics }) => {
  return (
    <ReportIndicator
      icon="exclamation-triangle"
      value={stats.totalWarnings}
      state={stats.totalWarnings > 0 ? "warning" : "success"}
    />
  )
}

const PytestVersion = ({ result }: { result: DiscoveryResult }) => {
  return (
    <ReportIndicator
      icon="info-circle"
      value={`pytest ${result.pytest_version}`}
    />
  )
}

const PluginVersion = ({ result }: { result: DiscoveryResult }) => {
  return (
    <ReportIndicator
      icon="info-circle"
      value={`plugin ${result.plugin_version}`}
    />
  )
}
