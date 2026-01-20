/**
 * Defines common properties for all pages.
 * The generic T allows specifying the HTML element type.
 * Default is HTMLElement.
 */
export type WuPage<T = HTMLElement, TAttributes = React.HTMLAttributes<T>> = TAttributes;