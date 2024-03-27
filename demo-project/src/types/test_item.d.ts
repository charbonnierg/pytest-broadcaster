/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Pytest Test Item
 */
export interface TestItem {
  /**
   * Node ID
   */
  node_id: string;
  /**
   * File path
   */
  file?: string;
  /**
   * Module name
   */
  module?: string;
  /**
   * Class name
   */
  parent?: string;
  /**
   * Function name
   */
  function?: string;
  /**
   * Test Name
   */
  name: string;
  /**
   * Test docstring
   */
  doc: string;
  /**
   * Test markers
   */
  markers: string[];
  /**
   * Test parameters names and types
   */
  parameters: {
    [k: string]: string;
  };
  [k: string]: unknown;
}
