import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js"

import "./PaginationControl.css"

interface PaginationControlProps {
  prev: () => void
  next: () => void
}

export const PaginationControl = ({ prev, next }: PaginationControlProps) => (
  <div className="control-buttons">
    <SlButton variant="default" onClick={prev}>
      Prev
    </SlButton>
    <SlButton variant="default" onClick={next}>
      Next
    </SlButton>
  </div>
)
