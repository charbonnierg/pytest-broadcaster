import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js"

import "./PaginationControl.css"

export const PaginationControl = ({
  prev,
  next,
}: {
  prev: () => void
  next: () => void
}) => (
  <div className="control-buttons">
    <SlButton variant="default" onClick={prev}>
      Prev
    </SlButton>
    <SlButton variant="default" onClick={next}>
      Next
    </SlButton>
  </div>
)
