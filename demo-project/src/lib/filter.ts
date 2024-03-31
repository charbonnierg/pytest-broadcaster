/* filter.ts exposes utilities to filter items based on inclusion/exclusion criteria.*/

// Options required by the IncludeExcludeFilter interface.
export interface IncludeExcludeOptions<T> {
  setInclude: (value: T[]) => void
  setExclude: (value: T[]) => void
}

// Status of an item in the IncludeExcludeFilter.
export type IncludedExcludeStatus = "included" | "excluded" | "neither"

// IncludeExcludeFilter is a utility to filter items based on inclusion/exclusion criteria.
export interface IncludeExcludeFilter<T> {
  toggle: (included: T[], excluded: T[], value: T) => void
  filter: (included: T[], excluded: T[], ...value: T[]) => boolean
  get: (included: T[], excluded: T[], value: T) => IncludedExcludeStatus
}

// Create a new IncludeExcludeFilter.
export const newIncludeExcludeFilter = <T>({
  setInclude,
  setExclude,
}: IncludeExcludeOptions<T>): IncludeExcludeFilter<T> => {
  return {
    toggle: (included: T[], excluded: T[], value: T) => {
      // Marker is neither included or excluded
      // So we include it
      if (!included.includes(value) && !excluded.includes(value)) {
        setInclude([...included, value])
      }
      // Marker is included so we exclude it
      else if (included.includes(value)) {
        setInclude(included.filter((v) => v !== value))
        setExclude([...excluded, value])
      }
      // Marker is exclude, so we remove it from exclusion
      else {
        setExclude(excluded.filter((v) => v !== value))
      }
    },
    filter: (included: T[], excluded: T[], ...value: T[]) => {
      // If any of the values are excluded, we return false
      if (value.some((v) => excluded.includes(v))) {
        return false
      }
      // If there are any included values, we only return true if the value is included
      if (included.length > 0) {
        return value.some((v) => included.includes(v))
      }
      // If there are no included values, we return true by default
      return true
    },
    get: (included: T[], excluded: T[], value: T) => {
      if (included.includes(value)) {
        return "included"
      }
      if (excluded.includes(value)) {
        return "excluded"
      }
      return "neither"
    },
  }
}
