import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button/index.js"
import { createElement } from "react"

export const ActionLabel = ({
  value,
  icon,
  onClick,
  as,
}: {
  value: string | null
  icon: string
  onClick: () => void
  as?: string
}) => {
  if (value == null) {
    return null
  }
  return createElement(as || "div", {
    className: "action-label",
    children: [
      <span className="action-label-value">{value}</span>,
      <SlIconButton
        className="action-label-icon"
        name={icon}
        onClick={onClick}
      ></SlIconButton>,
    ],
  })
}
