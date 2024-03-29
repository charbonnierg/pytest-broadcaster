import SlBadge from "@shoelace-style/shoelace/dist/react/badge/index.js"
import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js"
import SlTag from "@shoelace-style/shoelace/dist/react/tag/index.js"
import SlTreeItem from "@shoelace-style/shoelace/dist/react/tree-item/index.js"
import SlTree from "@shoelace-style/shoelace/dist/react/tree/index.js"

import type { Report } from "../../../lib/repository"
import type { ErrorMessage } from "../../../types/discovery_result"
import type { WarningMessage } from "../../../types/warning_message"
import "./ReportsMeta.css"

interface ReportMetaProps {
  result: Report
  children: JSX.Element
}

const getFileName = (result: Report) => {
  let parts = result.filename.split("/")
  let name = parts[parts.length - 1]
  parts = name.split("\\")
  return parts[parts.length - 1]
}

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

export const ReportMeta = ({ result, children }: ReportMetaProps) => (
  <div className="filename">
    <h2>{getFileName(result)}</h2>
    {children}
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
