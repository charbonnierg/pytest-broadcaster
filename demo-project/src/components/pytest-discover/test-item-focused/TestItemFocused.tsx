import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js"
import SlDrawer from "@shoelace-style/shoelace/dist/react/drawer/index.js"

import type { TestItem } from "../../../types/test_item"
import { TestItemDetails } from "../test-item-details/TestItemDetails"
import "./TestItemFocused.css"

interface TestItemFocusedProps {
  opened: boolean
  close: () => void
  item: TestItem | null
}

export const TestItemFocused = ({ opened, close, item }: TestItemFocusedProps) =>
  item && (
    <SlDrawer
      no-header
      className="focused-item"
      placement="bottom"
      open={opened}
      onSlRequestClose={(e) => {
        if (e.detail.source === "overlay") {
          e.preventDefault()
        }
      }}
      onSlAfterHide={close}
    >
      <TestItemDetails properties={item}></TestItemDetails>
      <SlButton className="close-focused-item" variant="default" onClick={close}>
        Close
      </SlButton>
    </SlDrawer>
  )
