import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button/index.js"
import { type ReactNode, createElement } from "react"

export const ActionLabel = ({
  value,
  disabled,
  icon,
  onClick,
  as,
}: {
  value: string | null
  icon: string
  disabled?: boolean
  onClick: () => void
  as?: string
}) => {
  if (value == null) {
    return null
  }
  const children = [] as ReactNode[]
  children.push(<span className="action-label-value">{value}</span>)
  if (disabled !== true) {
    children.push(
      <SlIconButton
        className="action-label-icon"
        name={icon}
        onClick={onClick}
      ></SlIconButton>,
    )
  }
  return createElement(as || "div", {
    className: "action-label",
    children: children,
  })
}
