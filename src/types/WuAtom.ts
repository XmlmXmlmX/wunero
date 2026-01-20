/**
 * Defines common properties for all atoms.
 * The generic T allows specifying the HTML element type.
 * Default is HTMLElement.
 */
export type WuAtom<T = HTMLElement, TAttributes = React.HTMLAttributes<T>> = TAttributes;