import { SlIcon } from "@shoelace-style/shoelace/dist/react"
import SlTag from "@shoelace-style/shoelace/dist/react/tag/index.js"

import { copy } from "../../../../lib/clipboard"
import { sanitizeName } from "../../../../lib/files"
import type { TestCase } from "../../../../types/test_case"
import { CopyBadge } from "../../../widgets/copy-badge/CopyBadge"
import { MarkersList } from "../markers-list/MarkersList"
import "./TestItemDetails.css"

interface TestItemDetailsProps {
  item: TestCase | null
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
                <CopyBadge value={item.path} icon="filetype-py" />
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
const formatNodeId = (item: TestCase): JSX.Element => {
  return <CopyBadge value={item.node_id} icon="tag" />
}

/* Format a test item module name */
const formatModule = (item: TestCase): JSX.Element | null => {
  if (item.module == null || item.module == "") {
    return null
  }
  return <CopyBadge value={item.module} icon="box" />
}

/* Format a test item parent name */
const formatParent = (item: TestCase): JSX.Element | null => {
  if (item.suite == null || item.suite == "") {
    return null
  }
  return (
    <>
      <SlTag onClick={copy(item.suite)}>
        <SlIcon name="diagram-2"></SlIcon>
        {item.suite}
      </SlTag>
    </>
  )
}

/* Format a test item parameters */
const formatParameters = (item: TestCase): JSX.Element | null => {
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
