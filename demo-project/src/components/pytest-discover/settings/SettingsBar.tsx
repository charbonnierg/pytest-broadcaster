import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js"
import SlDrawer from "@shoelace-style/shoelace/dist/react/drawer/index.js"
import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js"
import SlTag from "@shoelace-style/shoelace/dist/react/tag/index.js"
import { useEffect, useRef } from "react"

import { newJSONReader } from "../../../lib/upload"
import type { DiscoveryResult } from "../../../types/discovery_result"
import "./SettingsBar.css"

export const DiscoveryResultMeta = ({
  filename,
  results,
  children,
}: {
  filename: string | null
  results: DiscoveryResult | null
  children: JSX.Element
}) => {
  if (filename == null || results == null) {
    return null
  }
  let parts = filename.split("/")
  let name = parts[parts.length - 1]
  parts = name.split("\\")
  name = parts[parts.length - 1]
  return (
    <div className="filename">
      <h2>{name}</h2>
      {children}
      <p>
        <SlTag>
          <SlIcon name="lightbulb"></SlIcon>Pytest version: {results.pytest_version}
        </SlTag>
      </p>
      <p>
        <SlTag>
          <SlIcon name="lightbulb"></SlIcon>Plugin version: {results.plugin_version}
        </SlTag>
      </p>
      <p data-success={results.exit_status === 0}>
        <SlTag>
          <SlIcon name="lightbulb"></SlIcon>Exit status:
          <span data-success={results.exit_status === 0}>{results.exit_status}</span>
        </SlTag>
      </p>
    </div>
  )
}

export const SettingsBar = ({
  opened,
  close,
  clear,
  filename,
  results,
  setFilename,
  setReport,
}: {
  opened: boolean
  close: () => void
  clear: () => void
  filename: string | null
  results: DiscoveryResult | null
  setFilename: (filename: string) => void
  setReport: (report: DiscoveryResult) => void
}) => {
  const ref = useRef<HTMLInputElement | null>(null)
  const reader = newJSONReader(setReport)

  useEffect(() => reader(ref.current), [filename])

  return (
    <SlDrawer
      label="Settings"
      open={opened}
      onSlRequestClose={(e) => {
        if (e.detail.source === "overlay") {
          e.preventDefault()
        }
      }}
      onSlAfterHide={close}
    >
      <form>
        <input
          ref={ref}
          type="file"
          id="file-upload"
          value={filename || ""}
          onChange={(evt) => {
            setFilename(evt.target.value)
          }}
        />
      </form>
      {filename == null && (
        <SlButton
          className="upload-button"
          variant="default"
          onClick={() => {
            const el = ref.current
            if (el == null) {
              return
            }
            el.click()
          }}
        >
          Upload file
        </SlButton>
      )}
      <DiscoveryResultMeta results={results} filename={filename}>
        <SlButton className="hover-danger-button" variant="default" onClick={clear}>
          Clear
        </SlButton>
      </DiscoveryResultMeta>
      <SlButton variant="default" slot="footer" onClick={close}>
        Close
      </SlButton>
    </SlDrawer>
  )
}
