import * as stylex from "@stylexjs/stylex";

// Colors alias the theme variables in example-shared/styles/base.css, so the
// app chrome and the rendered markdown share one light/dark palette. They
// resolve on <html>, which is where App sets `data-theme`.
//
// defineVars (not defineConsts) on purpose: consts are substituted when the
// StyleX dev server stitches its stylesheet, and fail if a consumer module is
// compiled before this one. Media queries live beside the styles that use them
// for the same reason.
export const color = stylex.defineVars({
  fg: "var(--fgColor-default)",
  muted: "var(--fgColor-muted)",
  accent: "var(--fgColor-accent)",
  bg: "var(--bgColor-default)",
  surface: "var(--bgColor-muted)",
  hover: "var(--bgColor-neutral-muted)",
  border: "var(--borderColor-default)",
  borderMuted: "var(--borderColor-muted)",
  focus: "var(--borderColor-accent-emphasis)",
});

export const font = stylex.defineVars({
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
});
