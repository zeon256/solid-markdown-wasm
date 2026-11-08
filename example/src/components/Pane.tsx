import * as stylex from "@stylexjs/stylex";
import type { Component, JSX } from "solid-js";
import { color } from "../tokens.stylex";

const styles = stylex.create({
  pane: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    minHeight: 0,
    backgroundColor: color.bg,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    height: 36,
    flexShrink: 0,
    paddingInline: 16,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: color.borderMuted,
    fontSize: 12,
    color: color.muted,
  },
  title: {
    margin: 0,
    fontSize: "inherit",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  meta: {
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  body: {
    position: "relative",
    flexGrow: 1,
    minHeight: 0,
  },
});

interface PaneProps {
  title: string;
  meta: JSX.Element;
  xstyle?: stylex.StyleXStyles;
  children: JSX.Element;
}

export const Pane: Component<PaneProps> = (props) => (
  <section
    aria-label={props.title}
    {...stylex.attrs(styles.pane, props.xstyle)}
  >
    <div {...stylex.attrs(styles.header)}>
      <h2 {...stylex.attrs(styles.title)}>{props.title}</h2>
      <span {...stylex.attrs(styles.meta)}>{props.meta}</span>
    </div>
    <div {...stylex.attrs(styles.body)}>{props.children}</div>
  </section>
);
