import * as stylex from "@stylexjs/stylex";
import type { Component } from "solid-js";
import { color } from "../tokens.stylex";

const spin = stylex.keyframes({
  to: { transform: "rotate(360deg)" },
});

const styles = stylex.create({
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    minHeight: 160,
  },
  ring: {
    width: 28,
    height: 28,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: color.border,
    borderTopColor: color.accent,
    borderRadius: "50%",
    animationName: spin,
    animationDuration: "0.8s",
    animationIterationCount: "infinite",
    animationTimingFunction: "linear",
  },
});

interface SpinnerProps {
  label: string;
}

export const Spinner: Component<SpinnerProps> = (props) => (
  <output {...stylex.attrs(styles.center)} aria-label={props.label}>
    <div {...stylex.attrs(styles.ring)} />
  </output>
);
