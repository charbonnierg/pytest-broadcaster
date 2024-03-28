import type { TestItem } from "../../../types/discovery_result"
import TestItemPreview from "../test-item-preview/TestItemPreview"
import "./SearchResult.css"

export const SearchResults = ({
  items,
  onItemClicked,
}: {
  items: TestItem[]
  onItemClicked: (item: TestItem) => void
}) => (
  <ul role="list" className="card-grid">
    {items.map((item) => (
      <TestItemPreview key={item.node_id} properties={item} onClick={onItemClicked} />
    ))}
    <div></div>
  </ul>
)
