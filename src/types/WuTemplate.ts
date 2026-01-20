/**
 * Defines common properties for all templates.
 * The generic T allows specifying the HTML element type.
 * Default is HTMLElement.
 */
export type WuTemplate<T = HTMLElement, TAttributes = React.HTMLAttributes<T>> = TAttributes;