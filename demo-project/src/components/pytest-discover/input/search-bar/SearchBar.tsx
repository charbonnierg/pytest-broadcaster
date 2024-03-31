import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input.js"
import SlInput, {
  type SlInputEvent,
} from "@shoelace-style/shoelace/dist/react/input/index.js"

export const SearchBar = ({
  terms,
  setTerms,
}: {
  terms: string
  setTerms: (terms: string) => void
}) => {
  return (
    <SlInput
      helpText="Enter some text"
      value={terms}
      onSlInput={(event: SlInputEvent) =>
        setTerms((event.target as SlInputElement).value)
      }
    />
  )
}
