import { snakeCase } from 'es-toolkit'

export function convertKeysToCamelCase(item: unknown): unknown {
  if (Array.isArray(item)) {
    return item.map((el: unknown) => convertKeysToCamelCase(el))
  }
  else if (typeof item === 'function' || item !== Object(item)) {
    return item
  }
  return Object.fromEntries(
    Object.entries(item as Record<string, unknown>).map(
      ([key, value]: [string, unknown]) => [
        key.replace(/([-_][a-z])/gi, c => c.toUpperCase().replace(/[-_]/g, '')),
        convertKeysToCamelCase(value),
      ],
    ),
  )
}

export function convertKeysToSnakeCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  const newObject: Record<string, any> = {}

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = snakeCase(key)
      newObject[newKey] = obj[key]
    }
  }

  return newObject
}
