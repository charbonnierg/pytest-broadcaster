import { describe, expect, it } from "vitest"

import type { TestItem } from "../types/test_item"
import { NodeType, makeNodes, makeView } from "./files"

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
    it("should return the list of nodes", () => {
      expect(makeNodes()).toStrictEqual([])
      const item = makeExample()
      expect(makeNodes(item)).toStrictEqual([
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
    it("should return the view", () => {
      const item = makeExample()
      const nodes = makeNodes(item)
      const view = makeView(nodes)
      expect(view).toStrictEqual([
        {
          type: NodeType.Directory,
          path: "parent",
          name: "parent",
          directories: [],
          files: [
            {
              type: NodeType.File,
              path: "parent/test.py",
              name: "test.py",
              suites: [],
              matrices: [],
              cases: [
                {
                  type: NodeType.Case,
                  path: "parent/test.py::test_something",
                  name: "test_something",
                  parent: "parent/test.py",
                  properties: item,
                },
              ],
            },
          ],
        },
      ])
    })
  })
  describe.concurrent("tree with multiple nested directories", () => {
    it("should return the list of nodes", () => {
      const item = {
        file: "parent/test.py",
        node_id: "parent/test.py::test_something",
        name: "test_something",
        doc: "A test item",
        markers: ["marker1", "marker2"],
        parameters: {},
      } as TestItem
      const item2 = evolve(item, { file: "another_parent/another.py" })
      const item3 = evolve(item, { file: "yet_another_parent/yet_another.py" })
      expect(makeNodes(item, item2, item3)).toStrictEqual([
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
        {
          name: "another_parent",
          path: "another_parent",
          type: NodeType.Directory,
          parent: undefined,
        },
        {
          name: "another.py",
          path: "another_parent/another.py",
          type: NodeType.File,
          parent: "another_parent",
        },
        {
          name: "test_something",
          path: "another_parent/another.py::test_something",
          type: NodeType.Case,
          parent: "another_parent/another.py",
          properties: item2,
        },
        {
          name: "yet_another_parent",
          path: "yet_another_parent",
          type: NodeType.Directory,
          parent: undefined,
        },
        {
          name: "yet_another.py",
          path: "yet_another_parent/yet_another.py",
          type: NodeType.File,
          parent: "yet_another_parent",
        },
        {
          name: "test_something",
          path: "yet_another_parent/yet_another.py::test_something",
          type: NodeType.Case,
          parent: "yet_another_parent/yet_another.py",
          properties: item3,
        },
      ])
    })
    it("should return the view", () => {
      const item0 = makeExample()
      const item1 = evolve(item0, {
        file: "parent/another_with_same_parent.py",
      })
      const item2 = evolve(item0, { file: "another_parent/another.py" })
      const item3 = evolve(item0, { file: "yet_another_parent/yet_another.py" })
      const item4 = evolve(item0, {
        file: "yet_another_parent/child/another_child.py",
      })
      const item5 = evolve(item0, {
        file: "yet_another_parent/yet_another_child/yet_another_child.py",
      })
      const nodes = makeNodes(item0, item1, item2, item3, item4, item5)
      expect(makeView(nodes)).toStrictEqual([
        {
          type: NodeType.Directory,
          path: "parent",
          name: "parent",
          directories: [],
          files: [
            {
              type: NodeType.File,
              path: "parent/test.py",
              name: "test.py",
              suites: [],
              matrices: [],
              cases: [
                {
                  type: NodeType.Case,
                  path: "parent/test.py::test_something",
                  name: "test_something",
                  parent: "parent/test.py",
                  properties: item0,
                },
              ],
            },
            {
              type: NodeType.File,
              path: "parent/another_with_same_parent.py",
              name: "another_with_same_parent.py",
              suites: [],
              matrices: [],
              cases: [
                {
                  type: NodeType.Case,
                  path: "parent/another_with_same_parent.py::test_something",
                  name: "test_something",
                  parent: "parent/another_with_same_parent.py",
                  properties: item1,
                },
              ],
            },
          ],
        },
        {
          type: NodeType.Directory,
          path: "another_parent",
          name: "another_parent",
          directories: [],
          files: [
            {
              type: NodeType.File,
              path: "another_parent/another.py",
              name: "another.py",
              suites: [],
              matrices: [],
              cases: [
                {
                  type: NodeType.Case,
                  path: "another_parent/another.py::test_something",
                  name: "test_something",
                  parent: "another_parent/another.py",
                  properties: item2,
                },
              ],
            },
          ],
        },
        {
          type: NodeType.Directory,
          path: "yet_another_parent",
          name: "yet_another_parent",
          directories: [
            {
              type: NodeType.Directory,
              path: "yet_another_parent/child",
              name: "child",
              directories: [],
              files: [
                {
                  type: NodeType.File,
                  path: "yet_another_parent/child/another_child.py",
                  name: "another_child.py",
                  suites: [],
                  matrices: [],
                  cases: [
                    {
                      type: NodeType.Case,
                      path: "yet_another_parent/child/another_child.py::test_something",
                      name: "test_something",
                      parent: "yet_another_parent/child/another_child.py",
                      properties: item4,
                    },
                  ],
                },
              ],
            },
            {
              type: NodeType.Directory,
              path: "yet_another_parent/yet_another_child",
              name: "yet_another_child",
              directories: [],
              files: [
                {
                  type: NodeType.File,
                  path: "yet_another_parent/yet_another_child/yet_another_child.py",
                  name: "yet_another_child.py",
                  suites: [],
                  matrices: [],
                  cases: [
                    {
                      type: NodeType.Case,
                      path: "yet_another_parent/yet_another_child/yet_another_child.py::test_something",
                      name: "test_something",
                      parent:
                        "yet_another_parent/yet_another_child/yet_another_child.py",
                      properties: item5,
                    },
                  ],
                },
              ],
            },
          ],
          files: [
            {
              type: NodeType.File,
              path: "yet_another_parent/yet_another.py",
              name: "yet_another.py",
              suites: [],
              matrices: [],
              cases: [
                {
                  type: NodeType.Case,
                  path: "yet_another_parent/yet_another.py::test_something",
                  name: "test_something",
                  parent: "yet_another_parent/yet_another.py",
                  properties: item3,
                },
              ],
            },
          ],
        },
      ])
    })
  })
  describe.concurrent("tree with multiple items", () => {
    it("should return the list of nodes", () => {
      const item1 = makeExample()
      const item2 = evolve(item1, { name: "test_another" })
      const item3 = evolve(item1, { name: "test_yet_another" })
      expect(makeNodes(item1, item2, item3)).toStrictEqual([
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
    it("should return the list of nodes", () => {
      const item1 = makeExample()
      const item2 = evolve(item1, { name: "test_another", parent: "suite1" })
      const item3 = evolve(item1, {
        name: "test_yet_another",
        parent: "suite2",
      })
      expect(makeNodes(item1, item2, item3)).toStrictEqual([
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
    it("should return the list of nodes", () => {
      const item1 = makeExample()
      const item2 = evolve(item1, { name: "test_another", parent: "suite1" })
      const item3 = evolve(item1, {
        name: "test_yet_another",
        parent: "suite2::suite3",
      })
      expect(makeNodes(item1, item2, item3)).toStrictEqual([
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
      const item = evolve(makeExample(), {
        name: "test_another[a-b]",
        parent: "suite1",
      })
      expect(makeNodes(item)).toStrictEqual([
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
