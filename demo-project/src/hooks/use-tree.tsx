import { useEffect, useState } from "react"

import { type Node, type View, makeNodes, makeView } from "../lib/files"
import type { Report } from "../lib/repository"

export const useTree = (report: Report | null) => {
  const [nodes, setNodes] = useState<Node[]>([])
  const [view, setView] = useState<View[] | null>(null)
  useEffect(() => {
    if (report == null) {
      return
    }
    console.log("Adding items to tree", report.result.items.length)
    const current = makeNodes(...report.result.items)
    setNodes(current)
    setView(makeView(current))
  }, [report])
  return {
    nodes,
    view,
    clear: () => {
      setNodes([])
      setView(null)
    },
  }
}
