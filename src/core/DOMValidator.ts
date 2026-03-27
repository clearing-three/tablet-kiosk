export class DOMValidator {
  validate(elementIds: string[]): { valid: boolean, missing: string[] } {
    const missing: string[] = []

    for (const id of elementIds) {
      if (!document.getElementById(id)) {
        missing.push(id)
      }
    }

    return { valid: missing.length === 0, missing }
  }
}
