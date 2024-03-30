import { useEffect, useState } from "react"

import { type Node, newInMemoryTree } from "../lib/files"
import type { DiscoveryResult } from "../types/discovery_result"
import type { TestItem } from "../types/test_item"

export const useTree = (result: DiscoveryResult | null) => {
  const [nodes, set] = useState<Node[]>([])
  const [tree] = useState(
    newInMemoryTree({
      get: () => nodes,
      set,
    }),
  )
  useEffect(() => {
    if (result == null) {
      return
    }
    console.log("Adding items to tree", result.items.length)
    tree.add(...result.items)
  }, [result, tree])
  return {
    add: (...items: TestItem[]) => tree.add(...items),
    nodes,
  }
}
