import { SlDrawer } from "@shoelace-style/shoelace/dist/react"
import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js"
import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js"
import { useEffect, useRef, useState } from "react"

import type { Report } from "../../../lib/repository"
import { newJSONReader } from "../../../lib/upload"
import type { DiscoveryResult } from "../../../types/discovery_result"
import "./ReportFooter.css"
import { ReportMeta } from "./ReportsMeta"

interface ReportFooterProps {
  report: Report | null
  setReport: (report: Report | null) => void
}

const ReportFile = ({
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
    <div>
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
      <button
        className="report-meta report-filename"
        data-missing={report == null}
        onClick={(e) => {
          const el = ref.current
          if (el == null) {
            return
          }
          el.click()
          e.preventDefault()
        }}
      >
        {report ? (
          <>
            <SlIcon name="filetype-json"></SlIcon>
            <span>{report.filename}</span>
          </>
        ) : (
          <span>Upload file</span>
        )}
      </button>
    </div>
  )
}
const ReportErrors = ({ result }: { result: DiscoveryResult }) => {
  return (
    <div>
      <button
        className="report-meta"
        data-state={result.errors.length > 0 ? "error" : "success"}
      >
        <SlIcon name="x-circle"></SlIcon>
        <span>{result.errors.length}</span>
      </button>
    </div>
  )
}
const ReportWarnings = ({ result }: { result: DiscoveryResult }) => {
  return (
    <div>
      <button
        className="report-meta"
        data-state={result.warnings.length > 0 ? "warning" : "success"}
      >
        <SlIcon name="exclamation-triangle"></SlIcon>
        <span>{result.warnings.length}</span>
      </button>
    </div>
  )
}
const PytestVersion = ({ result }: { result: DiscoveryResult }) => {
  return (
    <div>
      <button className="report-meta">
        <SlIcon name="info-circle"></SlIcon>
        <span>pytest {result.pytest_version}</span>
      </button>
    </div>
  )
}
const PluginVersion = ({ result }: { result: DiscoveryResult }) => {
  return (
    <div>
      <button className="report-meta">
        <SlIcon name="info-circle"></SlIcon>
        <span>plugin {result.plugin_version}</span>
      </button>
    </div>
  )
}

export const ReportFooter = ({ report, setReport }: ReportFooterProps) => {
  const [opened, setOpened] = useState(false)
  return (
    <div>
      <SlDrawer
        placement="bottom"
        open={opened}
        onSlRequestClose={(e) => {
          if (e.detail.source === "overlay") {
            e.preventDefault()
          }
        }}
        onSlAfterHide={() => setOpened(false)}
      >
        {report != null && (
          <ReportMeta result={report}>
            <SlButton
              className="hover-danger-button"
              variant="default"
              onClick={() => {
                setReport(null)
                setOpened(false)
              }}
            >
              Clear
            </SlButton>
          </ReportMeta>
        )}
      </SlDrawer>
      <div className="report-footer-container">
        <SlIcon
          className="opener"
          name="chevron-up"
          onClick={() => setOpened(true)}
        ></SlIcon>
        <ReportFile report={report} setReport={setReport} />
        {report != null && (
          <>
            <ReportErrors result={report.result} />
            <ReportWarnings result={report.result} />
            <PytestVersion result={report.result} />
            <PluginVersion result={report.result} />
          </>
        )}
      </div>
    </div>
  )
}
