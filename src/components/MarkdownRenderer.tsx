import type { JSX } from "@solidjs/web";
import {
  Check,
  ChevronsDownUp,
  ChevronsUpDown,
  Code,
  Copy,
  Maximize,
  Play,
  X,
} from "lucide";
import init, { render_md, type Themes } from "markdown-renderer";
import {
  type Component,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onSettled,
} from "solid-js";
import { createIcon, setIcon } from "../utils/icons";
import {
  type MermaidConfigFn,
  useMermaidRenderer,
} from "../utils/useMermaidRenderer";
import {
  type ScrollMap,
  buildScrollMap,
  countLines,
  findScrollContainer,
  lineToOffset,
  offsetToLine,
  scrollEventTarget,
} from "../utils/scrollSync";

export type { Themes } from "markdown-renderer";

// Icon size constant
const ICON_SIZE = 16;

// Generate a stable hash from iframe src for consistent keys across renders
const hashSrc = (src: string): string => {
  let hash = 0;

  for (let i = 0; i < src.length; i++) {
    const char = src.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return `iframe_${Math.abs(hash).toString(36)}`;
};

interface IframeDimensions {
  width: string | null;
  height: string | null;
}

interface ExtractedIframe extends IframeDimensions {
  html: string;
  src: string;
}

interface ExtractedHtml {
  html: string;
  iframes: Map<string, ExtractedIframe>;
}

interface CachedIframe extends IframeDimensions {
  iframe: HTMLIFrameElement;
  wrapper: HTMLDivElement;
  src: string;
}

// Extract width/height attributes from iframe HTML
const extractIframeDimensions = (iframeHtml: string): IframeDimensions => {
  const widthMatch = iframeHtml.match(/width=["']?(\d+(?:px|%)?)/i);
  const heightMatch = iframeHtml.match(/height=["']?(\d+(?:px|%)?)/i);

  // Default to px if just a number
  const width = widthMatch
    ? /^\d+$/.test(widthMatch[1])
      ? `${widthMatch[1]}px`
      : widthMatch[1]
    : null;

  const height = heightMatch
    ? /^\d+$/.test(heightMatch[1])
      ? `${heightMatch[1]}px`
      : heightMatch[1]
    : null;

  return { width, height };
};

// Extract iframes from HTML and replace with placeholders using stable keys
const extractIframes = (html: string): ExtractedHtml => {
  const iframes = new Map<string, ExtractedIframe>();

  const iframeRegex = /<iframe[^>]*src="([^"]*)"[^>]*>.*?<\/iframe>/gi;
  const srcCounts = new Map<string, number>();

  const newHtml = html.replace(iframeRegex, (match, src) => {
    // Use src-based stable key with counter for multiple same-src iframes
    const count = srcCounts.get(src) || 0;
    srcCounts.set(src, count + 1);
    const id = `${hashSrc(src)}_${count}`;

    const { width, height } = extractIframeDimensions(match);
    iframes.set(id, { html: match, src, width, height });

    // Apply dimensions to placeholder via inline style
    const style = [
      width ? `width:${width}` : "",
      height ? `height:${height}` : "",
    ]
      .filter(Boolean)
      .join(";");

    const styleAttr = style ? ` style="${style}"` : "";

    return `<div data-iframe-id="${id}" class="iframe-placeholder"${styleAttr}></div>`;
  });

  return { html: newHtml, iframes };
};

/** Imperative handle for driving the preview from a source position. */
export interface MarkdownScrollSync {
  /**
   * Scroll the preview so the 1-based source `line` (fractional values land
   * proportionally inside a block) sits at the top of the scroll container.
   * The position is kept as content re-renders or changes height (Mermaid
   * diagrams, collapsed code, images) until the user scrolls the preview.
   */
  scrollToLine: (line: number) => void;
}

export interface MarkdownRendererProps {
  markdown: string;
  class?: string;
  theme?: Themes;
  fallback?: JSX.Element;
  onLoaded?: () => void;
  immediateRenderMermaid?: boolean;
  mermaidConfig?: MermaidConfigFn;
  /**
   * Receives the scroll sync handle once. Providing this or `onScrollLine`
   * enables scroll sync.
   */
  scrollSyncRef?: (sync: MarkdownScrollSync) => void;
  /**
   * Called with the 1-based (fractional) source line at the top of the
   * preview when the user scrolls it. Not called for scrolls made through
   * `scrollToLine`, so feeding it back into an editor does not loop.
   */
  onScrollLine?: (line: number) => void;
  /**
   * Element that scrolls the preview. Defaults to the nearest scrollable
   * ancestor, or the document.
   */
  scrollContainer?: HTMLElement;
}

export const MarkdownRenderer: Component<MarkdownRendererProps> = (props) => {
  const [loadingWasm, setLoadingWasm] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [fullScreenSvg, setFullScreenSvg] = createSignal<string | null>(null);

  // Current props are passed on every call, so no defaults are needed here.
  const { processBlocks, renderMermaid } = useMermaidRenderer();

  // Store iframe data: element, wrapper, source, and dimensions
  const iframeCache = new Map<string, CachedIframe>();

  let contentRef: HTMLDivElement | undefined;
  let containerRef: HTMLDivElement | undefined;
  // Fixed overlay container for iframes - never moves in DOM
  let iframeOverlayRef: HTMLDivElement | undefined;

  // ResizeObserver to reposition iframes when layout changes
  let resizeObserver: ResizeObserver | undefined;

  // Reposition all iframes to overlay their placeholders
  const repositionIframes = () => {
    if (!contentRef || !iframeOverlayRef || !containerRef) return;

    const containerRect = containerRef.getBoundingClientRect();

    for (const [id, cached] of iframeCache) {
      const placeholder = contentRef.querySelector(`[data-iframe-id="${id}"]`);

      if (placeholder) {
        const rect = placeholder.getBoundingClientRect();
        cached.wrapper.style.position = "absolute";
        cached.wrapper.style.left = `${rect.left - containerRect.left}px`;
        cached.wrapper.style.top = `${rect.top - containerRect.top}px`;
        cached.wrapper.style.width = `${rect.width}px`;
        cached.wrapper.style.height = `${rect.height}px`;
        cached.wrapper.style.display = "block";
      } else {
        // Placeholder no longer exists, hide the wrapper
        cached.wrapper.style.display = "none";
      }
    }
  };

  // --- Scroll sync -------------------------------------------------------
  // Source line the preview is pinned to; re-applied whenever layout changes.
  // Null until the first sync so plain usage never touches scroll position.
  let anchorLine: number | null = null;
  // Lazily measured line <-> offset map; null means stale.
  let scrollMap: ScrollMap | null = null;
  let scroller: HTMLElement | null = null;
  let lineCount = 1;
  // scrollTop produced by our own scrollTo; its scroll event is not the user's.
  let ignoreScrollTop: number | null = null;

  const scrollSyncEnabled = () =>
    Boolean(props.scrollSyncRef || props.onScrollLine);

  const getScrollMap = (): ScrollMap | null => {
    if (!scrollMap && contentRef && scroller) {
      scrollMap = buildScrollMap(contentRef, scroller, lineCount);
    }

    return scrollMap;
  };

  const applyAnchorLine = () => {
    if (anchorLine === null || !scroller) return;

    const map = getScrollMap();

    if (!map) return;

    const before = scroller.scrollTop;
    const target = lineToOffset(map, anchorLine);

    if (Math.abs(before - target) < 1) return;

    // Instant even if the container sets `scroll-behavior: smooth`; a smooth
    // scroll would emit intermediate events indistinguishable from the user's.
    scroller.scrollTo({ top: target, behavior: "instant" });

    const after = scroller.scrollTop;

    // Only expect an event if the (clamped) position actually moved.
    if (after !== before) ignoreScrollTop = after;
  };

  const handlePreviewScroll = () => {
    if (!scroller) return;

    const top = scroller.scrollTop;

    if (ignoreScrollTop !== null) {
      const expected = ignoreScrollTop;
      ignoreScrollTop = null;

      if (Math.abs(top - expected) < 1) return;
    }

    const map = getScrollMap();

    if (!map) return;

    anchorLine = offsetToLine(map, top);
    props.onScrollLine?.(anchorLine);
  };

  const scrollSync: MarkdownScrollSync = {
    scrollToLine: (line) => {
      anchorLine = line;
      applyAnchorLine();
    },
  };

  createEffect(
    () => props.scrollSyncRef,
    (scrollSyncRef) => {
      // Block body: an effect's return value is treated as its cleanup.
      scrollSyncRef?.(scrollSync);
    },
  );

  // Layout changed: offsets are stale, and the pinned line may have moved.
  const handleLayoutChange = () => {
    scrollMap = null;
    applyAnchorLine();
  };

  // Inject copy buttons into code block headers
  const injectCopyButtons = (immediateRenderMermaid: boolean) => {
    if (!contentRef) return;

    const headers = contentRef.querySelectorAll(".code-block-header");

    for (const header of headers) {
      // Skip if buttons already exist
      if (header.querySelector(".code-block-copy")) continue;

      // Create button container for proper layout
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "code-block-buttons";

      // Add maximize button ONLY for Mermaid diagrams
      const wrapper = header.closest(".code-block-wrapper");

      const isMermaid =
        wrapper?.querySelector(".language-mermaid") ||
        wrapper
          ?.querySelector(".code-lang-data")
          ?.getAttribute("data-lang")
          ?.toLowerCase() === "mermaid";

      if (isMermaid) {
        // Set initial status on wrapper if not already set
        const initialStatus = immediateRenderMermaid
          ? "rendered"
          : "unrendered";

        if (wrapper instanceof HTMLElement && !wrapper.dataset.mermaidStatus) {
          wrapper.dataset.mermaidStatus = initialStatus;
        }

        const maxBtn = document.createElement("button");
        maxBtn.className = "code-block-maximize";
        maxBtn.setAttribute("aria-label", "Show preview");
        setIcon(maxBtn, Maximize, ICON_SIZE);
        buttonContainer.appendChild(maxBtn);

        // Create play/code toggle button
        const playBtn = document.createElement("button");
        playBtn.className = "code-block-play";
        playBtn.setAttribute(
          "aria-label",
          initialStatus === "rendered" ? "Show code" : "Render diagram",
        );

        setIcon(playBtn, initialStatus === "rendered" ? Code : Play, ICON_SIZE);
        buttonContainer.appendChild(playBtn);
      }

      // Create collapse/expand button
      const collapseBtn = document.createElement("button");
      collapseBtn.className = "code-block-collapse";
      collapseBtn.setAttribute("aria-label", "Collapse code");

      setIcon(collapseBtn, ChevronsDownUp, ICON_SIZE);
      buttonContainer.appendChild(collapseBtn);

      // Create copy button
      const copyBtn = document.createElement("button");
      copyBtn.className = "code-block-copy";
      copyBtn.setAttribute("aria-label", "Copy code");
      setIcon(copyBtn, Copy, ICON_SIZE);
      buttonContainer.appendChild(copyBtn);

      header.appendChild(buttonContainer);
    }
  };

  // Single handler for all code block button clicks
  const handleCodeBlockClick = (e: MouseEvent) => {
    const target = e.target;

    // Must be within our contentRef
    if (!(target instanceof Element) || !contentRef?.contains(target)) return;

    // Handle collapse button
    const collapseBtn = target.closest(".code-block-collapse");

    if (collapseBtn) {
      e.stopPropagation();

      const wrapper = collapseBtn.closest(".code-block-wrapper");

      if (!wrapper) return;

      const isCollapsed = wrapper.classList.toggle("collapsed");

      if (isCollapsed) {
        setIcon(collapseBtn, ChevronsUpDown, ICON_SIZE);
        collapseBtn.setAttribute("aria-label", "Expand code");
      } else {
        setIcon(collapseBtn, ChevronsDownUp, ICON_SIZE);
        collapseBtn.setAttribute("aria-label", "Collapse code");
      }

      return;
    }

    // Handle play button (toggle between code and diagram)
    const playBtn = target.closest(".code-block-play");

    if (playBtn instanceof HTMLButtonElement) {
      e.stopPropagation();
      const wrapper = playBtn.closest(".code-block-wrapper");

      if (!(wrapper instanceof HTMLElement)) return;

      const mermaidPre = wrapper.querySelector("pre");

      const code =
        mermaidPre?.dataset.mermaidSource ||
        mermaidPre?.querySelector("code")?.textContent?.trim() ||
        "";

      if (code && mermaidPre) {
        const currentStatus = wrapper.dataset.mermaidStatus;

        if (currentStatus === "rendered") {
          // Toggle to show code without reparsing source text as HTML.
          const codeEl = document.createElement("code");
          codeEl.className = "language-mermaid";
          codeEl.textContent = code;
          mermaidPre.replaceChildren(codeEl);
          wrapper.dataset.mermaidStatus = "code";
          mermaidPre.dataset.mermaidStatus = "code";

          // Update icon to Play
          setIcon(playBtn, Play, ICON_SIZE);
          playBtn.setAttribute("aria-label", "Render diagram");
          playBtn.dataset.iconSet = "play";
        } else {
          // Render or toggle back to diagram
          playBtn.disabled = true;
          // Show loading state
          const originalContent = mermaidPre.innerHTML;
          mermaidPre.innerHTML =
            '<div class="mermaid-loading">⏳ Rendering diagram...</div>';

          renderMermaid(code, props.mermaidConfig)
            .then((svg) => {
              mermaidPre.innerHTML = svg;
              wrapper.dataset.mermaidStatus = "rendered";
              mermaidPre.dataset.mermaidStatus = "rendered";
              mermaidPre.dataset.mermaidProcessed = "true";

              if (!mermaidPre.dataset.mermaidSource) {
                mermaidPre.dataset.mermaidSource = code;
              }

              // Update icon to Code
              setIcon(playBtn, Code, ICON_SIZE);
              playBtn.setAttribute("aria-label", "Show code");
              playBtn.dataset.iconSet = "code";
              playBtn.disabled = false;
            })
            .catch((err) => {
              console.error("Manual Mermaid render error:", err);
              mermaidPre.innerHTML = originalContent;
              playBtn.disabled = false;
            });
        }
      }

      return;
    }

    // Handle maximize button
    const maxBtn = target.closest(".code-block-maximize");

    if (maxBtn) {
      e.stopPropagation();
      const wrapper = maxBtn.closest(".code-block-wrapper");

      if (!wrapper) return;

      // 1. Try to find an existing SVG inside the Mermaid pre container
      // This avoids picking up the Maximize icon SVG
      const mermaidPre =
        wrapper.querySelector("pre[data-mermaid-source]") ||
        wrapper.querySelector("pre.language-mermaid");

      const svg = mermaidPre?.querySelector("svg");

      if (svg) {
        setFullScreenSvg(svg.outerHTML);

        return;
      }

      // 2. If no SVG, it might be a Mermaid block that hasn't been rendered yet
      const code = mermaidPre?.getAttribute("data-mermaid-source");

      if (code) {
        // We have the source! Let's render it specifically for the preview
        const renderAndPreview = async () => {
          try {
            const svgMarkup = await renderMermaid(code, props.mermaidConfig);
            setFullScreenSvg(svgMarkup);
          } catch (err) {
            console.error("Failed to render Mermaid for preview:", err);
          }
        };

        renderAndPreview();
      } else {
        // Final fallback: try to find the code tag
        const codeEl =
          wrapper.querySelector("code.language-mermaid") ||
          wrapper.querySelector("code");

        if (codeEl?.textContent) {
          renderMermaid(codeEl.textContent.trim(), props.mermaidConfig).then(
            setFullScreenSvg,
          );
        }
      }

      return;
    }

    // Handle clicking directly on the Mermaid diagram
    const mermaidSvg = target.closest('pre[data-mermaid-processed="true"] svg');

    if (mermaidSvg) {
      e.stopPropagation();
      setFullScreenSvg(mermaidSvg.outerHTML);

      return;
    }

    // Handle copy button
    const copyBtn = target.closest(".code-block-copy");

    if (copyBtn) {
      e.stopPropagation();

      const wrapper = copyBtn.closest(".code-block-wrapper");

      if (!wrapper) return;

      const codeEl = wrapper.querySelector("code");
      const preEl = wrapper.querySelector("pre");

      // Get raw code from textContent (strips all HTML formatting)
      // If codeEl is missing (e.g. Mermaid replaced it with SVG), check preEl's dataset
      const rawCode = codeEl?.textContent || preEl?.dataset.mermaidSource || "";

      if (!rawCode) return;

      navigator.clipboard
        .writeText(rawCode)
        .then(() => {
          // Visual feedback - swap icon to checkmark
          setIcon(copyBtn, Check, ICON_SIZE);
          copyBtn.classList.add("copied");

          setTimeout(() => {
            setIcon(copyBtn, Copy, ICON_SIZE);
            copyBtn.classList.remove("copied");
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy code:", err);
        });
    }
  };

  // Mount-time setup; the returned cleanup runs when the component unmounts.
  onSettled(() => {
    let disposed = false;

    // Set up click handler for code block buttons
    document.addEventListener("click", handleCodeBlockClick);

    // Set up ResizeObserver for repositioning iframes and re-pinning scroll sync
    resizeObserver = new ResizeObserver(() => {
      repositionIframes();
      handleLayoutChange();
    });

    // Observe window scroll for repositioning
    const handleScroll = () => repositionIframes();
    window.addEventListener("scroll", handleScroll, true);

    // Initialize wasm module
    const loadWasm = async () => {
      try {
        const initOutput = await init();
        console.debug(initOutput);
        console.debug("Loaded WASM successfully");
      } catch (err) {
        console.error("Error initializing WASM:", err);

        if (!disposed) setError(`Failed to initialize WASM: ${err}`);
      }

      if (disposed) return;

      setLoadingWasm(false);
      props.onLoaded?.();
    };

    void loadWasm();

    return () => {
      disposed = true;
      document.removeEventListener("click", handleCodeBlockClick);
      window.removeEventListener("scroll", handleScroll, true);
      resizeObserver?.disconnect();
    };
  });

  // Track the preview's scroll container while scroll sync is in use.
  createEffect(
    () =>
      !loadingWasm() && !error() && scrollSyncEnabled()
        ? (props.scrollContainer ?? null)
        : undefined,
    (scrollContainer) => {
      // undefined: scroll sync is off or the preview is not mounted yet.
      if (scrollContainer === undefined || !containerRef) return;

      const target = scrollContainer ?? findScrollContainer(containerRef);
      const eventTarget = scrollEventTarget(target);

      scroller = target;
      scrollMap = null;
      eventTarget.addEventListener("scroll", handlePreviewScroll, {
        passive: true,
      });

      return () => {
        eventTarget.removeEventListener("scroll", handlePreviewScroll);
        scroller = null;
        scrollMap = null;
      };
    },
  );

  // Markdown -> HTML (with iframes swapped for placeholders). Pure, so the
  // innerHTML binding and the DOM post-processing effect below share it.
  const rendered = createMemo(() => {
    if (loadingWasm() || error()) return null;

    const markdown = props.markdown;
    const theme = props.theme ?? "one-dark";
    const startTime = performance.now();
    console.log("[MarkdownRenderer] Rendering with theme:", theme);

    const result = extractIframes(render_md(markdown, theme));
    console.debug(`Time taken: ${performance.now() - startTime}`);

    return { ...result, lineCount: countLines(markdown) };
  });

  // Runs after the innerHTML binding has committed the new HTML.
  createEffect(
    () => ({
      doc: rendered(),
      immediateRenderMermaid: props.immediateRenderMermaid ?? false,
      mermaidConfig: props.mermaidConfig,
    }),
    ({ doc, immediateRenderMermaid, mermaidConfig }) => {
      if (!doc || !contentRef) return;

      lineCount = doc.lineCount;

      // Track which iframe IDs are still in use
      const usedIds = new Set<string>();

      if (iframeOverlayRef) {
        for (const [id, data] of doc.iframes) {
          usedIds.add(id);
          const cached = iframeCache.get(id);

          if (cached) {
            // Check if src changed
            if (cached.src !== data.src) {
              console.debug("[iframe-cache] Src changed for:", id);
              // Update iframe src without recreating
              cached.iframe.src = data.src;
              cached.src = data.src;
            } else {
              console.debug("[iframe-cache] Reusing existing iframe:", id);
            }
          } else {
            // Create new iframe and wrapper
            console.debug("[iframe-cache] Creating new iframe:", id);
            const wrapper = document.createElement("div");
            wrapper.className = "iframe-overlay-wrapper";
            wrapper.style.position = "absolute";
            wrapper.style.display = "none"; // Hidden until positioned
            wrapper.style.pointerEvents = "auto";

            const temp = document.createElement("div");
            temp.innerHTML = data.html;
            const iframe = temp.firstElementChild;

            if (iframe instanceof HTMLIFrameElement) {
              iframe.style.width = "100%";
              iframe.style.height = "100%";
              iframe.style.border = "none";
              wrapper.appendChild(iframe);
              iframeOverlayRef.appendChild(wrapper);
              iframeCache.set(id, {
                iframe,
                wrapper,
                src: data.src,
                width: data.width,
                height: data.height,
              });
            }
          }
        }
      }

      // Clean up iframes that are no longer in use
      for (const [id, cached] of iframeCache) {
        if (!usedIds.has(id)) {
          console.debug("[iframe-cache] Removing unused iframe:", id);
          cached.wrapper.remove();
          iframeCache.delete(id);
        }
      }

      // Update language labels from hidden spans
      const codeBlocks = contentRef.querySelectorAll(".code-block-wrapper");

      for (const wrapper of codeBlocks) {
        const langDataSpan = wrapper.querySelector(".code-lang-data");
        const langLabel = wrapper.querySelector(".code-block-language");

        if (langDataSpan && langLabel) {
          const lang = langDataSpan.getAttribute("data-lang");

          if (lang) {
            langLabel.textContent = lang;
          }
        }
      }

      // Inject copy buttons into code block headers
      injectCopyButtons(immediateRenderMermaid);

      // Process Mermaid diagrams
      const content = contentRef;
      // Set by this effect's cleanup once a newer render (or unmount) supersedes it.
      let stale = false;

      processBlocks(content, immediateRenderMermaid, mermaidConfig).then(() => {
        if (stale) return;

        // Sync wrapper status with pre status after block processing
        const pres = content.querySelectorAll("pre[data-mermaid-status]");

        for (const pre of pres) {
          const wrapper = pre.closest(".code-block-wrapper");

          if (pre instanceof HTMLElement && wrapper instanceof HTMLElement) {
            const status = pre.dataset.mermaidStatus;
            wrapper.dataset.mermaidStatus = status;

            // Update toggle button icon if it exists
            if (status === "rendered") {
              const toggleBtn = wrapper.querySelector(".code-block-play");

              if (
                toggleBtn instanceof HTMLButtonElement &&
                toggleBtn.dataset.iconSet !== "code"
              ) {
                setIcon(toggleBtn, Code, ICON_SIZE);
                toggleBtn.setAttribute("aria-label", "Show code");
                toggleBtn.dataset.iconSet = "code";
              }
            }
          }
        }
      });

      // Observe content for size changes
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver.observe(contentRef);
      }

      // Position iframes over their placeholders
      repositionIframes();

      // New DOM: re-measure and keep the synced source line in place
      handleLayoutChange();

      console.debug("[iframe-cache] Cache after update:", [
        ...iframeCache.keys(),
      ]);

      return () => {
        stale = true;
      };
    },
  );

  return (
    <div>
      {error() && <div style={{ color: "red" }}>{error()}</div>}
      <Show when={!loadingWasm() && !error()} fallback={props.fallback}>
        <div
          class={props.class}
          ref={containerRef}
          style={{ position: "relative" }}
        >
          {/* Overlay container for iframes - stays fixed in DOM, never moves */}
          <div
            ref={iframeOverlayRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              "pointer-events": "none",
              "z-index": 10,
              overflow: "visible",
            }}
          />
          {/* Main content with placeholders */}

          <div
            ref={contentRef}
            class="mermaid-clickable"
            innerHTML={rendered()?.html ?? ""}
            style={{ position: "relative" }}
          />
        </div>
      </Show>

      {/* Full Screen Preview Modal */}
      <Show when={fullScreenSvg()}>
        <div
          class="mermaid-preview-overlay"
          onClick={() => setFullScreenSvg(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setFullScreenSvg(null);
          }}
          role="presentation"
          tabindex={-1}
        >
          <div
            class="mermaid-preview-content"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setFullScreenSvg(null);
              }
            }}
            role="presentation"
            innerHTML={fullScreenSvg() ?? ""}
          />
          <button
            class="mermaid-preview-close"
            type="button"
            aria-label="Close preview"
            onClick={() => setFullScreenSvg(null)}
          >
            {createIcon(X, 24)}
          </button>
        </div>
      </Show>
    </div>
  );
};
