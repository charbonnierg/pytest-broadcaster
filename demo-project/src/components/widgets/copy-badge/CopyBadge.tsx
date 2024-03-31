import { SlIcon } from "@shoelace-style/shoelace/dist/react"
import SlTag from "@shoelace-style/shoelace/dist/react/tag/index.js"

import { copy } from "../../../lib/clipboard"
import "./CopyBadge.css"

/* Format a file name */
export const CopyBadge = ({
  label,
  value,
  icon,
}: {
  value?: string
  label?: string
  icon: string
}): JSX.Element | null => {
  if (value == null || value == "") {
    return null
  }
  return (
    <p className="copy-badge-widget">
      <SlTag onClick={copy(value)}>
        <SlIcon name={icon}></SlIcon>
        {label == null ? value : label}
      </SlTag>
    </p>
  )
}
