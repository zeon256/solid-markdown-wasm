import init, { render_md, type Themes } from "markdown-renderer";
import { Check, ChevronsDownUp, ChevronsUpDown, Copy } from "lucide-solid";
import {
  type Component,
  type JSX,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { render } from "solid-js/web";

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

// Extract width/height attributes from iframe HTML
const extractIframeDimensions = (
  iframeHtml: string,
): { width: string | null; height: string | null } => {
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
const extractIframes = (
  html: string,
): {
  html: string;
  iframes: Map<
    string,
    { html: string; src: string; width: string | null; height: string | null }
  >;
} => {
  const iframes = new Map<
    string,
    { html: string; src: string; width: string | null; height: string | null }
  >();
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

export interface MarkdownRendererProps {
  markdown: string;
  class?: string;
  theme?: Themes;
  fallback?: JSX.Element;
  onLoaded?: () => void;
}

export const MarkdownRenderer: Component<MarkdownRendererProps> = (props) => {
  const [renderedHtml, setRenderedHtml] = createSignal("");
  const [loadingWasm, setLoadingWasm] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // Store iframe data: element, wrapper, source, and dimensions
  const iframeCache = new Map<
    string,
    {
      iframe: HTMLIFrameElement;
      wrapper: HTMLDivElement;
      src: string;
      width: string | null;
      height: string | null;
    }
  >();
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
      const placeholder = contentRef.querySelector(
        `[data-iframe-id="${id}"]`,
      ) as HTMLElement | null;

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

  // Track dispose functions for rendered icons
  const iconDisposeCallbacks: (() => void)[] = [];

  // Inject copy buttons into code block headers
  const injectCopyButtons = () => {
    if (!contentRef) return;

    const headers = contentRef.querySelectorAll(".code-block-header");
    for (const header of headers) {
      // Skip if buttons already exist
      if (header.querySelector(".code-block-copy")) continue;

      // Create button container for proper layout
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "code-block-buttons";

      // Create collapse/expand button
      const collapseBtn = document.createElement("button");
      collapseBtn.className = "code-block-collapse";
      collapseBtn.setAttribute("aria-label", "Collapse code");
      const collapseDispose = render(
        () => <ChevronsDownUp size={ICON_SIZE} />,
        collapseBtn,
      );
      iconDisposeCallbacks.push(collapseDispose);
      buttonContainer.appendChild(collapseBtn);

      // Create copy button
      const copyBtn = document.createElement("button");
      copyBtn.className = "code-block-copy";
      copyBtn.setAttribute("aria-label", "Copy code");
      const copyDispose = render(() => <Copy size={ICON_SIZE} />, copyBtn);
      iconDisposeCallbacks.push(copyDispose);
      buttonContainer.appendChild(copyBtn);

      header.appendChild(buttonContainer);
    }
  };

  // Single handler for all code block button clicks
  const handleCodeBlockClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    // Must be within our contentRef
    if (!contentRef?.contains(target)) return;

    // Handle collapse button
    const collapseBtn = target.closest(
      ".code-block-collapse",
    ) as HTMLButtonElement | null;
    if (collapseBtn) {
      e.stopPropagation();

      const wrapper = collapseBtn.closest(".code-block-wrapper");
      if (!wrapper) return;

      const isCollapsed = wrapper.classList.toggle("collapsed");

      // Clear and re-render icon
      collapseBtn.textContent = "";
      if (isCollapsed) {
        const dispose = render(
          () => <ChevronsUpDown size={ICON_SIZE} />,
          collapseBtn,
        );
        iconDisposeCallbacks.push(dispose);
        collapseBtn.setAttribute("aria-label", "Expand code");
      } else {
        const dispose = render(
          () => <ChevronsDownUp size={ICON_SIZE} />,
          collapseBtn,
        );
        iconDisposeCallbacks.push(dispose);
        collapseBtn.setAttribute("aria-label", "Collapse code");
      }
      return;
    }

    // Handle copy button
    const copyBtn = target.closest(
      ".code-block-copy",
    ) as HTMLButtonElement | null;
    if (copyBtn) {
      e.stopPropagation();

      const wrapper = copyBtn.closest(".code-block-wrapper");
      if (!wrapper) return;

      const codeEl = wrapper.querySelector("code");
      if (!codeEl) return;

      // Get raw code from textContent (strips all HTML formatting)
      const rawCode = codeEl.textContent || "";

      navigator.clipboard
        .writeText(rawCode)
        .then(() => {
          // Visual feedback - swap icon to checkmark
          copyBtn.textContent = "";
          const checkDispose = render(
            () => <Check size={ICON_SIZE} />,
            copyBtn,
          );
          iconDisposeCallbacks.push(checkDispose);
          copyBtn.classList.add("copied");

          setTimeout(() => {
            copyBtn.textContent = "";
            const copyIconDispose = render(
              () => <Copy size={ICON_SIZE} />,
              copyBtn,
            );
            iconDisposeCallbacks.push(copyIconDispose);
            copyBtn.classList.remove("copied");
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy code:", err);
        });
    }
  };

  // Initialize wasm module
  onMount(async () => {
    // Set up click handler for code block buttons
    document.addEventListener("click", handleCodeBlockClick);

    // Set up ResizeObserver for repositioning iframes
    resizeObserver = new ResizeObserver(() => {
      repositionIframes();
    });

    // Observe window scroll for repositioning
    const handleScroll = () => repositionIframes();
    window.addEventListener("scroll", handleScroll, true);

    setLoadingWasm(true);
    try {
      const initOutput = await init();
      console.debug(initOutput);
    } catch (err) {
      console.error("Error initializing WASM:", err);
      setError(`Failed to initialize WASM: ${err}`);
    } finally {
      setLoadingWasm(false);
      console.debug("Loaded WASM successfully");
      props.onLoaded?.();
    }

    onCleanup(() => {
      document.removeEventListener("click", handleCodeBlockClick);
      window.removeEventListener("scroll", handleScroll, true);
      resizeObserver?.disconnect();
      // Dispose all rendered icons
      for (const dispose of iconDisposeCallbacks) {
        dispose();
      }
    });
  });

  createEffect(() => {
    // Track reactive dependencies at top level
    const markdown = props.markdown;
    const theme = props.theme ?? "one-dark";
    const isLoading = loadingWasm();

    if (!isLoading) {
      const startTime = performance.now();
      console.log("[MarkdownRenderer] Rendering with theme:", theme);
      const result = render_md(markdown, theme);

      // Extract iframes and replace with placeholders
      const { html, iframes } = extractIframes(result);

      // Track which iframe IDs are still in use
      const usedIds = new Set<string>();

      // Pre-create any new iframes BEFORE setting HTML (so they start loading early)
      if (iframeOverlayRef) {
        for (const [id, data] of iframes) {
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
            const iframe = temp.firstElementChild as HTMLIFrameElement;

            if (iframe) {
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

      setRenderedHtml(html);

      // After DOM update, set up observers and position iframes
      queueMicrotask(() => {
        if (!contentRef) return;

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
        injectCopyButtons();

        // Observe content for size changes
        if (resizeObserver && contentRef) {
          resizeObserver.disconnect();
          resizeObserver.observe(contentRef);
        }

        // Position iframes over their placeholders
        repositionIframes();

        console.debug("[iframe-cache] Cache after update:", [
          ...iframeCache.keys(),
        ]);
      });

      const endTime = performance.now();
      console.debug(`Time taken: ${endTime - startTime}`);
    }
  });

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
            innerHTML={renderedHtml()}
            style={{ position: "relative" }}
          />
        </div>
      </Show>
    </div>
  );
};
