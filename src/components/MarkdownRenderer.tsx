import init, { render_md, type Themes } from "markdown-renderer";
import {
  type Component,
  type JSX,
  Show,
  createEffect,
  createSignal,
  onMount,
} from "solid-js";

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

// Extract iframes from HTML and replace with placeholders using stable keys
const extractIframes = (
  html: string,
): { html: string; iframes: Map<string, string> } => {
  const iframes = new Map<string, string>();
  const iframeRegex = /<iframe[^>]*src="([^"]*)"[^>]*>.*?<\/iframe>/gi;
  const srcCounts = new Map<string, number>();

  const newHtml = html.replace(iframeRegex, (match, src) => {
    // Use src-based stable key with counter for multiple same-src iframes
    const count = srcCounts.get(src) || 0;
    srcCounts.set(src, count + 1);
    const id = `${hashSrc(src)}_${count}`;
    iframes.set(id, match);
    return `<div data-iframe-id="${id}"></div>`;
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
  const { theme = "one-dark" } = props;
  const [renderedHtml, setRenderedHtml] = createSignal("");
  const [loadingWasm, setLoadingWasm] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // Store live iframe elements to preserve across renders
  const iframeCache = new Map<string, HTMLIFrameElement>();
  let contentRef: HTMLDivElement | undefined;

  // Initizalize wasm module
  onMount(async () => {
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
  });

  createEffect(() => {
    if (!loadingWasm()) {
      const startTime = performance.now();
      const result = render_md(props.markdown, theme);

      // Extract iframes and replace with placeholders
      const { html, iframes } = extractIframes(result);
      setRenderedHtml(html);

      // After DOM update, restore iframes
      queueMicrotask(() => {
        if (!contentRef) return;

        // Find all iframe placeholders and restore/create iframes
        const placeholders = contentRef.querySelectorAll("[data-iframe-id]");
        const usedIds = new Set<string>();

        for (const placeholder of placeholders) {
          const id = placeholder.getAttribute("data-iframe-id");
          if (!id) continue;
          usedIds.add(id);

          const iframeHtml = iframes.get(id);
          if (!iframeHtml) continue;

          // Check if we already have this iframe cached
          let iframe = iframeCache.get(id);
          if (iframe && iframe.parentElement !== placeholder) {
            // Move existing iframe to new location
            placeholder.appendChild(iframe);
          } else if (!iframe) {
            // Create new iframe from HTML
            const temp = document.createElement("div");
            temp.innerHTML = iframeHtml;
            iframe = temp.firstElementChild as HTMLIFrameElement;
            if (iframe) {
              iframeCache.set(id, iframe);
              placeholder.appendChild(iframe);
            }
          }
        }

        // Clean up old cached iframes that are no longer in use
        for (const [id] of iframeCache) {
          if (!usedIds.has(id)) {
            iframeCache.delete(id);
          }
        }
      });

      const endTime = performance.now();
      console.debug(`Time taken: ${endTime - startTime}`);
    }
  });

  return (
    <div>
      {error() && <div style={{ color: "red" }}>{error()}</div>}
      <Show when={!loadingWasm() && !error()} fallback={props.fallback}>
        <div class={props.class}>
          <div ref={contentRef} innerHTML={renderedHtml()} />
        </div>
      </Show>
    </div>
  );
};
