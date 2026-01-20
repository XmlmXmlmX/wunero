/**
 * Defines common properties for all organisms.
 * The generic T allows specifying the HTML element type.
 * Default is HTMLElement.
 */
export type WuOrganism<T = HTMLElement, TAttributes = React.HTMLAttributes<T>> = TAttributes;