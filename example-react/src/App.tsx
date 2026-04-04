import Editor from "@monaco-editor/react";
import haxiomLogo from "@solid-markdown-wasm/example-shared/assets/haxiom.svg";
import initialMarkdown from "@solid-markdown-wasm/example-shared/assets/markdown_preview.md?raw";
import {
  CODE_THEMES,
  EDITOR_THEMES,
  EXAMPLE_MERMAID_CONFIG,
  type EditorTheme,
  type Themes,
  getDefaultCodeTheme,
  getDefaultEditorTheme,
  getPrefersDark,
} from "@solid-markdown-wasm/example-shared/constants";
import init, { render_md } from "markdown-renderer";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  applyPreviewEnhancements,
  handlePreviewInteraction,
} from "./previewEnhancements";

const MEDIA_QUERY = "(prefers-color-scheme: dark)";

function LoadingFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="spinner" />
    </div>
  );
}

function App() {
  const [markdown, setMarkdown] = useState("");
  const [debouncedMarkdown, setDebouncedMarkdown] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => getPrefersDark());
  const [codeTheme, setCodeTheme] = useState<Themes>(() =>
    getDefaultCodeTheme(getPrefersDark()),
  );
  const [editorTheme, setEditorTheme] = useState<EditorTheme>(() =>
    getDefaultEditorTheme(getPrefersDark()),
  );
  const [immediateRenderMermaid, setImmediateRenderMermaid] = useState(false);
  const [isInitializingWasm, setIsInitializingWasm] = useState(true);
  const [isWasmReady, setIsWasmReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [renderedHtml, setRenderedHtml] = useState("");
  const [fullScreenSvg, setFullScreenSvg] = useState<string | null>(null);
  const previewRef = useRef<HTMLElement | null>(null);
  const overlayContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMarkdown(initialMarkdown);
    setDebouncedMarkdown(initialMarkdown);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initializeWasm = async () => {
      setIsInitializingWasm(true);
      setInitError(null);

      try {
        await init();
        if (cancelled) {
          return;
        }
        setIsWasmReady(true);
      } catch (error) {
        if (cancelled) {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : String(error ?? "Unknown error");
        setIsWasmReady(false);
        setInitError(`Failed to initialize WASM: ${message}`);
      } finally {
        if (!cancelled) {
          setIsInitializingWasm(false);
        }
      }
    };

    void initializeWasm();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MEDIA_QUERY);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsDarkMode(event.matches);
      setCodeTheme(getDefaultCodeTheme(event.matches));
      setEditorTheme(getDefaultEditorTheme(event.matches));
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    const debounceAmount = markdown.length > 100_000 ? 50 : 0;
    const timeoutId = window.setTimeout(() => {
      setDebouncedMarkdown(markdown);
    }, debounceAmount);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [markdown]);

  useEffect(() => {
    if (!isWasmReady || initError) {
      setRenderedHtml("");
      return;
    }

    try {
      const html = render_md(debouncedMarkdown, codeTheme);
      setRenderedHtml(html);
      setRenderError(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error ?? "Unknown error");
      setRenderedHtml("");
      setRenderError(`Failed to render markdown: ${message}`);
    }
  }, [codeTheme, debouncedMarkdown, initError, isWasmReady]);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) {
      return;
    }

    preview.innerHTML = renderedHtml;

    if (!renderedHtml) {
      return;
    }

    let disposed = false;

    const enhancePreview = async () => {
      try {
        await applyPreviewEnhancements(preview, {
          immediateRenderMermaid,
          mermaidConfig: EXAMPLE_MERMAID_CONFIG,
        });
      } catch (error) {
        if (!disposed) {
          console.error("Failed to enhance preview:", error);
        }
      }
    };

    void enhancePreview();

    return () => {
      disposed = true;
    };
  }, [immediateRenderMermaid, renderedHtml]);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview || !renderedHtml) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      void handlePreviewInteraction(preview, event, {
        mermaidConfig: EXAMPLE_MERMAID_CONFIG,
        onOpenMermaidPreview: setFullScreenSvg,
      });
    };

    preview.addEventListener("click", handleClick);
    return () => {
      preview.removeEventListener("click", handleClick);
    };
  }, [renderedHtml]);

  useEffect(() => {
    const overlayContent = overlayContentRef.current;
    if (!overlayContent) {
      return;
    }

    overlayContent.replaceChildren();

    if (!fullScreenSvg) {
      return;
    }

    const range = document.createRange();
    overlayContent.append(range.createContextualFragment(fullScreenSvg));
  }, [fullScreenSvg]);

  useEffect(() => {
    if (!fullScreenSvg) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFullScreenSvg(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [fullScreenSvg]);

  const editorOptions = useMemo(
    () => ({
      automaticLayout: true,
      fontFamily: "'Iosevka', ui-monospace, monospace",
      fontSize: 22,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: "on" as const,
    }),
    [],
  );

  const surfaceClass = isDarkMode
    ? "border-gray-700 bg-[#0d1117] text-gray-100"
    : "border-gray-200 bg-white text-gray-900";
  const toolbarClass = isDarkMode
    ? "border-gray-700 bg-black"
    : "border-gray-200 bg-gray-100";
  const mutedTextClass = isDarkMode ? "text-gray-400" : "text-gray-500";
  const labelClass = isDarkMode
    ? "text-sm font-medium text-gray-300"
    : "text-sm font-medium text-gray-700";
  const selectClass = isDarkMode
    ? "rounded border border-gray-600 bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-200 hover:bg-gray-600"
    : "rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50";
  const bannerClass = isDarkMode
    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-100"
    : "border-indigo-200 bg-indigo-50 text-indigo-900";
  const errorClass = isDarkMode
    ? "border-red-500/40 bg-red-500/10 text-red-100"
    : "border-red-200 bg-red-50 text-red-800";
  const emptyStateClass = isDarkMode
    ? "border-dashed border-gray-700 bg-[#11161d] text-gray-300"
    : "border-dashed border-gray-200 bg-gray-50 text-gray-600";

  return (
    <div
      className={`flex h-screen w-screen flex-col ${
        isDarkMode ? "bg-[#1e1e1e]" : "bg-white"
      }`}
      data-theme={isDarkMode ? "dark" : "light"}
    >
      <div className={`border-b px-6 py-3 ${toolbarClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={haxiomLogo}
              alt="Haxiom"
              className={`h-6 w-6 ${isDarkMode ? "invert" : ""}`}
            />
            <span
              className={
                isDarkMode
                  ? "font-semibold text-white"
                  : "font-semibold text-gray-900"
              }
            >
              Haxiom
            </span>
            <span className={mutedTextClass}>/</span>
            <span className={mutedTextClass}>solid-markdown-wasm</span>
            <span
              className={`rounded-full border px-2 py-0.5 text-xs uppercase tracking-[0.2em] ${bannerClass}`}
            >
              React raw WASM
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-2">
              <label htmlFor="editor-theme" className={labelClass}>
                Editor Theme:
              </label>
              <select
                id="editor-theme"
                className={selectClass}
                value={editorTheme}
                onChange={(event) =>
                  setEditorTheme(event.currentTarget.value as EditorTheme)
                }
              >
                {EDITOR_THEMES.map((theme) => (
                  <option key={theme.value} value={theme.value}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="code-theme" className={labelClass}>
                Code Block Theme:
              </label>
              <select
                id="code-theme"
                className={selectClass}
                value={codeTheme}
                onChange={(event) =>
                  setCodeTheme(event.currentTarget.value as Themes)
                }
              >
                {CODE_THEMES.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="mermaid-toggle" className={labelClass}>
                Auto-render Mermaid:
              </label>
              <input
                id="mermaid-toggle"
                type="checkbox"
                checked={immediateRenderMermaid}
                onChange={(event) =>
                  setImmediateRenderMermaid(event.currentTarget.checked)
                }
                className="h-4 w-4 cursor-pointer accent-cyan-500"
              />
            </div>

            <a
              href="https://haxiom.io"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-80 bg-(--haxiom-accent-color) text-(--haxiom-fg-color)"
            >
              Try Haxiom
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="m-4 flex w-1/2 flex-col overflow-hidden rounded-xl border border-gray-800/20 shadow-sm">
          <Editor
            defaultLanguage="markdown"
            height="100%"
            loading={<LoadingFallback />}
            options={editorOptions}
            theme={editorTheme}
            value={markdown}
            onChange={(value) => setMarkdown(value ?? "")}
          />
        </div>

        <div className={`flex w-1/2 flex-col border-l ${surfaceClass}`}>
          <div className="h-full overflow-y-auto px-6 py-4">
            <div
              className={`mb-4 rounded-xl border px-4 py-3 text-sm ${bannerClass}`}
            >
              This React workspace still calls <code>init()</code> and{" "}
              <code>render_md()</code> directly. React adds code block actions
              and Mermaid rendering on top of the raw HTML output; wrapper-only
              iframe extraction and overlay behavior remain intentionally
              omitted.
            </div>

            {isInitializingWasm ? (
              <LoadingFallback />
            ) : initError ? (
              <div className={`rounded-xl border px-4 py-3 ${errorClass}`}>
                {initError}
              </div>
            ) : renderError ? (
              <div className={`rounded-xl border px-4 py-3 ${errorClass}`}>
                {renderError}
              </div>
            ) : renderedHtml ? (
              <article ref={previewRef} className="markdown-body" />
            ) : (
              <div className={`rounded-xl border px-4 py-3 ${emptyStateClass}`}>
                Start typing Markdown to render the raw WASM preview.
              </div>
            )}
          </div>
        </div>
      </div>

      {fullScreenSvg ? (
        <dialog
          open
          className="mermaid-preview-overlay"
          onCancel={(event) => {
            event.preventDefault();
            setFullScreenSvg(null);
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setFullScreenSvg(null);
            }
          }}
        >
          <button
            type="button"
            className="mermaid-preview-close"
            aria-label="Close Mermaid preview"
            onClick={() => setFullScreenSvg(null)}
          >
            Close
          </button>
          <div
            className="mermaid-preview-content"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div ref={overlayContentRef} />
          </div>
        </dialog>
      ) : null}
    </div>
  );
}

export default App;
