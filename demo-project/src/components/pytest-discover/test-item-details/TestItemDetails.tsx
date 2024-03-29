import type { TestItem } from "../../../types/test_item"
import {
  formatFile,
  formatMarkers,
  formatModule,
  formatNodeId,
  formatParameters,
  formatParent,
  sanitizeName,
} from "../format"
import "./TestItemDetails.css"

interface TestItemDetailsProps {
  properties: TestItem
}

export const TestItemDetails = (item: TestItemDetailsProps) => {
  return (
    <>
      <h2>{formatNodeId(item.properties)}</h2>
      <h3>{sanitizeName(item.properties)}</h3>
      <p>{item.properties.name}</p>
      <div>
        <table>
          <tbody>
            <tr>
              <td>{formatMarkers(item.properties)}</td>
            </tr>
            <tr>
              <td>{formatParameters(item.properties)}</td>
            </tr>
            <tr>
              <td>{formatFile(item.properties)}</td>
            </tr>
            <tr>
              <td>{formatModule(item.properties)}</td>
            </tr>
            <tr>
              <td>{formatParent(item.properties)}</td>
            </tr>
          </tbody>
        </table>
        {item.properties.doc != "" && (
          <>
            <h3>Description</h3>
            <p>{item.properties.doc}</p>
          </>
        )}
      </div>
    </>
  )
}

export default TestItemDetails
