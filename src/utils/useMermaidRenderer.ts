import mermaid from "mermaid";
import { onMount } from "solid-js";

const CACHE_KEY = "mermaid-cache";
const MAX_CACHE_SIZE = 50;

// Detect if user prefers dark mode
const getPreferredTheme = (): "dark" | "default" => {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "default";
  }
  return "default";
};

// Initialize Mermaid with theme based on system preference
mermaid.initialize({
  startOnLoad: false,
  theme: getPreferredTheme(),
  securityLevel: "loose",
  fontFamily: "inherit",
});

// Re-initialize when color scheme changes
if (typeof window !== "undefined") {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: e.matches ? "dark" : "default",
        securityLevel: "loose",
        fontFamily: "inherit",
      });
    });
}

// Simple hash function to generate stable keys from Mermaid source
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// Load cache from localStorage
function loadCache(): Map<string, string> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const entries = JSON.parse(cached) as [string, string][];
      return new Map(entries);
    }
  } catch (error) {
    console.warn("Failed to load Mermaid cache:", error);
  }
  return new Map();
}

// Save cache to localStorage
function saveCache(cache: Map<string, string>): void {
  try {
    const entries = [...cache.entries()];
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn("Failed to save Mermaid cache:", error);
  }
}

// LRU eviction: convert Map to array, remove first entry, convert back
function evictOldest(cache: Map<string, string>): Map<string, string> {
  const entries = [...cache.entries()];
  entries.shift(); // Remove oldest entry
  return new Map(entries);
}

export function useMermaidRenderer(immediateRender = false) {
  let mermaidCache = loadCache();

  // Save cache periodically
  onMount(() => {
    const interval = setInterval(() => {
      saveCache(mermaidCache);
    }, 5000); // Save every 5 seconds if changed

    return () => clearInterval(interval);
  });

  const expandedHashes = new Set<string>();

  // Render a single Mermaid diagram
  const renderMermaid = async (code: string): Promise<string> => {
    // Include theme in cache key so theme changes trigger re-render
    const theme = getPreferredTheme();
    const hash = simpleHash(`${code}_${theme}`);

    // Check cache first
    const cached = mermaidCache.get(hash);
    if (cached) {
      return cached;
    }

    try {
      // Render directly on main thread
      const { svg } = await mermaid.render(`mermaid-${hash}`, code);

      // Update cache
      mermaidCache.set(hash, svg);

      // LRU eviction if cache is too large
      if (mermaidCache.size > MAX_CACHE_SIZE) {
        mermaidCache = evictOldest(mermaidCache);
      }

      // Save to localStorage
      saveCache(mermaidCache);

      return svg;
    } catch (error) {
      console.error("Mermaid render error:", error);
      const errorSvg = `
        <div class="mermaid-error" style="color: red; padding: 1rem; border: 1px solid red; border-radius: 4px;">
          <strong>Mermaid Error:</strong><br/>
          ${error instanceof Error ? error.message : "Unknown error"}
        </div>
      `;
      return errorSvg;
    }
  };

  // Process all Mermaid code blocks in the document
  const processBlocks = async (rootElement?: HTMLElement) => {
    // Find all Mermaid code blocks within the root elements
    const root = rootElement || document;
    const blocks = root.querySelectorAll("pre code.language-mermaid");

    for (const block of blocks) {
      const code = block.textContent?.trim() || "";
      if (!code) continue;

      const container = block.parentElement as HTMLElement;
      if (!container) continue;

      // Skip if already processed
      if (container.dataset.mermaidProcessed === "true") continue;
      container.dataset.mermaidProcessed = "true";
      container.dataset.mermaidSource = code;

      const theme = getPreferredTheme();
      const hash = simpleHash(`${code}_${theme}`);

      // If immediate render mode or if this specific hash was previously expanded by the user
      const shouldRender = immediateRender || expandedHashes.has(hash);

      if (!shouldRender) {
        // Create render button for lazy loading
        const button = document.createElement("button");
        button.className = "mermaid-render-btn";
        button.textContent = "📊 Render Mermaid Diagram";
        button.onclick = async () => {
          button.disabled = true;
          button.textContent = "⏳ Rendering...";

          // Record that the user manually expanded this diagram
          expandedHashes.add(hash);

          const svg = await renderMermaid(code);
          container.innerHTML = svg;
        };

        container.innerHTML = "";
        container.appendChild(button);
      } else {
        // Render immediately
        container.innerHTML =
          '<div class="mermaid-loading">⏳ Rendering diagram...</div>';
        const svg = await renderMermaid(code);
        container.innerHTML = svg;
      }
    }
  };

  return { processBlocks, renderMermaid };
}
