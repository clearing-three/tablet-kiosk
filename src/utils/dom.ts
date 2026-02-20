export function getElement<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id)
  if (!el) throw new Error(`Required DOM element not found: #${id}`)
  return el as T
}
