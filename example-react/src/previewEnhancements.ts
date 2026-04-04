import {
  Check,
  ChevronsDownUp,
  ChevronsUpDown,
  Code,
  Copy,
  Maximize,
  Play,
} from "lucide-react";
import mermaid, { type MermaidConfig } from "mermaid";
import { createElement } from "react";
import { createRoot } from "react-dom/client";

const CACHE_KEY = "example-react-mermaid-cache-v1";
const MAX_CACHE_SIZE = 50;
const STYLE_VERSION = "v1";

const ICON_SIZE = 16;

type MermaidTheme = "dark" | "default";

const copyResetTimers = new WeakMap<HTMLButtonElement, number>();
const expandedMermaidSources = new Set<string>();

export type MermaidConfigFn = (theme: MermaidTheme) => MermaidConfig;

export interface PreviewEnhancementOptions {
  immediateRenderMermaid: boolean;
  mermaidConfig?: MermaidConfigFn;
}

export interface PreviewInteractionOptions {
  mermaidConfig?: MermaidConfigFn;
  onOpenMermaidPreview: (svgMarkup: string) => void;
}

export const DEFAULT_MERMAID_CONFIG: MermaidConfigFn = (theme) => {
  const isDark = theme === "dark";
  const haxiomAccent = isDark ? "rgb(111, 255, 233)" : "#4f46e5";
  const haxiomFg = isDark ? "#000000" : "#ffffff";
  const textColor = isDark ? "#c9d1d9" : "#24292f";
  const bkgColor = isDark ? "#0d1117" : "#ffffff";

  return {
    startOnLoad: false,
    theme: "base",
    securityLevel: "loose",
    fontFamily: "arial",
    themeVariables: {
      primaryColor: haxiomAccent,
      primaryTextColor: haxiomFg,
      primaryBorderColor: haxiomAccent,
      lineColor: isDark ? haxiomAccent : "#444444",
      secondaryColor: haxiomAccent,
      tertiaryColor: isDark ? "#222222" : "#eeeeee",
      mainBkg: bkgColor,
      nodeBkg: haxiomAccent,
      textColor,
      nodeBorder: haxiomAccent,
      clusterBkg: isDark ? "#161b22" : "#f6f8fa",
      clusterBorder: isDark ? "#30363d" : "#d0d7de",
      defaultLinkColor: isDark ? "#8b949e" : "#57606a",
      titleColor: haxiomAccent,
      edgeLabelBackground: isDark ? "#161b22" : "#ffffff",
      fontFamily: "arial",
      fontSize: "14px",
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

function getPreviewTheme(): MermaidTheme {
  const attr = document
    .querySelector("[data-theme]")
    ?.getAttribute("data-theme");
  if (attr === "dark") {
    return "dark";
  }
  if (attr === "light") {
    return "default";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "default";
}

function simpleHash(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function loadCache(): Map<string, string> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      return new Map();
    }
    return new Map(JSON.parse(cached) as [string, string][]);
  } catch {
    return new Map();
  }
}

function saveCache(cache: Map<string, string>): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify([...cache.entries()]));
  } catch {
    // Ignore cache persistence failures; rendering can continue without persistence.
  }
}

const mermaidCache = loadCache();

function rememberMermaidSvg(key: string, svg: string): void {
  mermaidCache.set(key, svg);
  while (mermaidCache.size > MAX_CACHE_SIZE) {
    const oldestKey = mermaidCache.keys().next().value;
    if (!oldestKey) {
      break;
    }
    mermaidCache.delete(oldestKey);
  }
  saveCache(mermaidCache);
}

type IconComponent =
  | typeof Check
  | typeof ChevronsDownUp
  | typeof ChevronsUpDown
  | typeof Code
  | typeof Copy
  | typeof Maximize
  | typeof Play;

function setButtonIcon(button: HTMLButtonElement, Icon: IconComponent): void {
  const root = createRoot(button);
  root.render(
    createElement(Icon, {
      size: ICON_SIZE,
    }),
  );
}

