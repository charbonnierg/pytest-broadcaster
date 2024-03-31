import SlBadge from "@shoelace-style/shoelace/dist/react/badge/index.js"
import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js"
import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js"
import SlTag from "@shoelace-style/shoelace/dist/react/tag/index.js"
import SlTreeItem from "@shoelace-style/shoelace/dist/react/tree-item/index.js"
import SlTree from "@shoelace-style/shoelace/dist/react/tree/index.js"
import { useRef } from "react"

import type { Report } from "../../../../lib/repository"
import { newJSONReader } from "../../../../lib/upload"
import type { ErrorMessage } from "../../../../types/discovery_result"
import type { WarningMessage } from "../../../../types/warning_message"
import "./ReportsDetails.css"

const errorsItems = (errors: ErrorMessage[]) => {
  const count = errors.length
  if (count === 0) {
    return null
  }
  return (
    <SlTreeItem>
      <p>
        Errors
        <SlBadge slot="suffix" variant="neutral" pill>
          {count}
        </SlBadge>
      </p>
      {errors.map((error, idx) => {
        return (
          <SlTreeItem key={idx}>
            <SlTag>
              <SlIcon name="filetype-py"></SlIcon>
              {error.filename}
            </SlTag>
            <SlTreeItem>
              <p>{error.exception_value}</p>
            </SlTreeItem>
          </SlTreeItem>
        )
      })}
    </SlTreeItem>
  )
}

const warningItems = (warnings: WarningMessage[]) => {
  const count = warnings.length
  if (count === 0) {
    return null
  }
  return (
    <SlTreeItem>
      <p>
        Warnings
        <SlBadge slot="suffix" variant="neutral" pill>
          {count}
        </SlBadge>
      </p>
      {warnings.map((warning, idx) => {
        return (
          <SlTreeItem key={idx}>
            <SlTag>
              <SlIcon name="filetype-py"></SlIcon>
              {warning.filename}
            </SlTag>
            <SlTreeItem>
              <p>{warning.message}</p>
            </SlTreeItem>
          </SlTreeItem>
        )
      })}
    </SlTreeItem>
  )
}

export const ReportMeta = ({ result }: { result: Report }) => (
  <div className="filename">
    <SlTree>
      <SlTreeItem>
        <p>
          <span>Exit status: </span>
          <span data-success={result.result.exit_status === 0}>
            {result.result.exit_status}
          </span>
        </p>
      </SlTreeItem>
      <SlTreeItem>
        <p>
          <span>Pytest version: </span>
          <span>{result.result.pytest_version}</span>
        </p>
      </SlTreeItem>
      <SlTreeItem>
        <p>
          <span>Plugin version: </span>
          <span>{result.result.plugin_version}</span>
        </p>
      </SlTreeItem>
      {errorsItems(result.result.errors)}
      {warningItems(result.result.warnings)}
    </SlTree>
  </div>
)

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

export const ReportDetails = ({
  report,
  setReport,
}: {
  report: Report | null
  setReport: (report: Report | null) => void
}) => {
  return report != null ? (
    <ReportMeta result={report}></ReportMeta>
  ) : (
    <NudgeUsage setReport={setReport}></NudgeUsage>
  )
}
