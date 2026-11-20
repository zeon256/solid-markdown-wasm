import { type IconNode, createElement } from "lucide";

/** Build a decorative Lucide SVG; the surrounding control carries the label. */
export const createIcon = (icon: IconNode, size: number): SVGElement =>
  createElement(icon, { width: size, height: size, "aria-hidden": "true" });

/** Replace `target`'s contents with a Lucide icon. */
export const setIcon = (target: Element, icon: IconNode, size: number) => {
  target.replaceChildren(createIcon(icon, size));
};
