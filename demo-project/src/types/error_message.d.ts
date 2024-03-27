/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * An error message
 */
export interface ErrorMessage {
  /**
   * The event type
   */
  event: "ErrorMessage";
  /**
   * When the error message is emitted
   */
  when: "config" | "collect" | "runtest";
  /**
   * The filename of the file where the error message is emitted
   */
  filename: string;
  /**
   * The line number of the file where the error message is emitted
   */
  lineno: number;
  /**
   * The exception type
   */
  exception_type: string;
  /**
   * The exception value
   */
  exception_value: string;
  [k: string]: unknown;
}
