import SlButton from "@shoelace-style/shoelace/dist/react/button/index.js"

import "./SettingsButton.css"

export const SettingsButton = ({ onClick }: { onClick: () => void }) => (
  <SlButton
    className="floating-button"
    aria-label="Settings"
    variant="default"
    onClick={onClick}
  >
    Settings
  </SlButton>
)
