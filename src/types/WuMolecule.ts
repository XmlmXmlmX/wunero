/**
 * Defines common properties for all molecules.
 * The generic T allows specifying the HTML element type.
 * Default is HTMLElement.
 */
export type WuMolecule<T = HTMLElement, TAttributes = React.HTMLAttributes<T>> = TAttributes;