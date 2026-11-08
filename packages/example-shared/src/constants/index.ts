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

/** Narrow an untrusted `<select>` value to a known code theme. */
export function parseCodeTheme(value: string): Themes | undefined {
  return CODE_THEMES.find((theme) => theme === value);
}

/** Narrow an untrusted `<select>` value to a known Monaco theme. */
export function parseEditorTheme(value: string): EditorTheme | undefined {
  return EDITOR_THEMES.find((theme) => theme.value === value)?.value;
}

/** Function type for generating Mermaid configuration based on theme */
export type MermaidConfigFn = (theme: MermaidTheme) => MermaidConfig;

/**
 * Default Mermaid configuration generator
 * Provides consistent theming across both React and Solid examples
 */
export const DEFAULT_MERMAID_CONFIG: MermaidConfigFn = (theme) => {
  const isDark = theme === "dark";
  const accent = isDark ? "#58a6ff" : "#0969da";
  const accentFg = isDark ? "#0d1117" : "#ffffff";
  const textColor = isDark ? "#c9d1d9" : "#24292f";
  const mutedColor = isDark ? "#8b949e" : "#57606a";
  const bkgColor = isDark ? "#0d1117" : "#ffffff";
  const surfaceColor = isDark ? "#161b22" : "#f6f8fa";
  const borderColor = isDark ? "#30363d" : "#d0d7de";

  return {
    startOnLoad: false,
    theme: "base",
    securityLevel: "loose",
    fontFamily: "arial",
    themeVariables: {
      primaryColor: surfaceColor,
      primaryTextColor: textColor,
      primaryBorderColor: accent,
      lineColor: mutedColor,
      secondaryColor: surfaceColor,
      tertiaryColor: isDark ? "#222222" : "#eeeeee",
      mainBkg: bkgColor,
      nodeBkg: surfaceColor,
      textColor,
      nodeBorder: accent,
      clusterBkg: surfaceColor,
      clusterBorder: borderColor,
      defaultLinkColor: mutedColor,
      titleColor: textColor,
      edgeLabelBackground: bkgColor,
      fontFamily: "arial",
      fontSize: "14px",
      taskBkgColor: accent,
      taskTextColor: accentFg,
      taskBorderColor: accent,
      activeTaskBkgColor: accent,
      activeTaskTextColor: accentFg,
      doneTaskBkgColor: isDark ? "#333333" : "#d1d5db",
      doneTaskTextColor: isDark ? "#888888" : "#4b5563",
      critBkgColor: "#f87171",
      critTextColor: "#ffffff",
      todayLineColor: "#f87171",
      gridColor: borderColor,
      sectionBkgColor: surfaceColor,
      sectionBkgColor2: bkgColor,
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
