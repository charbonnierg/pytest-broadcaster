import type { TestItem as TestItemProperties } from "../../types/test_item"
import "./TestItemDetails.css"
import {
  formatFile,
  formatMarkers,
  formatModule,
  formatName,
  formatNodeId,
  formatParameters,
  formatParent,
} from "./format"

export interface TestItemDetailsProps {
  properties: TestItemProperties
}

export const TestItemDetails = (item: TestItemDetailsProps) => {
  return (
    <>
      <h2>{formatNodeId(item.properties)}</h2>
      <h3>{formatName(item.properties)}</h3>
      <p>{item.properties.name}</p>
      <div>
        <h3>Metadata</h3>
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
        <h3>Description</h3>
        <p>{item.properties.doc}</p>
      </div>
    </>
  )
}

export default TestItemDetails
