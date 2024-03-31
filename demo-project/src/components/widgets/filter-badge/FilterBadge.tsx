import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js"
import SlTag from "@shoelace-style/shoelace/dist/react/tag/index.js"

import type { IncludedExcludeStatus as IncludeExcludeStatus } from "../../../lib/filter"
import "./FilterBadge.css"

const variant = (
  status: IncludeExcludeStatus,
): "primary" | "success" | "neutral" | "warning" | "danger" | "text" => {
  if (status === "included") {
    return "success"
  }
  if (status === "excluded") {
    return "danger"
  }
  return "neutral"
}

const icon = (
  status: IncludeExcludeStatus,
): "bookmark-plus" | "bookmark-x" | "bookmark" => {
  if (status === "included") {
    return "bookmark-plus"
  }
  if (status === "excluded") {
    return "bookmark-x"
  }
  return "bookmark"
}

export const FilterBadge = ({
  value,
  status,
  onClick,
}: {
  value: string
  status: IncludeExcludeStatus
  onClick: (marker: string) => void
}) => {
  return (
    <SlTag
      pill
      variant={variant(status)}
      onClick={() => onClick(value)}
      data-state={status}
    >
      <SlIcon name={icon(status)}></SlIcon>
      {value}
    </SlTag>
  )
}
