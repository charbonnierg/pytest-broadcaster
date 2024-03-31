import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js"
import SlTreeItem, {
  type SlExpandEvent,
} from "@shoelace-style/shoelace/dist/react/tree-item/index.js"
import SlTree from "@shoelace-style/shoelace/dist/react/tree/index.js"
import { useCallback, useEffect, useState } from "react"

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
  const [loading, setLoading] = useState(false)
  const [childView, setChildView] = useState<View[] | null>(null)
  useEffect(() => {
    if (!loading) {
      return
    }
    const update = children(view)
    setChildView(update)
  }, [loading])
  const onExpand = useCallback(
    (e: SlExpandEvent) => {
      setLoading(!loading)
    },
    [loading],
  )
  switch (view.type) {
    case NodeType.Directory:
      return (
        <SlTreeItem data-path={view.path} lazy onSlLazyLoad={onExpand}>
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
      const fileHasChild =
        view.cases.length > 0 ||
        view.matrices.length > 0 ||
        view.suites.length > 0
      return (
        <SlTreeItem
          data-path={view.path}
          lazy={fileHasChild}
          onSlLazyLoad={onExpand}
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
          lazy={suiteHasChild}
          onSlLazyLoad={onExpand}
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
        <SlTreeItem data-path={view.path} onSlExpand={onExpand}>
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
    if (report == null) {
      setViews([])
      return
    }
    const nodes = makeNodes(...report.result.items)
    const views = makeView(nodes)
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
