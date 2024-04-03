import SlAnimation from "@shoelace-style/shoelace/dist/react/animation/index.js"
import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js"
import SlSpinner from "@shoelace-style/shoelace/dist/react/spinner/index.js"
import { useEffect, useState } from "react"

import type { TestCase } from "../../../../types/test_case"
import TestItemCard from "../test-item-card/TestItemCard"
import "./TestItemGrid.css"

// Check if at bottom of an element
const isAtBottom = (el: Element | null): boolean => {
  if (el == null) {
    return false
  }
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
  const scrollHeight = el.scrollHeight
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop
  const scrollTop = el.scrollTop
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/clientHeight
  const clientHeight = el.clientHeight
  return Math.abs(scrollHeight - scrollTop - clientHeight) < 1
}
interface TestItemGridProps {
  items: TestCase[]
  pageSize: number
  onItemClicked: (item: TestCase) => void
}

const LoadingIndicator = ({ loading }: { loading: boolean }) => {
  return (
    <SlAnimation playbackRate={1.5} name="tada" duration={3600} play={loading}>
      <SlSpinner className="loader" data-loading={loading} />
    </SlAnimation>
  )
}

export const TestItemGrid = ({
  items,
  pageSize,
  onItemClicked,
}: TestItemGridProps) => {
  const delay = 1000
  // Create a state to hold displayed items
  const [displayed, setDisplayed] = useState<TestCase[]>(
    items.slice(0, pageSize),
  )
  // Create a state to hold offset and loading state
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [position, setPosition] = useState(0)

  const handleGoUp = () => {
    const scrollParent = window.document.querySelector(".main-container")
    scrollParent?.scrollTo({ top: 0, behavior: "smooth" })
  }
  // Increase on scroll down
  useEffect(() => {
    const scrollParent = window.document.querySelector(".main-container")
    if (scrollParent == null) {
      throw new Error("Could not find scroll parent")
    }
    // Handle scroll event by increasing offset when at bottom
    const handleScroll = () => {
      setPosition(scrollParent.scrollTop)
      if (!isAtBottom(scrollParent)) {
        return
      }
      setOffset(offset + pageSize)
    }
    console.log("Adding scroll event listener for search result")
    if (scrollParent == null) {
      return
    }
    const el = scrollParent
    el.addEventListener("scroll", handleScroll)
    return () => {
      console.log("Removing scroll event listener for search result")
      el.removeEventListener("scroll", handleScroll)
    }
  })
  // Reset offset when items change
  useEffect(() => {
    setOffset(0)
  }, [items])
  // Load more items on offset change
  useEffect(() => {
    if (offset > 0) {
      if (offset + pageSize > items.length) {
        return
      }
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        setDisplayed(items.slice(0, offset + pageSize))
      }, delay)
      return
    }
    setDisplayed(items.slice(0, pageSize))
  }, [offset, items, pageSize])
  // Render
  return (
    <div>
      {!loading && (
        <SlButton
          onClick={handleGoUp}
          className="go-up"
          style={{ display: position > 100 ? "block" : "none" }}
        >
          Go up
        </SlButton>
      )}
      <LoadingIndicator loading={loading}></LoadingIndicator>
      <ul role="list" className="card-grid">
        {displayed.map((item) => (
          <TestItemCard
            key={item.node_id}
            properties={item}
            onClick={onItemClicked}
          />
        ))}
      </ul>
    </div>
  )
}
