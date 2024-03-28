/* search.ts exposes utilities to search items based on search criteria.*/
import MiniSearch, {
  type MatchInfo,
  type Options,
  type SearchOptions as _SearchOptions,
} from "minisearch"

import type { TestItem } from "../types/test_item"

// The fields to index for full-text search.
const SEARCH_FIELDS = [
  "function",
  "parent",
  "module",
  "file",
  "doc",
  "name",
  "markers",
  "node_id",
]

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

export interface SearchDocument extends TestItem {
  id: string
}

export interface SearchResult extends SearchDocument {
  terms: string[]
  queryTerms: string[]
  score: number
  match: MatchInfo
}

export interface SearchOpts {
  limit: number
  boost: { [key: keyof TestItem]: number }
  filter: (result: SearchResult) => boolean
}

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

export const search = (
  engine: MiniSearch<TestItem>,
  terms: string,
  options: SearchOpts,
): SearchResult[] => {
  return engine.search(terms, options as unknown as _SearchOptions) as SearchResult[]
}

export const sanitize = (item: TestItem): SearchDocument => {
  const { node_id, ...rest } = item
  return {
    id: node_id,
    node_id: node_id,
    ...rest,
  }
}
