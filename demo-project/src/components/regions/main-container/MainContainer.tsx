import type { ReactNode } from "react"
import { isValidElement } from "react"

import "./MainContainer.css"

export const MainContainerHeader = ({ children }: { children: ReactNode }) => {
  return <header>{children}</header>
}

export const MainContainer = ({
  children,
}: {
  children: Iterable<ReactNode>
}) => {
  let head = null
  let remaining = [] as ReactNode[]
  for (const child of children) {
    if (!isValidElement(child)) {
      continue
    }
    if (child.type === MainContainerHeader) {
      head = child
    } else {
      remaining.push(child)
    }
  }
  return (
    <div className="main-container">
      <header>{head}</header>
      <div className="main-container-body">{remaining}</div>
    </div>
  )
}

MainContainer.Header = MainContainerHeader
