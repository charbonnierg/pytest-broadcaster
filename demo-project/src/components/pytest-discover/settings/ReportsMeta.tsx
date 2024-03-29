import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js"
import SlTag from "@shoelace-style/shoelace/dist/react/tag/index.js"

import type { Report } from "../../../lib/repository"
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

export const ReportMeta = ({ result, children }: ReportMetaProps) => (
  <div className="filename">
    <h2>{getFileName(result)}</h2>
    {children}
    <p>
      <SlTag>
        <SlIcon name="lightbulb"></SlIcon>Pytest version: {result.result.pytest_version}
      </SlTag>
    </p>
    <p>
      <SlTag>
        <SlIcon name="lightbulb"></SlIcon>Plugin version: {result.result.plugin_version}
      </SlTag>
    </p>
    <p data-success={result.result.exit_status === 0}>
      <SlTag>
        <SlIcon name="lightbulb"></SlIcon>Exit status:
        <span data-success={result.result.exit_status === 0}>
          {result.result.exit_status}
        </span>
      </SlTag>
    </p>
  </div>
)
