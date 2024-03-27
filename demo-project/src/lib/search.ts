import MiniSearch from "minisearch"

const SEARCH_FIELDS = [
  "function",
  "parent",
  "module",
  "file",
  "doc",
  "name",
  "markers",
  "pameters",
  "id",
]

export const newSearchEngine = () => {
  let miniSearch = new MiniSearch({
    fields: SEARCH_FIELDS, // fields to index for full-text search
    storeFields: SEARCH_FIELDS, // fields to return with search results
  })
  return miniSearch
}
