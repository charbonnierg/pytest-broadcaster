import type { ReactNode } from "react"
import React from "react"

import "./MainContainer.css"

export const MainContainerHeader = ({ children }: { children: ReactNode }) => {
  return <header>{children}</header>
}

export const MainContainer = ({
  children,
  ref,
}: {
  children: Iterable<ReactNode>
  ref?: React.RefObject<HTMLDivElement>
}) => {
  let head = null
  let remaining = [] as ReactNode[]
  for (const child of children) {
    if (!React.isValidElement(child)) {
      continue
    }
    if (child.type === MainContainerHeader) {
      head = child
    } else {
      remaining.push(child)
    }
  }
  return (
    <div ref={ref} className="main-container">
      <header>{head}</header>
      <div className="main-container-body">{remaining}</div>
    </div>
  )
}

MainContainer.Header = MainContainerHeader
