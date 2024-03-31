import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js"
import { type ReactElement, type ReactNode, isValidElement } from "react"

import "./LeftSidebar.css"

interface LeftSidebarProps {
  children: ReactNode[]
}

export const LeftSideBarButton = ({
  icon,
  onClick,
}: {
  icon: string
  onClick: () => void
}) => <SlIcon className="icon" name={icon} onClick={onClick}></SlIcon>

export const LeftSidebarExtension = ({
  children,
  open,
}: {
  children: ReactNode
  open: boolean
}) => {
  return (
    <div data-open={open} className="left-sidebar-extension">
      {children}
    </div>
  )
}

export const LeftSidebar = ({ children }: LeftSidebarProps) => {
  let extension = null as ReactNode
  let buttons = [] as ReactNode[]
  children
    .filter((child) => isValidElement(child))
    .forEach((child) => {
      if ((child as ReactElement).type === LeftSidebarExtension) {
        extension = child
      } else {
        buttons.push(child)
      }
    })
  return (
    <>
      <div className="left-sidebar">
        <div className="left-sidebar-buttons">{buttons}</div>
      </div>
      {extension}
    </>
  )
}

LeftSidebar.Button = LeftSideBarButton
LeftSidebar.Extension = LeftSidebarExtension
