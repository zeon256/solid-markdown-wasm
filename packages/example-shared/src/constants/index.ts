/**
 * Shared constants for solid-markdown-wasm examples
 * Used by both React and Solid example applications
 */

import type { MermaidConfig } from "mermaid";

export type MermaidTheme = "dark" | "default";

export type Themes =
  | "1337"
  | "OneHalfDark"
  | "OneHalfLight"
  | "Tomorrow"
  | "agola-dark"
  | "ascetic-white"
  | "axar"
  | "ayu-dark"
  | "ayu-light"
  | "ayu-mirage"
  | "base16-atelierdune-light"
  | "base16-ocean-dark"
  | "base16-ocean-light"
  | "bbedit"
  | "boron"
  | "charcoal"
  | "cheerfully-light"
  | "classic-modified"
  | "demain"
  | "dimmed-fluid"
  | "dracula"
  | "gray-matter-dark"
  | "green"
  | "gruvbox-dark"
  | "gruvbox-light"
  | "idle"
  | "inspired-github"
  | "ir-white"
  | "kronuz"
  | "material-dark"
  | "material-light"
  | "monokai"
  | "nord"
  | "nyx-bold"
  | "one-dark"
  | "railsbase16-green-screen-dark"
  | "solarized-dark"
  | "solarized-light"
  | "subway-madrid"
  | "subway-moscow"
  | "two-dark"
  | "visual-studio-dark"
  | "zenburn";

/** All available code highlighting themes from the Rust markdown-renderer */
export const CODE_THEMES: Themes[] = [
  "1337",
  "OneHalfDark",
  "OneHalfLight",
  "Tomorrow",
  "agola-dark",
  "ascetic-white",
  "axar",
  "ayu-dark",
  "ayu-light",
  "ayu-mirage",
  "base16-atelierdune-light",
  "base16-ocean-dark",
  "base16-ocean-light",
  "bbedit",
  "boron",
  "charcoal",
  "cheerfully-light",
  "classic-modified",
  "demain",
  "dimmed-fluid",
  "dracula",
  "gray-matter-dark",
  "green",
  "gruvbox-dark",
  "gruvbox-light",
  "idle",
  "inspired-github",
  "ir-white",
  "kronuz",
  "material-dark",
  "material-light",
  "monokai",
  "nord",
  "nyx-bold",
  "one-dark",
  "railsbase16-green-screen-dark",
  "solarized-dark",
  "solarized-light",
  "subway-madrid",
  "subway-moscow",
  "two-dark",
  "visual-studio-dark",
  "zenburn",
];

/** Available Monaco editor themes */
export const EDITOR_THEMES = [
  { value: "vs", label: "Light" },
  { value: "vs-dark", label: "Dark" },
  { value: "hc-black", label: "High Contrast" },
] as const;

export type EditorTheme = (typeof EDITOR_THEMES)[number]["value"];

/** Function type for generating Mermaid configuration based on theme */
export type MermaidConfigFn = (theme: MermaidTheme) => MermaidConfig;

/**
 * Default Mermaid configuration generator
 * Provides consistent theming across both React and Solid examples
 */
export const DEFAULT_MERMAID_CONFIG: MermaidConfigFn = (theme) => {
  const isDark = theme === "dark";
  const haxiomAccent = isDark ? "rgb(111, 255, 233)" : "#4f46e5";
  const haxiomFg = isDark ? "#000000" : "#ffffff";
  const textColor = isDark ? "#c9d1d9" : "#24292f";
  const bkgColor = isDark ? "#0d1117" : "#ffffff";

  return {
    startOnLoad: false,
    theme: "base",
    securityLevel: "loose",
    fontFamily: "arial",
    themeVariables: {
      primaryColor: haxiomAccent,
      primaryTextColor: haxiomFg,
      primaryBorderColor: haxiomAccent,
      lineColor: isDark ? haxiomAccent : "#444444",
      secondaryColor: haxiomAccent,
      tertiaryColor: isDark ? "#222222" : "#eeeeee",
      mainBkg: bkgColor,
      nodeBkg: haxiomAccent,
      textColor,
      nodeBorder: haxiomAccent,
      clusterBkg: isDark ? "#161b22" : "#f6f8fa",
      clusterBorder: isDark ? "#30363d" : "#d0d7de",
      defaultLinkColor: isDark ? "#8b949e" : "#57606a",
      titleColor: haxiomAccent,
      edgeLabelBackground: isDark ? "#161b22" : "#ffffff",
      fontFamily: "arial",
      fontSize: "14px",
      taskBkgColor: haxiomAccent,
      taskTextColor: haxiomFg,
      taskBorderColor: haxiomAccent,
      activeTaskBkgColor: haxiomAccent,
      activeTaskTextColor: haxiomFg,
      doneTaskBkgColor: isDark ? "#333333" : "#d1d5db",
      doneTaskTextColor: isDark ? "#888888" : "#4b5563",
      critBkgColor: "#f87171",
      critTextColor: "#ffffff",
      todayLineColor: "#f87171",
      gridColor: isDark ? "#30363d" : "#d0d7de",
      sectionBkgColor: isDark ? "#161b22" : "#f6f8fa",
      sectionBkgColor2: isDark ? "#0d1117" : "#ffffff",
    },
    gantt: {
      useMaxWidth: true,
      htmlLabels: false,
    },
  };
};

/**
 * Mermaid configuration used by both example apps.
 * Matches the previous Solid example styling (red links, stronger contrast).
 */
export const EXAMPLE_MERMAID_CONFIG: MermaidConfigFn = (theme) => {
  const isDark = theme === "dark";
  const baseConfig = DEFAULT_MERMAID_CONFIG(theme);
  const nodeBkg = isDark ? "#BB2528" : "#fee2e2";
  const nodeText = isDark ? "#ffffff" : "#991b1b";
  const textColor = isDark ? "#c9d1d9" : "#24292f";

  return {
    ...baseConfig,
    themeVariables: {
      ...baseConfig.themeVariables,
      primaryColor: nodeBkg,
      nodeBkg,
      primaryTextColor: nodeText,
      nodeTextColor: nodeText,
      textColor,
      lineColor: "#FF0000",
      secondaryColor: "#006100",
      tertiaryColor: isDark ? "#222222" : "#eeeeee",
    },
  };
};

/** Media query for detecting dark mode preference */
export const DARK_MODE_MEDIA_QUERY = "(prefers-color-scheme: dark)";

/**
 * Get the default code theme based on dark mode preference
 */
export function getDefaultCodeTheme(isDark: boolean): Themes {
  return isDark ? "ayu-dark" : "ayu-light";
}

/**
 * Get the default editor theme based on dark mode preference
 */
export function getDefaultEditorTheme(isDark: boolean): EditorTheme {
  return isDark ? "vs-dark" : "vs";
}

/**
 * Check if the user prefers dark mode
 */
export function getPrefersDark(): boolean {
  return window.matchMedia(DARK_MODE_MEDIA_QUERY).matches;
}
