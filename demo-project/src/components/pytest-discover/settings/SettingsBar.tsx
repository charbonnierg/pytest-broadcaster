import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js"
import SlDrawer from "@shoelace-style/shoelace/dist/react/drawer/index.js"
import { useRef } from "react"

import type { Report } from "../../../lib/repository"
import { newJSONReader } from "../../../lib/upload"
import { ReportMeta } from "./ReportsMeta"
import "./SettingsBar.css"

interface SettingsBarProps {
  opened: boolean
  onClose: () => void
  onClear: () => void
  result: Report | null
  setReport: (report: Report) => void
}

export const SettingsBar = ({
  opened,
  onClose,
  onClear,
  result,
  setReport,
}: SettingsBarProps) => {
  // Create a new reference to some HTML element
  // This element will be used hidden but used to upload a file
  const ref = useRef<HTMLInputElement | null>(null)
  // Create a new JSON reader to read uploaded file from the HTML element
  const reader = newJSONReader((filename, r) => {
    setReport({ result: r, filename: filename })
  })
  // Define a function to clear the input field and call the onClear function
  const clear = () => {
    if (ref.current != null) {
      ref.current.value = ""
    }
    onClear()
  }

  return (
    <SlDrawer
      label="Test Report"
      open={opened}
      onSlRequestClose={(e) => {
        if (e.detail.source === "overlay") {
          e.preventDefault()
        }
      }}
      onSlAfterHide={onClose}
    >
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
      {/* Button is displayed only when there is no current result */}
      {result == null && (
        <SlButton
          className="upload-button"
          variant="default"
          onClick={(e) => {
            const el = ref.current
            if (el == null) {
              return
            }
            el.click()
            e.preventDefault()
          }}
        >
          Upload file
        </SlButton>
      )}
      {/* Meta is displayed only when there is a current result */}
      {result != null && (
        <ReportMeta result={result}>
          <SlButton
            className="hover-danger-button"
            variant="default"
            onClick={clear}
          >
            Clear
          </SlButton>
        </ReportMeta>
      )}
      {/* Close button is always displayed */}
      <SlButton variant="default" slot="footer" onClick={onClose}>
        Close
      </SlButton>
    </SlDrawer>
  )
}
