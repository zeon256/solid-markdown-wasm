import { type IconNode, createElement } from "lucide";
import type { Component } from "solid-js";

interface IconProps {
  icon: IconNode;
  size: number;
}

/** Decorative Lucide icon; the surrounding control carries the label. */
export const Icon: Component<IconProps> = (props) => (
  <>
    {createElement(props.icon, {
      width: props.size,
      height: props.size,
      "aria-hidden": "true",
    })}
  </>
);
