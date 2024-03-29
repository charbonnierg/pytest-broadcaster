import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js"
import SlDrawer from "@shoelace-style/shoelace/dist/react/drawer/index.js"
import { useEffect, useRef } from "react"

import { newJSONReader } from "../../../lib/upload"
import type { DiscoveryResult } from "../../../types/discovery_result"
import "./SettingsBar.css"

export const SettingsBar = ({
  opened,
  close,
  clear,
  filename,
  setFilename,
  setReport,
}: {
  opened: boolean
  close: () => void
  clear: () => void
  filename: string | null
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
      <SlButton className="clear-button" variant="default" onClick={clear}>
        Clear all
      </SlButton>
      <SlButton className="close-button" variant="default" slot="footer" onClick={close}>
        Close
      </SlButton>
    </SlDrawer>
  )
}
