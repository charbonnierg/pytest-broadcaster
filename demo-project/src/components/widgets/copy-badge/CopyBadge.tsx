import { SlIcon } from "@shoelace-style/shoelace/dist/react"
import SlTag from "@shoelace-style/shoelace/dist/react/tag/index.js"

import { copy } from "../../../lib/clipboard"
import "./CopyBadge.css"

/* Format a file name */
export const CopyBadge = ({
  value,
  icon,
}: {
  value?: string
  icon: string
}): JSX.Element | null => {
  if (value == null || value == "") {
    return null
  }
  return (
    <p className="copy-badge-widget">
      <SlTag onClick={copy(value)}>
        <SlIcon name={icon}></SlIcon>
        {value}
      </SlTag>
    </p>
  )
}
