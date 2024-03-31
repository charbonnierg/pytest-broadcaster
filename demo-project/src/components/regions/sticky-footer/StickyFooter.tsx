import { SlDrawer } from "@shoelace-style/shoelace/dist/react"
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button/index.js"
import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js"
import { type ReactNode, isValidElement } from "react"

import "./StickyFooter.css"

interface ReportFooterProps {
  open: boolean
  setOpen: (open: boolean) => void
  children: Iterable<ReactNode>
}

export const StickyFooterExpandedTitle = ({
  children,
}: {
  children: ReactNode
}) => {
  return <div className="sticky-footer-expanded-title">{children}</div>
}

export const StickyFooterExpanded = ({ children }: { children: ReactNode }) => {
  return <div className="sticky-footer-expanded-body">{children}</div>
}

export const StickyFooter = ({
  open,
  setOpen,
  children,
}: ReportFooterProps) => {
  let inner = null as ReactNode
  let title = null as ReactNode
  let outer = [] as ReactNode[]
  for (const child of children) {
    if (!isValidElement(child)) {
      continue
    }
    if (child.type === StickyFooterExpanded) {
      inner = child
    } else if (child.type === StickyFooterExpandedTitle) {
      title = child
    } else {
      outer.push(child)
    }
  }
  return (
    <>
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
        <div className="sticky-footer-expanded">
          <div className="sticky-footer-expanded-header">
            {title}
            <SlIconButton
              className="sticky-footer-exit"
              name="x-lg"
              onClick={() => {
                setOpen(false)
              }}
            ></SlIconButton>
          </div>
          {inner}
        </div>
      </SlDrawer>
      <div className="sticky-footer-container">
        <SlIcon
          className="sticky-footer-opener"
          name="chevron-up"
          onClick={() => setOpen(true)}
        ></SlIcon>
        <div className="sticky-footer-buttons">{outer}</div>
      </div>
    </>
  )
}

StickyFooter.Body = StickyFooterExpanded
StickyFooter.Title = StickyFooterExpandedTitle
