import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js"
import type { ReactNode } from "react"

import "./LeftSidebar.css"

interface LeftSidebarProps {
  open: boolean
  children: ReactNode
}

export const LeftSideBarButton = ({
  icon,
  onClick,
}: {
  icon: string
  onClick: () => void
}) => <SlIcon className="icon" name={icon} onClick={onClick}></SlIcon>

export const LeftSidebar = ({ children, open }: LeftSidebarProps) => {
  return (
    <div className="left-sidebar" data-open={open}>
      {children}
    </div>
  )
}

LeftSidebar.Button = LeftSideBarButton
