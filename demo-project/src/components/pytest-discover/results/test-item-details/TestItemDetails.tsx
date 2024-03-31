import { SlIcon } from "@shoelace-style/shoelace/dist/react"
import SlTag from "@shoelace-style/shoelace/dist/react/tag/index.js"

import { copy } from "../../../../lib/clipboard"
import { sanitizeName } from "../../../../lib/files"
import type { TestItem } from "../../../../types/test_item"
import { CopyBadge } from "../../../widgets/copy-badge/CopyBadge"
import { MarkersList } from "../markers-list/MarkersList"
import "./TestItemDetails.css"

interface TestItemDetailsProps {
  item: TestItem | null
}

export const TestItemDetails = ({ item }: TestItemDetailsProps) => {
  if (item == null) {
    return null
  }
  return (
    <div className="test-item-details">
      <h2>{formatNodeId(item)}</h2>
      <h3>{sanitizeName(item.name)}</h3>
      <div>
        <table>
          <tbody>
            <tr>
              <td>
                <MarkersList item={item} />
              </td>
            </tr>
            <tr>
              <td>{formatParameters(item)}</td>
            </tr>
            <tr>
              <td>
                <CopyBadge value={item.file} icon="filetype-py" />
              </td>
            </tr>
            <tr>
              <td>{formatModule(item)}</td>
            </tr>
            <tr>
              <td>{formatParent(item)}</td>
            </tr>
          </tbody>
        </table>
        {item.doc != "" && (
          <>
            <h3>Description</h3>
            <p>{item.doc}</p>
          </>
        )}
      </div>
    </div>
  )
}

/* Format a test item node id */
const formatNodeId = (item: TestItem): JSX.Element => {
  return <CopyBadge value={item.node_id} icon="tag" />
}

/* Format a test item module name */
const formatModule = (item: TestItem): JSX.Element | null => {
  if (item.module == null || item.module == "") {
    return null
  }
  return <CopyBadge value={item.module} icon="box" />
}

/* Format a test item parent name */
const formatParent = (item: TestItem): JSX.Element | null => {
  if (item.parent == null || item.parent == "") {
    return null
  }
  return (
    <>
      <SlTag onClick={copy(item.parent)}>
        <SlIcon name="diagram-2"></SlIcon>
        {item.parent}
      </SlTag>
    </>
  )
}

/* Format a test item parameters */
const formatParameters = (item: TestItem): JSX.Element | null => {
  if (Object.keys(item.parameters).length === 0) {
    return null
  }
  const key = (name: string) => `${item.id}-param-${name}`
  return (
    <ul>
      {Object.entries(item.parameters).map(([name, value]) => {
        return (
          <li key={key(name)}>
            <SlTag onClick={copy(name)}>
              <SlIcon name="gear"></SlIcon>
              {name} ({value})
            </SlTag>
          </li>
        )
      })}
    </ul>
  )
}

export default TestItemDetails
