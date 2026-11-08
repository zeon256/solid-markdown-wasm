import initialMarkdown from "@solid-markdown-wasm/example-shared/assets/markdown_preview.md?raw";
import {
  DARK_MODE_MEDIA_QUERY,
  type Themes,
  getDefaultCodeTheme,
  getPrefersDark,
} from "@solid-markdown-wasm/example-shared/constants";
import * as stylex from "@stylexjs/stylex";
import {
  type Component,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { MarkdownRenderer } from "solid-markdown-wasm";
import { MonacoEditor } from "solid-monaco";
import { Header } from "./components/Header";
import { Pane } from "./components/Pane";
import { Spinner } from "./components/Spinner";
import {
  EDITOR_OPTIONS,
  EDITOR_THEME_DARK,
  EDITOR_THEME_LIGHT,
  defineEditorThemes,
} from "./editor";
import { color, font } from "./tokens.stylex";

type View = "editor" | "preview";

// Rendering is synchronous WASM; only very large documents need a debounce.
const LARGE_DOCUMENT_CHARS = 100_000;
const LARGE_DOCUMENT_DEBOUNCE_MS = 50;

// Below this width the editor and preview stop sitting side by side.
const COMPACT = "@media (max-width: 900px)";

const styles = stylex.create({
  app: {
    display: "flex",
    flexDirection: "column",
    height: "100dvh",
    backgroundColor: color.bg,
    color: color.fg,
    fontFamily: font.sans,
    fontSize: 14,
  },
  viewSwitch: {
    display: {
      default: "none",
      [COMPACT]: "flex",
    },
    gap: 4,
    padding: 4,
    marginBlock: 10,
    marginInline: 16,
    borderRadius: 8,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
  },
  viewButton: {
    flexGrow: 1,
    height: 30,
    borderWidth: 0,
    borderRadius: 6,
    backgroundColor: "transparent",
    color: color.muted,
    font: "inherit",
    fontWeight: 500,
    cursor: "pointer",
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${color.focus}`,
    },
  },
  viewButtonActive: {
    backgroundColor: color.bg,
    color: color.fg,
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.12)",
  },
  workspace: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr) minmax(0, 1fr)",
      [COMPACT]: "minmax(0, 1fr)",
    },
    gap: 1,
    flexGrow: 1,
    minHeight: 0,
    backgroundColor: color.border,
    borderTopWidth: {
      default: 0,
      [COMPACT]: 1,
    },
    borderTopStyle: "solid",
    borderTopColor: color.border,
  },
  fill: {
    position: "absolute",
    inset: 0,
  },
  previewScroll: {
    position: "absolute",
    inset: 0,
    overflowY: "auto",
    paddingBlock: 28,
    paddingInline: "clamp(20px, 4vw, 40px)",
  },
  previewContent: {
    maxWidth: 860,
    marginInline: "auto",
  },
  hiddenWhenCompact: {
    display: {
      default: "flex",
      [COMPACT]: "none",
    },
  },
});

const App: Component = () => {
  const prefersDark = getPrefersDark();
  const [isDark, setIsDark] = createSignal(prefersDark);

  const [codeTheme, setCodeTheme] = createSignal<Themes>(
    getDefaultCodeTheme(prefersDark),
  );

  const [autoRenderMermaid, setAutoRenderMermaid] = createSignal(false);
  const [markdown, setMarkdown] = createSignal(initialMarkdown);
  const [renderedMarkdown, setRenderedMarkdown] = createSignal(initialMarkdown);
  const [wasmReady, setWasmReady] = createSignal(false);
  const [view, setView] = createSignal<View>("editor");

  const words = createMemo(() => markdown().match(/\S+/g)?.length ?? 0);

  // The page follows the OS scheme until the user overrides it; either way the
  // code theme snaps to the matching default (the select can still override).
  const applyColorScheme = (dark: boolean) => {
    setIsDark(dark);
    setCodeTheme(getDefaultCodeTheme(dark));
  };

  let debounceId: number | undefined;

  const handleEditorChange = (value: string) => {
    setMarkdown(value);
    clearTimeout(debounceId);

    debounceId = window.setTimeout(
      () => setRenderedMarkdown(value),
      value.length > LARGE_DOCUMENT_CHARS ? LARGE_DOCUMENT_DEBOUNCE_MS : 0,
    );
  };

  onMount(() => {
    const mediaQuery = window.matchMedia(DARK_MODE_MEDIA_QUERY);

    const handleSchemeChange = (event: MediaQueryListEvent) =>
      applyColorScheme(event.matches);

    mediaQuery.addEventListener("change", handleSchemeChange);
    onCleanup(() =>
      mediaQuery.removeEventListener("change", handleSchemeChange),
    );
  });

  onCleanup(() => clearTimeout(debounceId));

  // On <html> so the theme variables resolve for the StyleX tokens, the
  // document background, and the renderer's Mermaid theme lookup.
  createEffect(() => {
    document.documentElement.dataset.theme = isDark() ? "dark" : "light";
  });

  return (
    <div {...stylex.attrs(styles.app)}>
      <Header
        isDark={isDark()}
        onToggleColorScheme={() => applyColorScheme(!isDark())}
        codeTheme={codeTheme()}
        onCodeThemeChange={setCodeTheme}
        autoRenderMermaid={autoRenderMermaid()}
        onAutoRenderMermaidChange={setAutoRenderMermaid}
      />

      <div {...stylex.attrs(styles.viewSwitch)}>
        <button
          type="button"
          aria-pressed={view() === "editor"}
          {...stylex.attrs(
            styles.viewButton,
            view() === "editor" && styles.viewButtonActive,
          )}
          onClick={() => setView("editor")}
        >
          Editor
        </button>
        <button
          type="button"
          aria-pressed={view() === "preview"}
          {...stylex.attrs(
            styles.viewButton,
            view() === "preview" && styles.viewButtonActive,
          )}
          onClick={() => setView("preview")}
        >
          Preview
        </button>
      </div>

      <main {...stylex.attrs(styles.workspace)}>
        <Pane
          title="Markdown"
          meta={`${words().toLocaleString()} words`}
          xstyle={view() !== "editor" && styles.hiddenWhenCompact}
        >
          <div {...stylex.attrs(styles.fill)}>
            <MonacoEditor
              language="markdown"
              theme={isDark() ? EDITOR_THEME_DARK : EDITOR_THEME_LIGHT}
              options={EDITOR_OPTIONS}
              value={markdown()}
              onChange={handleEditorChange}
              onMount={(monaco, editor) => {
                // solid-monaco only forwards `theme` on later changes.
                defineEditorThemes(monaco, editor);
                monaco.editor.setTheme(
                  isDark() ? EDITOR_THEME_DARK : EDITOR_THEME_LIGHT,
                );
              }}
              loadingState={<Spinner label="Loading editor" />}
            />
          </div>
        </Pane>

        <Pane
          title="Preview"
          meta={wasmReady() ? "Rendered by Rust → WASM" : "Loading WASM…"}
          xstyle={view() !== "preview" && styles.hiddenWhenCompact}
        >
          <div {...stylex.attrs(styles.previewScroll)}>
            <div {...stylex.attrs(styles.previewContent)}>
              <MarkdownRenderer
                markdown={renderedMarkdown()}
                theme={codeTheme()}
                class="markdown-body"
                fallback={<Spinner label="Loading renderer" />}
                onLoaded={() => setWasmReady(true)}
                immediateRenderMermaid={autoRenderMermaid()}
              />
            </div>
          </div>
        </Pane>
      </main>
    </div>
  );
};

export default App;
