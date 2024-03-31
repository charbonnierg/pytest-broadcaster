import type { TestItem } from "../types/test_item"

/* Format a test item name */
export const sanitizeName = (name: string): string => {
  return name.replaceAll("_", " ")
}

export const getFilename = (path: string): string => {
  let parts = path.split("/")
  let name = parts[parts.length - 1]
  parts = name.split("\\")
  return parts[parts.length - 1]
}

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

export interface DirectoryView {
  type: NodeType.Directory
  path: string
  name: string
  directories: DirectoryView[]
  files: FileView[]
}

export interface FileView {
  type: NodeType.File
  path: string
  name: string
  suites: SuiteView[]
  matrices: MatrixView[]
  cases: Case[]
}

export interface SuiteView {
  type: NodeType.Suite
  path: string
  name: string
  suites: SuiteView[]
  matrices: MatrixView[]
  cases: Case[]
}

export interface MatrixView {
  type: NodeType.Matrix
  path: string
  name: string
  cases: Case[]
}

export interface CaseView {
  type: NodeType.Case
  path: string
  name: string
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
export type View = DirectoryView | FileView | SuiteView | MatrixView | CaseView

export const makeView = (nodes: Node[]): View[] => {
  let currentDirectory = null as DirectoryView | null
  let currentFile = null as FileView | null
  let currentSuite = null as SuiteView | null
  let currentMatrix = null as MatrixView | null
  const root = nodes.shift()
  if (root == null) {
    return []
  }
  let views: View[] = []
  let currentView: View | null = null
  switch (root.type) {
    // Special case: return early
    case NodeType.Case:
      return [
        {
          type: NodeType.Case,
          path: root.path,
          name: root.name,
          properties: root.properties,
        },
      ]
    case NodeType.Directory:
      const directory = {
        type: NodeType.Directory,
        path: root.path,
        name: root.name,
        directories: [],
        files: [],
      } as DirectoryView
      views.push(directory)
      currentDirectory = directory
      currentView = directory
      break
    case NodeType.File:
      const file = {
        type: NodeType.File,
        path: root.path,
        name: root.name,
        suites: [],
        matrices: [],
        cases: [],
      } as FileView
      views.push(file)
      currentFile = file
      currentView = file
      break
    case NodeType.Suite:
      const suite = {
        type: NodeType.Suite,
        path: root.path,
        name: root.name,
        suites: [],
        matrices: [],
        cases: [],
      } as SuiteView
      views.push(suite)
      currentSuite = suite
      currentView = suite
      break
    case NodeType.Matrix:
      const matrix = {
        type: NodeType.Matrix,
        path: root.path,
        name: root.name,
        cases: [],
      } as MatrixView
      views.push(matrix)
      currentMatrix = matrix
      currentView = matrix
      break
  }
  for (const node of nodes) {
    switch (node.type) {
      // Process directories
      case NodeType.Directory:
        currentFile = null
        currentSuite = null
        currentMatrix = null
        const directory = {
          type: NodeType.Directory,
          path: node.path,
          name: node.name,
          directories: [],
          files: [],
        } as DirectoryView
        // We must have a current directory
        if (currentDirectory == null) {
          throw new Error("Directory without parent:")
        }
        // Check if this is a child directory of the current directory
        if (node.path.startsWith(currentDirectory.path)) {
          currentDirectory.directories.push(directory)
        } else {
          // Check if this is a directory in current view
          if (node.path.startsWith(currentView.path)) {
            ;(currentView as DirectoryView).directories.push(directory)
          } else {
            // Create a new view
            currentView = directory
            views.push(currentView)
          }
        }
        // Always update the current directory
        currentDirectory = directory
        break
      // Process files
      case NodeType.File:
        currentSuite = null
        currentMatrix = null
        const file = {
          type: NodeType.File,
          path: node.path,
          name: node.name,
          suites: [],
          matrices: [],
          cases: [],
        } as FileView
        if (currentDirectory == null) {
          throw new Error("File without directory")
        }
        currentDirectory.files.push(file)
        currentFile = file
        break
      // Process suites
      case NodeType.Suite:
        currentMatrix = null
        const suite = {
          type: NodeType.Suite,
          path: node.path,
          name: node.name,
          suites: [],
          matrices: [],
          cases: [],
        } as SuiteView
        if (currentFile == null) {
          throw new Error("Suite without file")
        }
        currentFile.suites.push(suite)
        currentSuite = suite
        break
      // Process matrices
      case NodeType.Matrix:
        const matrix = {
          type: NodeType.Matrix,
          path: node.path,
          name: node.name,
          cases: [],
        } as MatrixView
        if (currentFile == null) {
          throw new Error("Matrix without file")
        }
        currentFile.matrices.push(matrix)
        currentMatrix = matrix
        break
      // Process cases
      case NodeType.Case:
        if (currentMatrix != null) {
          currentMatrix.cases.push(node)
        } else if (currentSuite != null) {
          currentSuite.cases.push(node)
        } else if (currentFile != null) {
          currentFile.cases.push(node)
        } else {
          throw new Error("Case without file, suite or matrix")
        }
        break
    }
  }
  return views
}

export const makeNodes = (...items: TestItem[]): Node[] => {
  // Initialze nodes to add
  const next = {} as Record<string, Node>
  // Add the new nodes to the list of nodes to add
  add(next, ...items)
  // Save the updated tree
  return Object.values(next)
}

const addOne = (snapshot: Record<string, Node>, item: TestItem) => {
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
      parent,
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
  const regexp = /(\w*)(\[.*\])/g
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
const add = (snapshot: Record<string, Node>, ...items: TestItem[]) => {
  // Add the new nodes to the list of nodes to add
  items.forEach((item) => {
    addOne(snapshot, item)
  })
}
