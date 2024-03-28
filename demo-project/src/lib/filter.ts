export interface IncludeExcludeOptions<T> {
  getIncluded: () => T[]
  getExcluded: () => T[]
  setInclude: (value: T[]) => void
  setExclude: (value: T[]) => void
}

export type IncludedExcludeStatus = "included" | "excluded" | "neither"

export interface IncludeExcludeFilter<T> {
  toggle: (value: T) => void
  filter: (...value: T[]) => boolean
  get: (value: T) => IncludedExcludeStatus
}

export const newIncludeExcludeFilter = <T>({
  getIncluded,
  getExcluded,
  setInclude,
  setExclude,
}: IncludeExcludeOptions<T>): IncludeExcludeFilter<T> => {
  return {
    toggle: (value: T) => {
      const included = getIncluded()
      const excluded = getExcluded()
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
    filter: (...value: T[]) => {
      // If any of the values are excluded, we return false
      const excluded = getExcluded()
      if (value.some((v) => excluded.includes(v))) {
        return false
      }
      // If there are any included values, we only return true if the value is included
      const included = getIncluded()
      if (included.length > 0) {
        return value.some((v) => included.includes(v))
      }
      // If there are no included values, we return true by default
      return true
    },
    get: (value: T) => {
      const included = getIncluded()
      const excluded = getExcluded()
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
