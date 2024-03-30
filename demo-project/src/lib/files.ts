import type { TestItem } from "../types/test_item"

var regexp = /(\w*)*(\[.*\])/g

export enum NodeType {
  Directory = "directory",
  File = "file",
  Suite = "suite",
  Matrix = "matrix",
  Case = "case",
}

interface NodeBase<T extends NodeType> {
  type: T
  path: string
  name: string
  parent?: string
}

export interface Directory extends NodeBase<NodeType.Directory> {}

export interface File extends NodeBase<NodeType.File> {}

export interface Suite extends NodeBase<NodeType.Suite> {}

export interface Matrix extends NodeBase<NodeType.Matrix> {
  // A matrix must have a parent
  parent: string
}

export interface Case extends NodeBase<NodeType.Case> {
  // A case must have a parent
  parent: string
  // The properties of the test case
  properties: TestItem
}

const makeDirectory = ({
  name,
  parent,
}: {
  name: string
  parent?: string
}): Directory => ({
  type: NodeType.Directory,
  path: parent ? `${parent}/${name}` : name,
  name,
  parent,
})

const makeFile = ({
  filename,
  parent,
}: {
  filename: string
  parent: string
}): File => ({
  type: NodeType.File,
  path: `${parent}/${filename}`,
  name: filename,
  parent,
})

const makeSuite = ({
  name,
  parent,
}: {
  name: string
  parent: string
}): Suite => ({
  type: NodeType.Suite,
  path: `${parent}::${name}`,
  name,
  parent,
})

const makeMatrix = ({
  name,
  parent,
}: {
  name: string
  parent: string
}): Matrix => {
  return {
    type: NodeType.Matrix,
    path: `${parent}::${name}`,
    name,
    parent: parent,
  }
}

const makeCase = ({
  name,
  content,
  parent,
}: {
  name: string
  content: TestItem
  parent: string
}): Case => ({
  type: NodeType.Case,
  path: `${parent}::${name}`,
  name,
  parent,
  properties: content,
})

export type Node = Directory | File | Suite | Matrix | Case

export interface Tree {
  // Add entry to the tree
  add(...item: TestItem[]): void
  // Get all nodes in the tree
  list(parent?: string): Node[]
  // Get all keys in the tree
  ids(parent?: string): string[]
  // Check whether the item is in the tree according to the position
  // If parent is provided, only the items under the parent are checked
  includes(node_id: string, parent?: string): boolean
}

export const newInMemoryTree = ({
  get,
  set,
}: {
  get: () => Node[]
  set: (nodes: Node[]) => void
}): Tree => {
  const addOnce = (snapshot: Record<string, Node>, item: TestItem) => {
    // Ignore items without filenames for the moment
    if (!item.file) {
      return
    }
    // Start by replacing the backslashes with forward slashes
    const filepath = item.file.replaceAll("\\", "/").replaceAll("//", "/")
    // At this point we've got a sanitized filepath, we can extract the directory and filename
    const parts = filepath.split("/")
    // Extract the filename
    const filename = parts.pop()
    if (!filename) {
      return
    }
    // Initialize the directory name
    let parent = undefined as string | undefined
    // Extract all the directories
    while (parts.length > 0) {
      const name = parts.shift() as string
      // Create new directory
      const directory = makeDirectory({
        name,
        parent: parent ? parent : undefined,
      })
      // Append the directory to the list of children to create
      snapshot[directory.path] = directory
      parent = directory.path
    }
    // Extract the file
    const file = makeFile({
      filename,
      // There is always a parent directory at this point
      parent: parent as string,
    })
    // Append the file to the list of children to create
    snapshot[file.path] = file
    // Set the file path as parent for the next nodes
    parent = file.path
    // Extract the suite
    const suites = item.node_id.split("::").slice(1, -1)
    while (suites.length > 0) {
      const name = suites.shift() as string
      const child = makeSuite({
        name,
        parent,
      })
      // Append the suite to the list of children to create
      snapshot[child.path] = child
      parent = child.path
    }
    // Extract the matrix
    const match = regexp.exec(item.node_id)
    if (match != null && match.length == 2) {
      const [_, matrix_name] = match
      const matrix = makeMatrix({
        name: matrix_name,
        parent: parent,
      })
      // Append the matrix to the list of children to create
      snapshot[matrix.path] = matrix
    }
    // Extract the entry
    const entry = makeCase({
      parent,
      name: item.name,
      content: item,
    })
    // Append the entry to the list of children to create
    snapshot[entry.path] = entry
  }
  // Add a new item to the tree
  // We must identify all nodes in the path to the item
  const add = (...items: TestItem[]) => {
    // Initialze nodes to add
    const next = {} as Record<string, Node>
    // Add the current nodes to the list of nodes to add
    get().forEach((node) => (next[node.path] = node))
    // Add the new nodes to the list of nodes to add
    items.forEach((item) => addOnce(next, item))
    // Save the updated tree
    set(Object.values(next))
  }
  return {
    add,
    includes: (node_id: string, parent?: string) =>
      parent
        ? get().some(
            (node) => node.path == node_id && node.path.startsWith(parent),
          )
        : get().some((node) => node.path == node_id),
    ids: (parent?: string) =>
      parent
        ? get()
            .filter((node) => node.path.startsWith(parent))
            .map((node) => node.path)
        : get().map((node) => node.path),
    list: (parent?: string) =>
      parent ? get().filter((node) => node.path.startsWith(parent)) : get(),
  }
}
