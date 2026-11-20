import {
  DARK_MODE_MEDIA_QUERY,
  type Themes,
  getDefaultCodeTheme,
  getPrefersDark,
} from "@solid-markdown-wasm/example-shared/constants";
import * as stylex from "@stylexjs/stylex";
import type { FileTree } from "@pierre/trees";
import {
  type Component,
  For,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onFlush,
  onSettled,
  Show,
} from "solid-js";
import { MarkdownRenderer, type MarkdownScrollSync } from "solid-markdown-wasm";
import { DocumentTabs, tabId } from "./components/DocumentTabs";
import { FileExplorer } from "./components/FileExplorer";
import { Header } from "./components/Header";
import { type Editor, MonacoEditor } from "./components/MonacoEditor";
import { Pane } from "./components/Pane";
import { Spinner } from "./components/Spinner";
import {
  type EntryKind,
  type WorkspaceTreeHandlers,
  createWorkspaceTree,
} from "./fileTree";
import {
  STORAGE_KEY,
  type Workspace,
  activate,
  applyTreeMutation,
  closeTabs,
  discardSavedWorkspace,
  freePath,
  isFolder,
  loadWorkspace,
  newFileId,
  openPath,
  parentFolder,
  saveWorkspace,
  setContent,
} from "./workspace";
import {
  EDITOR_OPTIONS,
  EDITOR_THEME_DARK,
  EDITOR_THEME_LIGHT,
  defineEditorThemes,
  syncEditorScroll,
} from "./editor";
import { color, font } from "./tokens.stylex";

type View = "files" | "editor" | "preview";

// Narrow screens show one pane at a time.
const VIEWS: readonly { view: View; label: string }[] = [
  { view: "files", label: "Files" },
  { view: "editor", label: "Editor" },
  { view: "preview", label: "Preview" },
];

// Rendering is synchronous WASM; only very large documents need a debounce.
const LARGE_DOCUMENT_CHARS = 100_000;
const LARGE_DOCUMENT_DEBOUNCE_MS = 50;

// Saving rewrites the whole workspace, so it waits for a pause in typing.
const SAVE_DELAY_MS = 300;

const EDITOR_PANEL_ID = "editor-panel";

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
      default: "240px minmax(0, 1fr) minmax(0, 1fr)",
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
  empty: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: color.bg,
    color: color.muted,
    textAlign: "center",
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
  // Keeps Monaco's and the preview's own z-indexes inside their pane, so the
  // file tree's context menu (anchored in the sidebar) can overlap them.
  isolated: {
    isolation: "isolate",
  },
});

