import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js"

import "./SettingsButton.css"

interface SettingsButtonProps {
  onClick: () => void
}

export const SettingsButton = ({ onClick }: SettingsButtonProps) => (
  <SlButton
    className="floating-button"
    aria-label="Settings"
    variant="default"
    onClick={onClick}
  >
    Settings
  </SlButton>
)
