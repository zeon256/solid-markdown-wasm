import type { MonacoEditorProps } from "solid-monaco";

export const EDITOR_THEME_LIGHT = "site-light";
export const EDITOR_THEME_DARK = "site-dark";

export const EDITOR_OPTIONS = {
  // Monaco measures glyphs on a canvas, so this must be a literal font stack.
  fontFamily:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  fontSize: 14,
  lineHeight: 22,
  minimap: { enabled: false },
  wordWrap: "on",
  padding: { top: 16, bottom: 16 },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  renderLineHighlight: "line",
} satisfies MonacoEditorProps["options"];

// Monaco's built-in themes paint their own background; these inherit them but
// mirror the light/dark tokens in example-shared/styles/base.css so the editor
// pane matches the preview pane.
export const defineEditorThemes: NonNullable<MonacoEditorProps["onMount"]> = (
  monaco,
) => {
  monaco.editor.defineTheme(EDITOR_THEME_LIGHT, {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#ffffff",
      "editor.lineHighlightBackground": "#f6f8fa",
      "editor.lineHighlightBorder": "#00000000",
      "editorLineNumber.foreground": "#8c959f",
      "editorLineNumber.activeForeground": "#1f2328",
      "editorGutter.background": "#ffffff",
    },
  });

  monaco.editor.defineTheme(EDITOR_THEME_DARK, {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#0d1117",
      "editor.lineHighlightBackground": "#161b22",
      "editor.lineHighlightBorder": "#00000000",
      "editorLineNumber.foreground": "#6e7681",
      "editorLineNumber.activeForeground": "#f0f6fc",
      "editorGutter.background": "#0d1117",
    },
  });
};
