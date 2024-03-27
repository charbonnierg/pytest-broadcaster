export interface WarningMessageProperties {}

export interface ErrorMessageProperties {}

export interface TestItemProperties {
  id: string
  name: string
  markers: string[]
  parameters: Record<string, string>
  file: string | null
  module: string | null
  doc: string
  parent: string | null
}

export interface TestResult {
  items: TestItemProperties[]
  exit_status: number
  pytest_version: string
  plugin_version: string
  warnings: WarningMessageProperties[]
  errors: ErrorMessageProperties[]
}
