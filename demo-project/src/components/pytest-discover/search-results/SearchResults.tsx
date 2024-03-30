import type { TestItem } from "../../../types/discovery_result"
import TestItemPreview from "../test-item-preview/TestItemPreview"
import "./SearchResult.css"

interface SearchResultsProps {
  items: TestItem[]
  onItemClicked: (item: TestItem) => void
}

export const SearchResults = ({ items, onItemClicked }: SearchResultsProps) => (
  <ul role="list" className="card-grid">
    {items.map((item) => (
      <TestItemPreview key={item.node_id} properties={item} onClick={onItemClicked} />
    ))}
    <div></div>
  </ul>
)
