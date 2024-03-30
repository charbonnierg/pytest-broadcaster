import { describe, expect, it } from "vitest"

import type { TestItem } from "../types/test_item"
import { type Node, NodeType, newInMemoryTree } from "./files"

const makeTree = () => {
  let values = [] as Node[]
  return newInMemoryTree({
    get: () => values,
    set: (nodes: Node[]) => (values = nodes),
  })
}
const makeExample = (): TestItem => ({
  file: "parent/test.py",
  node_id: "parent/test.py::test_something",
  name: "test_something",
  doc: "A test item",
  markers: ["marker1", "marker2"],
  parameters: {},
})

const evolve = (example: TestItem, updates: Partial<TestItem>): TestItem => {
  const updated = {
    ...example,
    ...updates,
  }
  // Always recreate the node_id
  updated.node_id = updated.parent
    ? `${updated.file}::${updated.parent}::${updated.name}`
    : `${updated.file}::${updated.name}`
  return updated
}

describe.concurrent("Tree", () => {
  describe.concurrent("simple tree", () => {
    it("should return the keys of the tree", () => {
      const tree = makeTree()
      expect(tree.ids()).toStrictEqual([])
      const item = makeExample()
      tree.add(item)
      expect(tree.ids()).toStrictEqual([
        "parent",
        "parent/test.py",
        "parent/test.py::test_something",
      ])
    })
    it("should respect the parent when listing keys", () => {
      const tree = makeTree()
      expect(tree.ids()).toStrictEqual([])
      const item = makeExample()
      tree.add(item)
      expect(tree.ids("parent")).toStrictEqual([
        "parent",
        "parent/test.py",
        "parent/test.py::test_something",
      ])
      expect(tree.ids("parent/test.py")).toStrictEqual([
        "parent/test.py",
        "parent/test.py::test_something",
      ])
      expect(tree.ids("other")).toStrictEqual([])
      expect(tree.ids("parent/other")).toStrictEqual([])
    })
    it("should return false when item does not exist", () => {
      const tree = makeTree()
      const item = makeExample()
      expect(tree.includes(item.node_id)).toBe(false)
    })
    it("should return true when item is included", () => {
      const tree = makeTree()
      const item = makeExample()
      tree.add(item)
      expect(tree.includes(item.node_id)).toBe(true)
    })
    it("should return false when item is not included according to prefix", () => {
      const tree = makeTree()
      const item = makeExample()
      tree.add(item)
      expect(tree.includes(item.node_id, "other")).toBe(false)
      expect(tree.includes(item.node_id, "parent/other")).toBe(false)
    })
    it("should return true when item is included according to prefix", () => {
      const tree = makeTree()
      const item = makeExample()
      tree.add(item)
      expect(tree.includes(item.node_id, "parent")).toBe(true)
    })
    it("should return the list of nodes", () => {
      const tree = makeTree()
      const item = makeExample()
      expect(tree.list()).toStrictEqual([])
      tree.add(item)
      expect(tree.list()).toStrictEqual([
        {
          name: "parent",
          path: "parent",
          type: NodeType.Directory,
          parent: undefined,
        },
        {
          name: "test.py",
          path: "parent/test.py",
          type: NodeType.File,
          parent: "parent",
        },
        {
          name: "test_something",
          path: "parent/test.py::test_something",
          type: NodeType.Case,
          parent: "parent/test.py",
          properties: item,
        },
      ])
    })
  })
  describe.concurrent("tree with multiple items", () => {
    it("should return true when item is included", () => {
      const tree = makeTree()
      const item1 = makeExample()
      const item2 = evolve(item1, { name: "test_another" })
      tree.add(item1)
      tree.add(item2)
      expect(tree.includes(item1.node_id)).toBe(true)
      expect(tree.includes(item2.node_id)).toBe(true)
    })
    it("should return false when item does not exist", () => {
      const tree = makeTree()
      const item1 = makeExample()
      const item2 = evolve(item1, { name: "test_another" })
      tree.add(item1)
      expect(tree.includes(item2.node_id)).toBe(false)
    })
    it("should return true when item is included according to prefix", () => {
      const tree = makeTree()
      const item1 = makeExample()
      const item2 = evolve(item1, { name: "test_another" })
      tree.add(item1)
      tree.add(item2)
      expect(tree.includes(item1.node_id, "parent")).toBe(true)
      expect(tree.includes(item2.node_id, "parent")).toBe(true)
    })
    it("should return false when item is not included according to prefix", () => {
      const tree = makeTree()
      const item1 = makeExample()
      const item2 = evolve(item1, { name: "test_another" })
      tree.add(item1)
      tree.add(item2)
      expect(tree.includes(item1.node_id, "other")).toBe(false)
      expect(tree.includes(item2.node_id, "other")).toBe(false)
    })
    it("should return the list of nodes", () => {
      const tree = makeTree()
      const item1 = makeExample()
      const item2 = evolve(item1, { name: "test_another" })
      const item3 = evolve(item1, { name: "test_yet_another" })
      tree.add(item1)
      tree.add(item2)
      tree.add(item3)
      expect(tree.list()).toStrictEqual([
        {
          name: "parent",
          path: "parent",
          type: NodeType.Directory,
          parent: undefined,
        },
        {
          name: "test.py",
          path: "parent/test.py",
          type: NodeType.File,
          parent: "parent",
        },
        {
          name: "test_something",
          path: "parent/test.py::test_something",
          type: NodeType.Case,
          parent: "parent/test.py",
          properties: item1,
        },
        {
          name: "test_another",
          path: "parent/test.py::test_another",
          type: NodeType.Case,
          parent: "parent/test.py",
          properties: item2,
        },
        {
          name: "test_yet_another",
          path: "parent/test.py::test_yet_another",
          type: NodeType.Case,
          parent: "parent/test.py",
          properties: item3,
        },
      ])
    })
  })
  describe.concurrent("tree wth several suites", () => {
    it("should return true when item is included", () => {
      const tree = makeTree()
      const item1 = makeExample()
      const item2 = evolve(item1, { name: "test_another", parent: "suite1" })
      const item3 = evolve(item1, {
        name: "test_yet_another",
        parent: "suite2",
      })
      tree.add(item1)
      tree.add(item2)
      tree.add(item3)
      expect(tree.includes(item1.node_id)).toBe(true)
      expect(tree.includes(item2.node_id)).toBe(true)
      expect(tree.includes(item3.node_id)).toBe(true)
    })
    it("should return true when item is included according to prefix", () => {
      const tree = makeTree()
      const item1 = makeExample()
      const item2 = evolve(item1, { name: "test_another", parent: "suite1" })
      const item3 = evolve(item1, {
        name: "test_yet_another",
        parent: "suite2",
      })
      tree.add(item1)
      tree.add(item2)
      tree.add(item3)
      expect(tree.includes(item1.node_id, "parent")).toBe(true)
      expect(tree.includes(item2.node_id, "parent")).toBe(true)
      expect(tree.includes(item3.node_id, "parent")).toBe(true)
      expect(tree.includes(item2.node_id, "parent/test.py::suite1")).toBe(true)
      expect(tree.includes(item3.node_id, "parent/test.py::suite2")).toBe(true)
    })
    it("should return false when item is not included according to prefix", () => {
      const tree = makeTree()
      const item1 = makeExample()
      const item2 = evolve(item1, { name: "test_another", parent: "suite1" })
      const item3 = evolve(item1, {
        name: "test_yet_another",
        parent: "suite2",
      })
      tree.add(item1)
      tree.add(item2)
      tree.add(item3)
      expect(tree.includes(item1.node_id, "parent")).toBe(true)
      expect(tree.includes(item2.node_id, "parent")).toBe(true)
      expect(tree.includes(item3.node_id, "parent")).toBe(true)
      expect(tree.includes(item3.node_id, "parent/test.py::suite1")).toBe(false)
      expect(tree.includes(item2.node_id, "parent/test.py::suite2")).toBe(false)
    })
    it("should return the list of names", () => {
      const tree = makeTree()
      const item1 = makeExample()
      const item2 = evolve(item1, { name: "test_another", parent: "suite1" })
      const item3 = evolve(item1, {
        name: "test_yet_another",
        parent: "suite2",
      })
      tree.add(item1)
      tree.add(item2)
      tree.add(item3)
      expect(tree.list().map((item) => item.path)).toStrictEqual([
        "parent",
        "parent/test.py",
        "parent/test.py::test_something",
        "parent/test.py::suite1",
        "parent/test.py::suite1::test_another",
        "parent/test.py::suite2",
        "parent/test.py::suite2::test_yet_another",
      ])
    })
    it("should return the list of nodes", () => {
      const tree = makeTree()
      const item1 = makeExample()
      const item2 = evolve(item1, { name: "test_another", parent: "suite1" })
      const item3 = evolve(item1, {
        name: "test_yet_another",
        parent: "suite2",
      })
      tree.add(item1)
      tree.add(item2)
      tree.add(item3)
      expect(tree.list()).toStrictEqual([
        {
          name: "parent",
          path: "parent",
          type: NodeType.Directory,
          parent: undefined,
        },
        {
          name: "test.py",
          path: "parent/test.py",
          type: NodeType.File,
          parent: "parent",
        },
        {
          name: "test_something",
          path: "parent/test.py::test_something",
          type: NodeType.Case,
          parent: "parent/test.py",
          properties: item1,
        },
        {
          path: "parent/test.py::suite1",
          type: NodeType.Suite,
          parent: "parent/test.py",
          name: "suite1",
        },
        {
          name: "test_another",
          path: "parent/test.py::suite1::test_another",
          type: NodeType.Case,
          parent: "parent/test.py::suite1",
          properties: item2,
        },
        {
          path: "parent/test.py::suite2",
          type: NodeType.Suite,
          parent: "parent/test.py",
          name: "suite2",
        },
        {
          name: "test_yet_another",
          path: "parent/test.py::suite2::test_yet_another",
          type: NodeType.Case,
          parent: "parent/test.py::suite2",
          properties: item3,
        },
      ])
    })
  })
  describe.concurrent("tree with nested suites", () => {
    it("should return true when item is included", () => {
      const tree = makeTree()
      const item1 = makeExample()
      const item2 = evolve(item1, { name: "test_another", parent: "suite1" })
      const item3 = evolve(item1, {
        name: "test_yet_another",
        parent: "suite2::suite3",
      })
      tree.add(item1)
      tree.add(item2)
      tree.add(item3)
      expect(tree.includes(item1.node_id)).toBe(true)
      expect(tree.includes(item2.node_id)).toBe(true)
      expect(tree.includes(item3.node_id)).toBe(true)
    })
    it("should return true when item is included according to prefix", () => {
      const tree = makeTree()
      const item1 = makeExample()
      const item2 = evolve(item1, { name: "test_another", parent: "suite1" })
      const item3 = evolve(item1, {
        name: "test_yet_another",
        parent: "suite2::suite3",
      })
      tree.add(item1)
      tree.add(item2)
      tree.add(item3)
      expect(tree.includes(item1.node_id, "parent")).toBe(true)
      expect(tree.includes(item2.node_id, "parent")).toBe(true)
      expect(tree.includes(item3.node_id, "parent")).toBe(true)
      expect(tree.includes(item2.node_id, "parent/test.py::suite1")).toBe(true)
      expect(tree.includes(item3.node_id, "parent/test.py::suite2")).toBe(true)
      expect(
        tree.includes(item3.node_id, "parent/test.py::suite2::suite3"),
      ).toBe(true)
    })
    it("should return false when item is not included according to prefix", () => {
      const tree = makeTree()
      const item1 = makeExample()
      const item2 = evolve(item1, { name: "test_another", parent: "suite1" })
      const item3 = evolve(item1, {
        name: "test_yet_another",
        parent: "suite2::suite3",
      })
      tree.add(item1)
      tree.add(item2)
      tree.add(item3)
      expect(tree.includes(item1.node_id, "parent")).toBe(true)
      expect(tree.includes(item2.node_id, "parent")).toBe(true)
      expect(tree.includes(item3.node_id, "parent")).toBe(true)
      expect(tree.includes(item3.node_id, "parent/test.py::suite1")).toBe(false)
      expect(tree.includes(item2.node_id, "parent/test.py::suite2")).toBe(false)
      expect(
        tree.includes(item3.node_id, "parent/test.py::suite2::suite4"),
      ).toBe(false)
    })
    it("should return the list of names", () => {
      const tree = makeTree()
      const item1 = makeExample()
      const item2 = evolve(item1, { name: "test_another", parent: "suite1" })
      const item3 = evolve(item1, {
        name: "test_yet_another",
        parent: "suite2::suite3",
      })
      tree.add(item1)
      tree.add(item2)
      tree.add(item3)
      expect(tree.list().map((item) => item.path)).toStrictEqual([
        "parent",
        "parent/test.py",
        "parent/test.py::test_something",
        "parent/test.py::suite1",
        "parent/test.py::suite1::test_another",
        "parent/test.py::suite2",
        "parent/test.py::suite2::suite3",
        "parent/test.py::suite2::suite3::test_yet_another",
      ])
    })
    it("should return the list of nodes", () => {
      const tree = makeTree()
      const item1 = makeExample()
      const item2 = evolve(item1, { name: "test_another", parent: "suite1" })
      const item3 = evolve(item1, {
        name: "test_yet_another",
        parent: "suite2::suite3",
      })
      tree.add(item1)
      tree.add(item2)
      tree.add(item3)
      expect(tree.list()).toStrictEqual([
        {
          name: "parent",
          path: "parent",
          type: NodeType.Directory,
          parent: undefined,
        },
        {
          name: "test.py",
          path: "parent/test.py",
          type: NodeType.File,
          parent: "parent",
        },
        {
          name: "test_something",
          path: "parent/test.py::test_something",
          type: NodeType.Case,
          parent: "parent/test.py",
          properties: item1,
        },
        {
          path: "parent/test.py::suite1",
          type: NodeType.Suite,
          parent: "parent/test.py",
          name: "suite1",
        },
        {
          name: "test_another",
          path: "parent/test.py::suite1::test_another",
          type: NodeType.Case,
          parent: "parent/test.py::suite1",
          properties: item2,
        },
        {
          path: "parent/test.py::suite2",
          type: NodeType.Suite,
          parent: "parent/test.py",
          name: "suite2",
        },
        {
          path: "parent/test.py::suite2::suite3",
          type: NodeType.Suite,
          parent: "parent/test.py::suite2",
          name: "suite3",
        },
        {
          name: "test_yet_another",
          path: "parent/test.py::suite2::suite3::test_yet_another",
          type: NodeType.Case,
          parent: "parent/test.py::suite2::suite3",
          properties: item3,
        },
      ])
    })
  })
  describe.concurrent("tree with parametrization within suite", () => {
    it("should return nodes", () => {
      const tree = makeTree()
      const item = evolve(makeExample(), {
        name: "test_another[a-b]",
        parent: "suite1",
      })
      tree.add(item)
      expect(tree.list()).toStrictEqual([
        {
          name: "parent",
          path: "parent",
          type: NodeType.Directory,
          parent: undefined,
        },
        {
          name: "test.py",
          path: "parent/test.py",
          type: NodeType.File,
          parent: "parent",
        },
        {
          path: "parent/test.py::suite1",
          type: NodeType.Suite,
          parent: "parent/test.py",
          name: "suite1",
        },
        {
          name: "test_another[a-b]",
          path: "parent/test.py::suite1::test_another[a-b]",
          type: NodeType.Case,
          parent: "parent/test.py::suite1",
          properties: item,
        },
      ])
    })
  })
})
