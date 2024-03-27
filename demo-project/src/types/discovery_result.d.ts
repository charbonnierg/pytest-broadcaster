/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Pytest Discover Result
 */
export interface DiscoveryResult {
  /**
   * The version of pytest that generated the report
   */
  pytest_version: string
  /**
   * The version of the plugin that generated the report
   */
  plugin_version: string
  /**
   * The exit status of the pytest run
   */
  exit_status: number
  /**
   * Errors generated during the discovery process
   */
  errors: ErrorMessage[]
  /**
   * Warnings generated during the discovery process
   */
  warnings: WarningMessage[]
  /**
   * The collected items
   */
  items: TestItem[]
  [k: string]: unknown
}
/**
 * An error message
 */
export interface ErrorMessage {
  /**
   * The event type
   */
  event: "ErrorMessage"
  /**
   * When the error message is emitted
   */
  when: "config" | "collect" | "runtest"
  /**
   * The filename of the file where the error message is emitted
   */
  filename: string
  /**
   * The line number of the file where the error message is emitted
   */
  lineno: number
  /**
   * The exception type
   */
  exception_type: string
  /**
   * The exception value
   */
  exception_value: string
  [k: string]: unknown
}
/**
 * A warning message
 */
export interface WarningMessage {
  /**
   * The event type
   */
  event: "WarningMessage"
  /**
   * When the warning message is emitted
   */
  when: "config" | "collect" | "runtest"
  /**
   * The filename of the file where the warning message is emitted
   */
  filename: string
  /**
   * The line number of the file where the warning message is emitted
   */
  lineno: number
  /**
   * The category of the warning message
   */
  category?: string
  /**
   * The warning message
   */
  message: string
  [k: string]: unknown
}
/**
 * Pytest Test Item
 */
export interface TestItem {
  /**
   * Node ID
   */
  node_id: string
  /**
   * File path
   */
  file?: string
  /**
   * Module name
   */
  module?: string
  /**
   * Class name
   */
  parent?: string
  /**
   * Function name
   */
  function?: string
  /**
   * Test Name
   */
  name: string
  /**
   * Test docstring
   */
  doc: string
  /**
   * Test markers
   */
  markers: string[]
  /**
   * Test parameters names and types
   */
  parameters: {
    [k: string]: string
  }
  [k: string]: unknown
}