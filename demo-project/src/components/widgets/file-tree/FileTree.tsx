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
import type { TestCase } from "../../../types/discovery_result"
import "./FileTree.css"

interface FileNavigationProps {
  report: Report | null
  position: string | null
  setPosition: (node: string) => void
}

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
      return []
  }
}

const TreeNode = ({ view }: { view: View }) => {
  const [childView, setChildView] = useState<View[] | null>(null)
  const [lazy, setLazy] = useState(true)
  const onLazyLoad = () => {
    if (childView !== null) {
      return
    }
    setChildView(children(view))
    setLazy(false)
  }
  switch (view.type) {
    case NodeType.Directory:
      return (
        <SlTreeItem data-path={view.path} lazy={lazy} onSlLazyLoad={onLazyLoad}>
          <SlIcon name="folder"></SlIcon>
          {view.name}
          {childView !== null ? (
            childView.map((v) => <TreeNode key={v.path} view={v} />)
          ) : (
            <SlTreeItem>...</SlTreeItem>
          )}
        </SlTreeItem>
      )
    case NodeType.File:
      const fileHasChild = view.matrices.length > 0 || view.suites.length > 0
      return (
        <SlTreeItem
          data-path={view.path}
          lazy={fileHasChild && lazy}
          onSlLazyLoad={onLazyLoad}
        >
          <SlIcon name="filetype-py"></SlIcon>
          {view.name}
          {childView !== null
            ? childView.map((v) => <TreeNode key={v.path} view={v} />)
            : fileHasChild === true && <SlTreeItem>...</SlTreeItem>}
        </SlTreeItem>
      )
    case NodeType.Suite:
      const suiteHasChild = view.matrices.length > 0 || view.suites.length > 0
      return (
        <SlTreeItem
          data-path={view.path}
          lazy={suiteHasChild && lazy}
          onSlLazyLoad={onLazyLoad}
        >
          <SlIcon name="book"></SlIcon>
          {sanitizeName(view.name)}
          {childView !== null
            ? childView.map((v) => <TreeNode key={v.path} view={v} />)
            : suiteHasChild === true && <SlTreeItem>...</SlTreeItem>}
        </SlTreeItem>
      )
    case NodeType.Matrix:
      return (
        <SlTreeItem data-path={view.path} onSlExpand={onLazyLoad}>
          <SlIcon name="gear"></SlIcon>
          {view.name}
          {childView !== null &&
            childView.map((v) => <TreeNode key={v.path} view={v} />)}
        </SlTreeItem>
      )
    case NodeType.Case:
      return null
  }
}

/* At first, display only directories.

When an item is clicked, the DOM is updated to
display the children of the clicked item. 
*/
export const FileNavigation = ({
  report,
  setPosition,
}: FileNavigationProps) => {
  const [views, setViews] = useState<View[]>([])
  useEffect(() => {
    console.warn("FileNavigation: report changed")
    if (report == null) {
      console.warn("FileNavigation: report is null")
      setViews([])
      return
    }
    const cases = report.result.collect_reports.flatMap((r) =>
      r.items.filter((i) => i.node_type == "case"),
    ) as TestCase[]
    console.warn("Cases: ", cases)
    const nodes = makeNodes(...cases)
    console.warn("Nodes: ", nodes)
    const views = makeView(nodes)
    console.log("Views: ", views)
    setViews(views)
  }, [report])

  return (
    <SlTree
      onSlSelectionChange={(e) => {
        const selected = e.detail.selection[0]
        if (selected == null) {
          return
        }
        const value = selected.getAttribute("data-path")
        if (selected != null) {
          value && setPosition(value)
        }
      }}
    >
      {views.map((view) => (
        <TreeNode key={view.path} view={view} />
      ))}
    </SlTree>
  )
}

export default FileNavigation
