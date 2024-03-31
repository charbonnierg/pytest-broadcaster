import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js"
import SlDrawer from "@shoelace-style/shoelace/dist/react/drawer/index.js"
import type { ReactNode } from "react"

import "./BottomDrawer.css"

interface TestItemFocusedProps {
  opened: boolean
  close: () => void
  children: ReactNode
}

export const BottomDrawer = ({
  opened,
  close,
  children,
}: TestItemFocusedProps) => (
  <SlDrawer
    no-header
    placement="bottom"
    open={opened}
    onSlRequestClose={(e) => {
      if (e.detail.source === "overlay") {
        e.preventDefault()
      }
    }}
    onSlAfterHide={close}
  >
    {children}
    <SlButton className="close-bottom-drawer" variant="default" onClick={close}>
      Close
    </SlButton>
  </SlDrawer>
)