function ensureButton(
  container: HTMLElement,
  className: string,
): HTMLButtonElement {
  const existing = container.querySelector(`.${className}`);
  if (existing instanceof HTMLButtonElement) {
    return existing;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  container.appendChild(button);
  return button;
}

function getCodeBlockWrapper(target: Element | null): HTMLElement | null {
  return target?.closest(".code-block-wrapper") as HTMLElement | null;
}

function getWrapperLanguage(wrapper: HTMLElement): string {
  const storedLanguage = wrapper.dataset.codeLanguage?.trim();
  if (storedLanguage) {
    return storedLanguage;
  }

  const languageFromData = wrapper
    .querySelector(".code-lang-data")
    ?.getAttribute("data-lang")
    ?.trim();
  if (languageFromData) {
    wrapper.dataset.codeLanguage = languageFromData;
    return languageFromData;
  }

  const codeClass = wrapper.querySelector("code")?.className ?? "";
  const languageClass = codeClass
    .split(/\s+/)
    .find((entry) => entry.startsWith("language-"));
  const resolvedLanguage = languageClass?.replace("language-", "") ?? "code";
  wrapper.dataset.codeLanguage = resolvedLanguage;
  return resolvedLanguage;
}

function getMermaidSource(wrapper: HTMLElement): string {
  const pre = wrapper.querySelector("pre");
  const datasetSource = pre?.getAttribute("data-mermaid-source")?.trim();
  if (datasetSource) {
    return datasetSource;
  }

  return (
    wrapper.querySelector("code.language-mermaid")?.textContent?.trim() ?? ""
  );
}

function updateWrapperButtons(
  wrapper: HTMLElement,
  immediateRenderMermaid: boolean,
): void {
  const header = wrapper.querySelector(".code-block-header");
  if (!(header instanceof HTMLElement)) {
    return;
  }

  const languageLabel = header.querySelector(".code-block-language");
  if (languageLabel) {
    languageLabel.textContent = getWrapperLanguage(wrapper);
  }

  let buttonContainer = header.querySelector<HTMLElement>(
    ".code-block-buttons",
  );
  if (!buttonContainer) {
    buttonContainer = document.createElement("div");
    buttonContainer.className = "code-block-buttons";
    header.appendChild(buttonContainer);
  }
  const controls = buttonContainer;

  // Check if this is a mermaid block first to determine button order
  const isMermaid = getWrapperLanguage(wrapper).toLowerCase() === "mermaid";
  wrapper.classList.toggle("mermaid-clickable", isMermaid);

  const existingPlay = controls.querySelector(".code-block-play");
  const existingMaximize = controls.querySelector(".code-block-maximize");

  if (!isMermaid) {
    // Non-mermaid blocks: remove mermaid buttons, keep collapse + copy
    existingPlay?.remove();
    existingMaximize?.remove();
    delete wrapper.dataset.mermaidStatus;

    // Create collapse and copy buttons in order
    const collapseButton = ensureButton(controls, "code-block-collapse");
    collapseButton.setAttribute(
      "aria-label",
      wrapper.classList.contains("collapsed") ? "Expand code" : "Collapse code",
    );
    setButtonIcon(
      collapseButton,
      wrapper.classList.contains("collapsed") ? ChevronsUpDown : ChevronsDownUp,
    );

    const copyButton = ensureButton(controls, "code-block-copy");
    copyButton.setAttribute("aria-label", "Copy code");
    setButtonIcon(copyButton, Copy);
    return;
  }

  // For mermaid blocks, buttons should be in order: maximize, play, collapse, copy
  // This way play appears first when maximize is hidden by CSS

  if (!wrapper.dataset.mermaidStatus) {
    wrapper.dataset.mermaidStatus = immediateRenderMermaid
      ? "rendered"
      : "unrendered";
  }

  const rendered = wrapper.dataset.mermaidStatus === "rendered";

  // Create mermaid buttons first (maximize, then play)
  const maximizeButton = ensureButton(controls, "code-block-maximize");
  maximizeButton.setAttribute("aria-label", "Open Mermaid preview");
  setButtonIcon(maximizeButton, Maximize);

  const playButton = ensureButton(controls, "code-block-play");
  playButton.setAttribute(
    "aria-label",
    rendered ? "Show code" : "Render diagram",
  );
  setButtonIcon(playButton, rendered ? Code : Play);

  // Then create the standard buttons (collapse, copy)
  const collapseButton = ensureButton(controls, "code-block-collapse");
  collapseButton.setAttribute(
    "aria-label",
    wrapper.classList.contains("collapsed") ? "Expand code" : "Collapse code",
  );
  setButtonIcon(
    collapseButton,
    wrapper.classList.contains("collapsed") ? ChevronsUpDown : ChevronsDownUp,
  );

  const copyButton = ensureButton(controls, "code-block-copy");
  copyButton.setAttribute("aria-label", "Copy code");
  setButtonIcon(copyButton, Copy);
}

function renderSvgMarkup(markup: string): DocumentFragment {
  const range = document.createRange();
  return range.createContextualFragment(markup);
}

function setMermaidLoading(pre: HTMLElement): void {
  const loading = document.createElement("div");
  loading.className = "mermaid-loading";
  loading.textContent = "⏳ Rendering diagram...";
  pre.replaceChildren(loading);
}

function setMermaidError(pre: HTMLElement, message: string): void {
  const error = document.createElement("div");
  error.className = "mermaid-error";
  const strong = document.createElement("strong");
  strong.textContent = "Mermaid Error:";
  error.append(strong, document.createElement("br"), message);
  pre.replaceChildren(error);
}

async function renderMermaidSvg(
  source: string,
  mermaidConfig: MermaidConfigFn = DEFAULT_MERMAID_CONFIG,
): Promise<string> {
  const theme = getPreviewTheme();
  mermaid.initialize(mermaidConfig(theme));

  const configHash = simpleHash(mermaidConfig.toString());
  const cacheKey = simpleHash(
    `${source}_${theme}_${STYLE_VERSION}_${configHash}`,
  );
  const cached = mermaidCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const { svg } = await mermaid.render(
    `example-react-mermaid-${cacheKey}`,
    source,
  );
  rememberMermaidSvg(cacheKey, svg);
  return svg;
}

async function renderMermaidIntoWrapper(
  root: HTMLElement,
  wrapper: HTMLElement,
  mermaidConfig: MermaidConfigFn,
): Promise<void> {
  const pre = wrapper.querySelector("pre");
  if (!(pre instanceof HTMLElement)) {
    return;
  }

  const source = getMermaidSource(wrapper);
  if (!source) {
    return;
  }

  const sourceKey = simpleHash(source);
  pre.dataset.mermaidSource = source;
  setMermaidLoading(pre);

  try {
    const svg = await renderMermaidSvg(source, mermaidConfig);
    if (!pre.isConnected || !root.contains(pre)) {
      return;
    }
    pre.replaceChildren(renderSvgMarkup(svg));
    pre.dataset.mermaidSource = source;
    pre.dataset.mermaidProcessed = "true";
    wrapper.dataset.mermaidStatus = "rendered";
    expandedMermaidSources.add(sourceKey);
  } catch (error) {
    if (!pre.isConnected || !root.contains(pre)) {
      return;
    }
    wrapper.dataset.mermaidStatus = "unrendered";
    setMermaidError(
      pre,
      error instanceof Error ? error.message : "Unknown Mermaid error",
    );
  }

  updateWrapperButtons(wrapper, false);
}

function showMermaidSource(wrapper: HTMLElement): void {
  const pre = wrapper.querySelector("pre");
  if (!(pre instanceof HTMLElement)) {
    return;
  }

  const source = getMermaidSource(wrapper);
  if (!source) {
    return;
  }

  const code = document.createElement("code");
  code.className = "language-mermaid";
  code.textContent = source;
  pre.replaceChildren(code);
  pre.dataset.mermaidSource = source;
  pre.dataset.mermaidProcessed = "false";
  wrapper.dataset.mermaidStatus = "code";
  expandedMermaidSources.delete(simpleHash(source));
  updateWrapperButtons(wrapper, false);
}

async function copyText(text: string): Promise<void> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // Fall through to the textarea fallback below.
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function flashCopySuccess(button: HTMLButtonElement): void {
  const existingTimer = copyResetTimers.get(button);
  if (existingTimer) {
    window.clearTimeout(existingTimer);
  }

  button.classList.add("copied");
  setButtonIcon(button, Check);

  const timeoutId = window.setTimeout(() => {
    button.classList.remove("copied");
    setButtonIcon(button, Copy);
    copyResetTimers.delete(button);
  }, 2000);

  copyResetTimers.set(button, timeoutId);
}

export async function applyPreviewEnhancements(
  root: HTMLElement,
  options: PreviewEnhancementOptions,
): Promise<void> {
  const mermaidConfig = options.mermaidConfig ?? DEFAULT_MERMAID_CONFIG;
  const wrappers = root.querySelectorAll(".code-block-wrapper");

  for (const wrapper of wrappers) {
    if (!(wrapper instanceof HTMLElement)) {
      continue;
    }
    updateWrapperButtons(wrapper, options.immediateRenderMermaid);
  }

  const mermaidWrappers = root.querySelectorAll(".code-block-wrapper");
  for (const wrapper of mermaidWrappers) {
    if (!(wrapper instanceof HTMLElement)) {
      continue;
    }
    if (getWrapperLanguage(wrapper).toLowerCase() !== "mermaid") {
      continue;
    }

    const source = getMermaidSource(wrapper);
    if (!source) {
      continue;
    }

    const sourceKey = simpleHash(source);
    const shouldRender =
      options.immediateRenderMermaid || expandedMermaidSources.has(sourceKey);

    if (shouldRender) {
      await renderMermaidIntoWrapper(root, wrapper, mermaidConfig);
      continue;
    }

    if (!wrapper.dataset.mermaidStatus) {
      wrapper.dataset.mermaidStatus = "unrendered";
    }
    updateWrapperButtons(wrapper, options.immediateRenderMermaid);
  }
}

export async function handlePreviewInteraction(
  root: HTMLElement,
  event: MouseEvent,
  options: PreviewInteractionOptions,
): Promise<void> {
  const target = event.target;
  if (!(target instanceof Element) || !root.contains(target)) {
    return;
  }

  const collapseButton = target.closest(".code-block-collapse");
  if (collapseButton instanceof HTMLButtonElement) {
    event.stopPropagation();
    const wrapper = getCodeBlockWrapper(collapseButton);
    if (!wrapper) {
      return;
    }
    wrapper.classList.toggle("collapsed");
    updateWrapperButtons(wrapper, false);
    return;
  }

  const copyButton = target.closest(".code-block-copy");
  if (copyButton instanceof HTMLButtonElement) {
    event.stopPropagation();
    const wrapper = getCodeBlockWrapper(copyButton);
    if (!wrapper) {
      return;
    }
    const pre = wrapper.querySelector("pre");
    const rawCode =
      wrapper.querySelector("code")?.textContent ??
      pre?.getAttribute("data-mermaid-source") ??
      "";
    if (!rawCode) {
      return;
    }
    await copyText(rawCode);
    flashCopySuccess(copyButton);
    return;
  }

  const maximizeButton = target.closest(".code-block-maximize");
  if (maximizeButton instanceof HTMLButtonElement) {
    event.stopPropagation();
    const wrapper = getCodeBlockWrapper(maximizeButton);
    if (!wrapper) {
      return;
    }

    const svg = wrapper.querySelector("pre svg");
    if (svg instanceof SVGElement) {
      options.onOpenMermaidPreview(svg.outerHTML);
      return;
    }

    const source = getMermaidSource(wrapper);
    if (!source) {
      return;
    }

    const markup = await renderMermaidSvg(
      source,
      options.mermaidConfig ?? DEFAULT_MERMAID_CONFIG,
    );
    options.onOpenMermaidPreview(markup);
    return;
  }

  const playButton = target.closest(".code-block-play");
  if (playButton instanceof HTMLButtonElement) {
    event.stopPropagation();
    const wrapper = getCodeBlockWrapper(playButton);
    if (!wrapper) {
      return;
    }

    if (wrapper.dataset.mermaidStatus === "rendered") {
      showMermaidSource(wrapper);
      return;
    }

    playButton.disabled = true;
    try {
      await renderMermaidIntoWrapper(
        root,
        wrapper,
        options.mermaidConfig ?? DEFAULT_MERMAID_CONFIG,
      );
    } finally {
      playButton.disabled = false;
    }
    return;
  }

  const renderedMermaid = target.closest(
    'pre[data-mermaid-processed="true"] svg',
  );
  if (renderedMermaid instanceof SVGElement) {
    event.stopPropagation();
    options.onOpenMermaidPreview(renderedMermaid.outerHTML);
  }
}
