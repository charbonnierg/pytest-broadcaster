import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js"
import SlTreeItem from "@shoelace-style/shoelace/dist/react/tree-item/index.js"
import SlTree from "@shoelace-style/shoelace/dist/react/tree/index.js"
import { useEffect, useState } from "react"

import {
  NodeType,
  type View,
  makeNodes,
  makeView,
  sanitizeName,
} from "../../../lib/files"
import { type Report } from "../../../lib/repository"
import "./FileTree.css"

interface FileNavigationProps {
  report: Report | null
  open: boolean
  setOpen: (open: boolean) => void
  filter: string | null
  setFilter: (node: string) => void
}

export const FileNavigation = ({
  report,
  open,
  setOpen,
  filter,
  setFilter,
}: FileNavigationProps) => {
  const [views, setViews] = useState<View[]>([])
  useEffect(() => {
    if (report == null) {
      setViews([])
      return
    }
    const nodes = makeNodes(...report.result.items)
    const views = makeView(nodes)
    setViews(views)
  }, [report])
  // List all children of a view
  const children = (v: View) => {
    switch (v.type) {
      case NodeType.Directory:
        return [...v.directories, ...v.files]
      case NodeType.File:
        return [...v.suites, ...v.matrices, ...v.cases]
      case NodeType.Suite:
        return [...v.suites, ...v.matrices, ...v.cases]
      case NodeType.Matrix:
        return [...v.cases]
      default:
        return [v]
    }
  }
  const display = (
    v: View,
    filter: string,
    setFilter: (node: string) => void,
  ) => {
    if (filter != "") {
      if (!v.path.startsWith(filter) && v.type !== NodeType.Directory) {
        return null
      }
    }
    if (filter == "") {
      if (v.type !== NodeType.Directory) {
        return null
      }
    }
    switch (v.type) {
      case NodeType.Directory:
        return (
          <SlTreeItem
            onClick={() => {
              setFilter(v.path)
            }}
          >
            <SlIcon name="folder"></SlIcon>
            {v.name}
            {filter !== "" ? (
              children(v).map((child) => display(child, filter, setFilter))
            ) : (
              <SlTreeItem>...</SlTreeItem>
            )}
          </SlTreeItem>
        )
      case NodeType.File:
        return (
          <SlTreeItem
            onClick={() => {
              setFilter(v.path)
            }}
          >
            <SlIcon name="filetype-py"></SlIcon>
            {v.name}
            {children(v).map((child) => display(child, filter, setFilter))}
          </SlTreeItem>
        )
      case NodeType.Suite:
        return (
          <SlTreeItem
            onClick={() => {
              setFilter(v.path)
            }}
          >
            {sanitizeName(v.name)}
            {children(v).map((child) => display(child, filter, setFilter))}
          </SlTreeItem>
        )
      case NodeType.Matrix:
        return (
          <SlTreeItem
            onClick={() => {
              setFilter(v.path)
            }}
          >
            {v.name}
            {children(v).map((child) => display(child, filter, setFilter))}
          </SlTreeItem>
        )
      case NodeType.Case:
        return null
    }
  }
  if (views == null) {
    return "No view available"
  }
  return (
    <div className="bar">
      <div className="icons">
        {!open && (
          <SlIcon
            className="icon"
            name="arrow-right"
            data-open={open}
            onClick={() => {
              setOpen(!open)
            }}
          ></SlIcon>
        )}
      </div>
      <div className="view">
        {open && (
          <>
            <SlIcon
              className="icon"
              name="arrow-left"
              data-open={open}
              onClick={() => {
                setOpen(!open)
              }}
            ></SlIcon>
            <SlTree data-open={open}>
              {views.map((child) => display(child, filter || "", setFilter))}
            </SlTree>
          </>
        )}
      </div>
    </div>
  )
}

export default FileNavigation
