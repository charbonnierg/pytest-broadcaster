import SlSpinner from "@shoelace-style/shoelace/dist/react/spinner/index.js"
import { useEffect, useState } from "react"

import type { TestItem } from "../../../types/discovery_result"
import TestItemPreview from "../test-item-preview/TestItemPreview"
import "./SearchResult.css"

// Check if at bottom of an element
const isAtBottom = (el: HTMLElement): boolean =>
  Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 1

interface SearchResultsProps {
  items: TestItem[]
  pageSize: number
  onItemClicked: (item: TestItem) => void
}

const LoadingIndicator = ({ loading }: { loading: boolean }) => {
  return <SlSpinner className="loader" data-loading={loading} />
}

export const SearchResults = ({
  items,
  pageSize,
  onItemClicked,
}: SearchResultsProps) => {
  // Create a state to hold displayed items
  const [displayed, setDisplayed] = useState<TestItem[]>(
    items.slice(0, pageSize),
  )
  // Create a state to hold offset and loading state
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  // Handle scroll event by increasing offset when at bottom
  const handleScroll = () =>
    isAtBottom(document.documentElement) && setOffset(offset + pageSize)
  // Increase on scroll down
  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  })
  // Load more items on offset change
  useEffect(() => {
    if (offset > 0) {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }
    setTimeout(() => {
      setDisplayed(items.slice(0, offset + pageSize))
    }, 500)
  }, [offset, items, pageSize])
  // Render
  return (
    <div>
      <LoadingIndicator loading={loading}></LoadingIndicator>
      <ul role="list" className="card-grid">
        {displayed.map((item) => (
          <TestItemPreview
            key={item.node_id}
            properties={item}
            onClick={onItemClicked}
          />
        ))}
        <div></div>
      </ul>
    </div>
  )
}
