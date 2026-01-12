import mermaid, { type MermaidConfig } from "mermaid";
import { onMount } from "solid-js";

const CACHE_KEY = "mermaid-cache-v3";
const MAX_CACHE_SIZE = 50;

// Current version of our styling to invalidate cache when we change these variables
const STYLE_VERSION = "v7";

export type MermaidConfigFn = (theme: "dark" | "default") => MermaidConfig;

export const DEFAULT_MERMAID_CONFIG: MermaidConfigFn = (theme) => {
  const isDark = theme === "dark";
  const haxiomAccent = isDark ? "rgb(111, 255, 233)" : "#4f46e5";
  const haxiomFg = isDark ? "#000000" : "#ffffff";
  const textColor = isDark ? "#c9d1d9" : "#24292f";
  const bkgColor = isDark ? "#0d1117" : "#ffffff";

  return {
    startOnLoad: false,
    theme: "base" as const,
    securityLevel: "loose" as const,
    fontFamily: "arial",
    themeVariables: {
      // Core colors
      primaryColor: haxiomAccent,
      primaryTextColor: haxiomFg,
      primaryBorderColor: haxiomAccent,
      lineColor: isDark ? haxiomAccent : "#444444",
      secondaryColor: haxiomAccent,
      tertiaryColor: isDark ? "#222222" : "#eeeeee",

      // Backgrounds and Text
      mainBkg: bkgColor,
      nodeBkg: haxiomAccent,
      textColor: textColor,
      nodeBorder: haxiomAccent,
      clusterBkg: isDark ? "#161b22" : "#f6f8fa",
      clusterBorder: isDark ? "#30363d" : "#d0d7de",
      defaultLinkColor: isDark ? "#8b949e" : "#57606a",
      titleColor: haxiomAccent,
      edgeLabelBackground: isDark ? "#161b22" : "#ffffff",

      fontFamily: "arial",
      fontSize: "14px",

      // Gantt specific variables
      taskBkgColor: haxiomAccent,
      taskTextColor: haxiomFg,
      taskBorderColor: haxiomAccent,
      activeTaskBkgColor: haxiomAccent,
      activeTaskTextColor: haxiomFg,
      doneTaskBkgColor: isDark ? "#333333" : "#d1d5db",
      doneTaskTextColor: isDark ? "#888888" : "#4b5563",
      critBkgColor: "#f87171",
      critTextColor: "#ffffff",
      todayLineColor: "#f87171",
      gridColor: isDark ? "#30363d" : "#d0d7de",
      sectionBkgColor: isDark ? "#161b22" : "#f6f8fa",
      sectionBkgColor2: isDark ? "#0d1117" : "#ffffff",
    },
    gantt: {
      useMaxWidth: true,
      htmlLabels: false,
    },
  };
};

// Detect if user prefers dark mode
const getSystemTheme = (): "dark" | "default" => {
  if (typeof window !== "undefined") {
    // Check for data-theme attribute first (set by our App)
    const attr = document
      .querySelector("[data-theme]")
      ?.getAttribute("data-theme");
    if (attr === "dark") return "dark";
    if (attr === "light") return "default";

    // Fallback to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "default";
  }
  return "default";
};

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

export function useMermaidRenderer(
  immediateRender = false,
  configFn: MermaidConfigFn = DEFAULT_MERMAID_CONFIG,
) {
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
  const renderMermaid = async (
    code: string,
    currentConfigFn: MermaidConfigFn = configFn,
  ): Promise<string> => {
    const theme = getSystemTheme();

    // Always re-init to ensure theme is correct before rendering
    mermaid.initialize(currentConfigFn(theme));

    // Include config source in hash to invalidate cache when styling changes
    const configHash = simpleHash(currentConfigFn.toString());
    const hash = simpleHash(`${code}_${theme}_${STYLE_VERSION}_${configHash}`);

    // Check cache first
    const cached = mermaidCache.get(hash);
    if (cached) {
      return cached;
    }

    try {
      // Create a unique ID for this render
      const id = `mermaid-${hash}`;
      const { svg } = await mermaid.render(id, code);

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
  const processBlocks = async (
    rootElement?: HTMLElement,
    currentImmediateRender = immediateRender,
    currentConfigFn = configFn,
  ) => {
    // Find all Mermaid code blocks within the root elements
    const root = rootElement || document;
    const blocks = root.querySelectorAll("pre code.language-mermaid");

    for (const block of blocks) {
      const code = block.textContent?.trim() || "";
      if (!code) continue;

      const container = block.parentElement as HTMLElement;
      if (!container) continue;

      // Skip if already processed UNLESS the code/theme/config changed
      const theme = getSystemTheme();
      const configHash = simpleHash(currentConfigFn.toString());
      const hash = simpleHash(
        `${code}_${theme}_${STYLE_VERSION}_${configHash}`,
      );

      if (
        container.dataset.mermaidProcessed === "true" &&
        container.dataset.mermaidHash === hash
      ) {
        continue;
      }

      container.dataset.mermaidProcessed = "true";
      container.dataset.mermaidSource = code;
      container.dataset.mermaidHash = hash;

      // If immediate render mode or if this specific hash was previously expanded by the user
      const shouldRender = currentImmediateRender || expandedHashes.has(hash);

      if (!shouldRender) {
        container.dataset.mermaidStatus = "unrendered";
      } else {
        container.dataset.mermaidStatus = "rendered";
        // Render immediately
        container.innerHTML =
          '<div class="mermaid-loading">⏳ Rendering diagram...</div>';
        const svg = await renderMermaid(code, currentConfigFn);
        container.innerHTML = svg;
      }
    }
  };

  return { processBlocks, renderMermaid };
}