const App: Component = () => {
  const prefersDark = getPrefersDark();
  const [isDark, setIsDark] = createSignal(prefersDark);

  const [codeTheme, setCodeTheme] = createSignal<Themes>(
    getDefaultCodeTheme(prefersDark),
  );

  const [autoRenderMermaid, setAutoRenderMermaid] = createSignal(false);

  const handlers: WorkspaceTreeHandlers = {
    onMutation: (event) => {
      setWorkspace((current) => applyTreeMutation(current, event, newFileId));

      if (naming === null) return;

      // Dropping the name removes the new file; go back to the tab before it.
      if (event.operation === "remove" && event.path === naming.path) {
        const { returnTo } = naming;

        if (returnTo !== null)
          setWorkspace((current) => activate(current, returnTo));
      }

      naming = null;
    },
    onCreate: (kind, folder) => createEntry(kind, folder, true),
  };

  // The tree throws on paths it can't hold. Saved data is validated first,
  // but if the tree still refuses it, set it aside rather than fail on every
  // load.
  const startTree = (): [Workspace, FileTree] => {
    const saved = loadWorkspace();

    try {
      return [saved, createWorkspaceTree(saved, handlers)];
    } catch (error) {
      console.error(error);

      const fresh = discardSavedWorkspace();

      return [fresh, createWorkspaceTree(fresh, handlers)];
    }
  };

  const [initialWorkspace, tree] = startTree();

  onCleanup(() => tree.cleanUp());

  const [workspace, setWorkspace] = createSignal(initialWorkspace);

  const activeFile = createMemo(() => {
    const { files, activeId } = workspace();

    return files.find((file) => file.id === activeId) ?? null;
  });

  const openFiles = createMemo(() => {
    const { files, openIds } = workspace();

    return openIds.flatMap((id) => files.find((file) => file.id === id) ?? []);
  });

  // The last debounced render. It only applies to the file it came from, so a
  // freshly opened file renders at once.
  const [rendered, setRendered] = createSignal<{
    id: string;
    content: string;
  } | null>(null);

  const previewMarkdown = createMemo(() => {
    const file = activeFile();
    const last = rendered();

    if (!file) return "";

    return last?.id === file.id ? last.content : file.content;
  });

  const [wasmReady, setWasmReady] = createSignal(false);
  const [view, setView] = createSignal<View>("editor");

  const words = createMemo(
    () => activeFile()?.content.match(/\S+/g)?.length ?? 0,
  );

  // The page follows the OS scheme until the user overrides it; either way the
  // code theme snaps to the matching default (the select can still override).
  const applyColorScheme = (dark: boolean) => {
    setIsDark(dark);
    setCodeTheme(getDefaultCodeTheme(dark));
  };

  let debounceId: number | undefined;
  // Set once Monaco loads; needed to focus the editor.
  let editorInstance: Editor | undefined;

  // `id` is the model that changed, not whatever tab is active by now.
  const handleEditorChange = (value: string, id: string) => {
    setWorkspace((current) => setContent(current, id, value));
    clearTimeout(debounceId);

    debounceId = window.setTimeout(
      () => setRendered({ id, content: value }),
      value.length > LARGE_DOCUMENT_CHARS ? LARGE_DOCUMENT_DEBOUNCE_MS : 0,
    );
  };

  // A new file waiting for its name, and the tab to return to if it's dropped.
  let naming: { path: string; returnTo: string | null } | null = null;

  /**
   * Add an untitled file or folder to the tree (the workspace follows through
   * `onMutation`) and open a new file. With `rename`, the tree then asks for
   * the name, and dropping the rename removes the entry again.
   */
  const createEntry = (kind: EntryKind, folder: string, rename: boolean) => {
    const { activeId } = workspace();
    const path = freePath(workspace(), folder, kind);

    tree.add(path);

    if (kind === "file") setWorkspace((current) => openPath(current, path));

    if (rename) {
      naming = kind === "file" ? { path, returnTo: activeId } : null;
      tree.startRenaming(path, { removeIfCanceled: true });
    } else {
      // Focus does nothing until the editor shows the new model.
      onFlush(() => editorInstance?.focus());
    }
  };

  // Sidebar buttons create next to the focused row: inside it if it's a folder.
  const createInFocusedFolder = (kind: EntryKind) => {
    const focused = tree.getFocusedPath() ?? "";

    createEntry(
      kind,
      isFolder(focused) ? focused : parentFolder(focused),
      true,
    );
  };

  const openFromTree = (path: string) => {
    setWorkspace((current) => openPath(current, path));
    // On narrow screens, picking a file leaves the file list for the editor.
    setView("editor");
  };

  const selectTab = (id: string) =>
    setWorkspace((current) => activate(current, id));

  const closeTab = (id: string) =>
    setWorkspace((current) => closeTabs(current, [id]));

  const activeTabId = () => {
    const id = workspace().activeId;

    return id === null ? undefined : tabId(id);
  };

  // A memo, so edits (which replace the file object) don't re-run the sync.
  const activePath = createMemo(() => activeFile()?.path ?? null);

  // The tree highlights the active file. Opening is driven by clicks and
  // Enter, not selection, so these programmatic changes open nothing.
  createEffect(activePath, (path) => {
    for (const selected of tree.getSelectedPaths()) {
      if (selected !== path) tree.getItem(selected)?.deselect();
    }

    if (path === null) return;

    tree.getItem(path)?.select();
    tree.scrollToPath(path, { focus: false, offset: "nearest" });
  });

  // Saving waits for a pause, and is forced when the page is hidden or closed.
  const [saveFailed, setSaveFailed] = createSignal(false);
  const [changedElsewhere, setChangedElsewhere] = createSignal(false);
  let saveTimer: number | undefined;
  let unsaved = false;

  const saveNow = () => {
    clearTimeout(saveTimer);

    if (!unsaved) return;

    unsaved = false;
    setSaveFailed(!saveWorkspace(workspace()));
  };

  createEffect(workspace, () => {
    unsaved = true;
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveNow, SAVE_DELAY_MS);
  });

  const saveStatus = () => {
    if (saveFailed()) return "Not saved: browser storage is full or blocked";

    if (changedElsewhere())
      return "Also open in another tab; saving here overwrites it";

    return null;
  };

  // Scroll sync: each side reports the source line at its top; the other side
  // follows. Neither echoes scrolls it was told to make, so they cannot loop.
  let previewScroll: MarkdownScrollSync | undefined;
  let scrollEditorToLine: ((line: number) => void) | undefined;

  onSettled(() => {
    const mediaQuery = window.matchMedia(DARK_MODE_MEDIA_QUERY);

    const handleSchemeChange = (event: MediaQueryListEvent) =>
      applyColorScheme(event.matches);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") saveNow();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setChangedElsewhere(true);
    };

    mediaQuery.addEventListener("change", handleSchemeChange);
    window.addEventListener("pagehide", saveNow);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      mediaQuery.removeEventListener("change", handleSchemeChange);
      window.removeEventListener("pagehide", saveNow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorage);
      clearTimeout(debounceId);
      saveNow();
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
        <For each={VIEWS}>
          {(entry) => (
            <button
              type="button"
              aria-pressed={view() === entry.view ? "true" : "false"}
              {...stylex.attrs(
                styles.viewButton,
                view() === entry.view && styles.viewButtonActive,
              )}
              onClick={() => setView(entry.view)}
            >
              {entry.label}
            </button>
          )}
        </For>
      </div>

      <main {...stylex.attrs(styles.workspace)}>
        <FileExplorer
          tree={tree}
          onOpenFile={openFromTree}
          onNewFile={() => createInFocusedFolder("file")}
          onNewFolder={() => createInFocusedFolder("folder")}
          xstyle={view() !== "files" && styles.hiddenWhenCompact}
        />

        <Pane
          title="Markdown"
          meta={
            <Show
              when={saveStatus()}
              fallback={`${words().toLocaleString()} words`}
            >
              {(status) => <output>{status()}</output>}
            </Show>
          }
          toolbar={
            <DocumentTabs
              files={openFiles()}
              activeId={workspace().activeId}
              panelId={EDITOR_PANEL_ID}
              onSelect={selectTab}
              onClose={closeTab}
              onAdd={() => createEntry("file", "", false)}
            />
          }
          xstyle={[
            styles.isolated,
            view() !== "editor" && styles.hiddenWhenCompact,
          ]}
        >
          <div
            id={EDITOR_PANEL_ID}
            role="tabpanel"
            aria-labelledby={activeTabId()}
            {...stylex.attrs(styles.fill)}
          >
            <MonacoEditor
              path={activeFile()?.id ?? null}
              openPaths={workspace().openIds}
              language="markdown"
              theme={isDark() ? EDITOR_THEME_DARK : EDITOR_THEME_LIGHT}
              options={EDITOR_OPTIONS}
              value={activeFile()?.content ?? ""}
              onChange={handleEditorChange}
              onMount={(monaco, editor) => {
                editorInstance = editor;
                // Runs before `theme` is first applied, so the themes exist.
                defineEditorThemes(monaco);
                scrollEditorToLine = syncEditorScroll(monaco, editor, (line) =>
                  previewScroll?.scrollToLine(line),
                );
              }}
              loadingState={<Spinner label="Loading editor" />}
            />
            <Show when={!activeFile()}>
              <p {...stylex.attrs(styles.empty)}>
                No file open. Open one from Files, or create one with +.
              </p>
            </Show>
          </div>
        </Pane>

        <Pane
          title="Preview"
          meta={wasmReady() ? "Rendered by Rust → WASM" : "Loading WASM…"}
          xstyle={[
            styles.isolated,
            view() !== "preview" && styles.hiddenWhenCompact,
          ]}
        >
          <div {...stylex.attrs(styles.previewScroll)}>
            <div {...stylex.attrs(styles.previewContent)}>
              <MarkdownRenderer
                markdown={previewMarkdown()}
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
