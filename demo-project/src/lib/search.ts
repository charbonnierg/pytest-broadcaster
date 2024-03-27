import MiniSearch from "minisearch"

const SEARCH_FIELDS = ["function", "parent", "module", "file", "doc", "name", "markers"]

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

export const newSearchEngine = () => {
  let miniSearch = new MiniSearch({
    fields: SEARCH_FIELDS, // fields to index for full-text search
    storeFields: STORE_FIELDS, // fields to return with search results
  })
  return miniSearch
}
