import { SlDrawer } from "@shoelace-style/shoelace/dist/react"
import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js"
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button/index.js"
import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js"
import { useEffect, useRef, useState } from "react"

import type { Report } from "../../../lib/repository"
import { newJSONReader } from "../../../lib/upload"
import type { DiscoveryResult } from "../../../types/discovery_result"
import "./ReportFooter.css"
import { ReportMeta } from "./ReportsMeta"

const getFilename = (result: Report) => {
  let parts = result.filename.split("/")
  let name = parts[parts.length - 1]
  parts = name.split("\\")
  return parts[parts.length - 1]
}

interface ReportFooterProps {
  open: boolean
  setOpen: (open: boolean) => void
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

const NudgeUsage = ({
  setReport,
}: {
  setReport: (report: Report | null) => void
}) => {
  const ref = useRef<HTMLInputElement | null>(null)
  const reader = newJSONReader((filename, r) => {
    setReport({ result: r, filename: filename })
  })
  return (
    <div className="nudge">
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
      <p>You must upload a report to use the application.</p>
      <div className="usage-proposals">
        <div className="proposal">
          <p>Run the following command to generate a test report:</p>
          <ul className="command-lines">
            <li>
              <code>pip install pytest-discover</code>
            </li>
            <li>
              <code>pytest --co --collect-report=report.json</code>
            </li>
          </ul>
        </div>
        <div className="proposal">
          <p>Click the button below to upload a test report.</p>
          <SlButton
            onClick={(e) => {
              const el = ref.current
              if (el == null) {
                return
              }
              el.click()
              e.preventDefault()
            }}
          >
            Upload
          </SlButton>
        </div>
      </div>
    </div>
  )
}

export const ReportFooter = ({
  open,
  setOpen,
  report,
  setReport,
}: ReportFooterProps) => {
  return (
    <div>
      <SlDrawer
        placement="bottom"
        open={open}
        onSlRequestClose={(e) => {
          if (e.detail.source === "overlay") {
            e.preventDefault()
          }
        }}
        onSlAfterHide={() => setOpen(false)}
      >
        <div className="drawer-header">
          <h2>{report == null ? "No test report" : getFilename(report)}</h2>
          {report != null && (
            <SlIconButton
              className="control-button hover-danger-button"
              name="trash3"
              onClick={() => {
                setReport(null)
              }}
            ></SlIconButton>
          )}
          <SlIconButton
            className="drawer-exit"
            name="x-lg"
            onClick={() => {
              setOpen(false)
            }}
          ></SlIconButton>
        </div>
        {report != null ? (
          <ReportMeta result={report}></ReportMeta>
        ) : (
          <NudgeUsage setReport={setReport}></NudgeUsage>
        )}
      </SlDrawer>
      <div className="report-footer-container">
        <SlIcon
          className="opener"
          name="chevron-up"
          onClick={() => setOpen(true)}
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
