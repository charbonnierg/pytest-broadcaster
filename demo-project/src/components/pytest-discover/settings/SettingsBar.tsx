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
  setDiscoveryResult,
}: {
  opened: boolean
  close: () => void
  clear: () => void
  filename: string | null
  setFilename: (filename: string) => void
  setDiscoveryResult: (results: DiscoveryResult) => void
}) => {
  const ref = useRef<HTMLInputElement | null>(null)
  const reader = newJSONReader(setDiscoveryResult)

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
      <SlButton variant="default" onClick={clear}>
        Clear all
      </SlButton>
      <SlButton variant="default" slot="footer" onClick={close}>
        Close
      </SlButton>
    </SlDrawer>
  )
}
