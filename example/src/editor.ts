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

type EditorOnMount = NonNullable<MonacoEditorProps["onMount"]>;

type Monaco = Parameters<EditorOnMount>[0];

type Editor = Parameters<EditorOnMount>[1];

// Line 1 starts at the very top (above Monaco's padding), mirroring the
// preview, which maps line 1 to scrollTop 0.
const lineTop = (editor: Editor, line: number) =>
  line <= 1 ? 0 : editor.getTopForLineNumber(line);

const lineCountOf = (editor: Editor) => editor.getModel()?.getLineCount() ?? 1;

/** 1-based source line (fractional within wrapped lines) at the top of the editor. */
const getTopLine = (editor: Editor): number => {
  const scrollTop = editor.getScrollTop();
  let lo = 1;
  let hi = lineCountOf(editor);

  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;

    if (lineTop(editor, mid) <= scrollTop) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }

  const top = lineTop(editor, lo);
  const height = editor.getBottomForLineNumber(lo) - top;

  return height > 0 ? lo + Math.min(1, (scrollTop - top) / height) : lo;
};

/**
 * Report the editor's top source line on every scroll via `onScrollLine`, and
 * return a function that scrolls the editor to a source line without echoing
 * that scroll back through `onScrollLine`.
 */
export const syncEditorScroll = (
  monaco: Monaco,
  editor: Editor,
  onScrollLine: (line: number) => void,
): ((line: number) => void) => {
  // setScrollTop with ScrollType.Immediate emits onDidScrollChange synchronously.
  let applying = false;

  editor.onDidScrollChange((event) => {
    if (event.scrollTopChanged && !applying) onScrollLine(getTopLine(editor));
  });

  return (line) => {
    const whole = Math.min(Math.max(Math.floor(line), 1), lineCountOf(editor));
    const fraction = Math.min(Math.max(line - whole, 0), 1);
    const top = lineTop(editor, whole);
    const bottom = editor.getBottomForLineNumber(whole);

    applying = true;

    try {
      editor.setScrollTop(
        top + fraction * (bottom - top),
        monaco.editor.ScrollType.Immediate,
      );
    } finally {
      applying = false;
    }
  };
};
