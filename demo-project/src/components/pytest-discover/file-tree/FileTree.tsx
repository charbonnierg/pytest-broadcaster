import type { SlInputEvent } from "@shoelace-style/shoelace"
import SlTreeItemElement from "@shoelace-style/shoelace/dist/components/tree-item/tree-item.js"
import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js"
import SlTreeItem from "@shoelace-style/shoelace/dist/react/tree-item/index.js"
import SlTree from "@shoelace-style/shoelace/dist/react/tree/index.js"
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

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
  const onClick = useCallback(
    (e: MouseEvent<SlTreeItemElement>) => {
      setLoading(!loading)
    },
    [loading],
  )
  switch (view.type) {
    case NodeType.Directory:
      return (
        <SlTreeItem data-path={view.path} onClick={onClick}>
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
      return (
        <SlTreeItem data-path={view.path} onClick={onClick}>
          <SlIcon name="filetype-py"></SlIcon>
          {view.name}
          {childView !== null
            ? childView.map((v) => <TreeNode key={v.path} view={v} />)
            : view.cases.length > 0 ||
              view.suites.length > 0 ||
              (view.matrices.length > 0 && <SlTreeItem>...</SlTreeItem>)}
        </SlTreeItem>
      )
    case NodeType.Suite:
      return (
        <SlTreeItem data-path={view.path} onClick={onClick}>
          <SlIcon name="book"></SlIcon>
          {sanitizeName(view.name)}
          {childView !== null
            ? childView.map((v) => <TreeNode key={v.path} view={v} />)
            : view.cases.length > 0 ||
              view.matrices.length > 0 ||
              (view.suites.length > 0 && <SlTreeItem>...</SlTreeItem>)}
        </SlTreeItem>
      )
    case NodeType.Matrix:
      return (
        <SlTreeItem data-path={view.path} onClick={onClick}>
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
          console.warn("selected is null")
        }
        const value = selected.getAttribute("data-path")
        console.log("selection change: " + value)
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
