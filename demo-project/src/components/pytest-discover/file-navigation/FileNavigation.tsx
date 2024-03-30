import SlBreadcrumbItem from "@shoelace-style/shoelace/dist/react/breadcrumb-item/index.js"
import SlBreadcrumb from "@shoelace-style/shoelace/dist/react/breadcrumb/index.js"

import { type Node } from "../../../lib/files"

interface FileNavigationProps {
  nodes: Node[]
}

const formatPath = (node: Node) => {
  const parts = node.path.split("/")
  const filename = parts.pop()
  const otherParts = filename?.split("::")
  if (otherParts) {
    parts.push(...otherParts)
  }
  return (
    <SlBreadcrumb
      key={node.path}
      onClick={() => {
        alert(JSON.stringify(node))
      }}
    >
      {parts.map((part) => {
        return (
          <SlBreadcrumbItem key={`${node.path}-${part}`}>
            {part}
          </SlBreadcrumbItem>
        )
      })}
    </SlBreadcrumb>
  )
}

export const FileNavigation = ({ nodes }: FileNavigationProps) => {
  return (
    <div>
      <h3>File Navigation</h3>
      <ul>{nodes.slice(0, 100).map((node) => formatPath(node))}</ul>
    </div>
  )
}

export default FileNavigation
