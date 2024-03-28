/* search.ts exposes utilities to search items based on search criteria.*/
import MiniSearch, { type Options } from "minisearch"

import type { TestItem } from "../types/test_item"

// The fields to index for full-text search.
const SEARCH_FIELDS = ["function", "parent", "module", "file", "doc", "name", "markers"]

// The fields to store in the storage engine.
const STORE_FIELDS = [
  "function",
  "parent",
  "module",
  "file",
  "doc",
  "name",
  "markers",
  "parameters",
  "node_id",
]

/* Create a new search engine instance.*/
export const newSearchEngine = (): MiniSearch<TestItem> => {
  // Define search engine options.
  const options = {
    // fields to index for full-text search.
    fields: SEARCH_FIELDS,
    // fields to return with search results.
    storeFields: STORE_FIELDS,
  } as Options<TestItem>
  // Return a new MiniSearch instance.
  return new MiniSearch<TestItem>(options)
}
