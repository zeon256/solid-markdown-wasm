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
  onSettled,
} from "solid-js";
import { MarkdownRenderer, type MarkdownScrollSync } from "solid-markdown-wasm";
import { DocumentTabs } from "./components/DocumentTabs";
import { Header } from "./components/Header";
import {
  type Editor,
  type Monaco,
  MonacoEditor,
  disposeModel,
} from "./components/MonacoEditor";
import { Pane } from "./components/Pane";
import { Spinner } from "./components/Spinner";
import {
  type MarkdownDocument,
  createDocument,
  loadDocuments,
  saveDocuments,
} from "./documents";
import {
  EDITOR_OPTIONS,
  EDITOR_THEME_DARK,
  EDITOR_THEME_LIGHT,
  defineEditorThemes,
  syncEditorScroll,
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
  const initial = loadDocuments(initialMarkdown);
  const [documents, setDocuments] = createSignal(initial.documents);
  const [activeId, setActiveId] = createSignal(initial.activeId);

  // loadDocuments guarantees `activeId` names one of the documents.
  const activeDocument = createMemo(
    () => documents().find((doc) => doc.id === activeId()) ?? documents()[0],
  );

  const [renderedMarkdown, setRenderedMarkdown] = createSignal(
    initial.documents.find((doc) => doc.id === initial.activeId)?.content ?? "",
  );

  const [wasmReady, setWasmReady] = createSignal(false);
  const [view, setView] = createSignal<View>("editor");

  const words = createMemo(
    () => activeDocument().content.match(/\S+/g)?.length ?? 0,
  );

  // The page follows the OS scheme until the user overrides it; either way the
  // code theme snaps to the matching default (the select can still override).
  const applyColorScheme = (dark: boolean) => {
    setIsDark(dark);
    setCodeTheme(getDefaultCodeTheme(dark));
  };

  let debounceId: number | undefined;
  // Set once Monaco loads; needed to focus the editor and free closed models.
  let monacoApi: Monaco | undefined;
  let editorInstance: Editor | undefined;

  const handleEditorChange = (value: string) => {
    const id = activeId();

    setDocuments((docs) =>
      docs.map((doc) => (doc.id === id ? { ...doc, content: value } : doc)),
    );
    clearTimeout(debounceId);

    debounceId = window.setTimeout(
      () => setRenderedMarkdown(value),
      value.length > LARGE_DOCUMENT_CHARS ? LARGE_DOCUMENT_DEBOUNCE_MS : 0,
    );
  };

  // Switching documents renders the new one at once; a pending debounced
  // render belongs to the old one.
  const showDocument = (doc: MarkdownDocument) => {
    clearTimeout(debounceId);
    setActiveId(doc.id);
    setRenderedMarkdown(doc.content);
  };

  const selectDocument = (id: string) => {
    const doc = documents().find((candidate) => candidate.id === id);

    if (doc && id !== activeId()) showDocument(doc);
  };

  const addDocument = () => {
    const doc = createDocument();

    setDocuments((docs) => [...docs, doc]);
    showDocument(doc);
    editorInstance?.focus();
  };

  const closeDocument = (id: string) => {
    const docs = documents();
    const index = docs.findIndex((doc) => doc.id === id);

    // The last tab stays: the editor always shows a document.
    if (index === -1 || docs.length === 1) return;

    const remaining = docs.toSpliced(index, 1);

    // Activate the right-hand neighbour, or the left one when closing the end.
    if (id === activeId())
      showDocument(remaining[Math.min(index, remaining.length - 1)]);

    setDocuments(remaining);

    if (monacoApi) disposeModel(monacoApi, id);
  };

  createEffect(
    () => ({ documents: documents(), activeId: activeId() }),
    (state) => {
      saveDocuments(state);
    },
  );

  // Scroll sync: each side reports the source line at its top; the other side
  // follows. Neither echoes scrolls it was told to make, so they cannot loop.
  let previewScroll: MarkdownScrollSync | undefined;
  let scrollEditorToLine: ((line: number) => void) | undefined;

  onSettled(() => {
    const mediaQuery = window.matchMedia(DARK_MODE_MEDIA_QUERY);

    const handleSchemeChange = (event: MediaQueryListEvent) =>
      applyColorScheme(event.matches);

    mediaQuery.addEventListener("change", handleSchemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSchemeChange);
      clearTimeout(debounceId);
    };
  });

  // On <html> so the theme variables resolve for the StyleX tokens, the
  // document background, and the renderer's Mermaid theme lookup.
  createEffect(
    () => (isDark() ? "dark" : "light"),
    (theme) => {
      document.documentElement.dataset.theme = theme;
    },
  );

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
          aria-pressed={view() === "editor" ? "true" : "false"}
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
          aria-pressed={view() === "preview" ? "true" : "false"}
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
          toolbar={
            <DocumentTabs
              documents={documents()}
              activeId={activeDocument().id}
              onSelect={selectDocument}
              onClose={closeDocument}
              onAdd={addDocument}
            />
          }
          xstyle={view() !== "editor" && styles.hiddenWhenCompact}
        >
          <div {...stylex.attrs(styles.fill)}>
            <MonacoEditor
              path={activeDocument().id}
              language="markdown"
              theme={isDark() ? EDITOR_THEME_DARK : EDITOR_THEME_LIGHT}
              options={EDITOR_OPTIONS}
              value={activeDocument().content}
              onChange={handleEditorChange}
              onMount={(monaco, editor) => {
                monacoApi = monaco;
                editorInstance = editor;
                // Runs before `theme` is first applied, so the themes exist.
                defineEditorThemes(monaco);
                scrollEditorToLine = syncEditorScroll(monaco, editor, (line) =>
                  previewScroll?.scrollToLine(line),
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
                scrollSyncRef={(sync) => (previewScroll = sync)}
                onScrollLine={(line) => scrollEditorToLine?.(line)}
              />
            </div>
          </div>
        </Pane>
      </main>
    </div>
  );
};

export default App;
