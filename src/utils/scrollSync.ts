// Maps between 1-based (fractional) source lines and scroll offsets in the
// rendered preview, using the `data-sourcepos="L:C-L:C"` attributes emitted by
// the WASM renderer.
//
// The map is a piecewise-linear function through control points
// (line, offset): every rendered block contributes (startLine, top) and
// (endLine + 1, bottom), and paragraphs and code shown as source add one
// point per source line. Anything else (blank lines, rendered Mermaid
// diagrams, raw HTML such as iframe placeholders) is interpolated, and layout
// that changes heights is picked up on rebuild because offsets are measured
// from the live DOM.

// Only block elements: comrak also emits sourcepos on inline nodes (em, code,
// links...), whose boxes would add noisy, overlapping control points. `div`
// covers code-block wrappers, alerts, and display math.
const ANCHOR_SELECTOR = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "ul",
  "ol",
  "li",
  "table",
  "tr",
  "hr",
  "pre",
  "div",
]
  .map((tag) => `${tag}[data-sourcepos]`)
  .join(",");

const SOURCEPOS_REGEX = /^(\d+):\d+-(\d+):\d+$/;

export interface ScrollMap {
  /** Strictly increasing source lines. */
  lines: number[];
  /** Non-decreasing scroll offsets matching `lines`. */
  offsets: number[];
}

const isDocumentScroller = (scroller: HTMLElement): boolean =>
  scroller === document.scrollingElement;

/** Element whose `scroll` events reflect `scroller` moving. */
export const scrollEventTarget = (
  scroller: HTMLElement,
): HTMLElement | Window => (isDocumentScroller(scroller) ? window : scroller);

/** Nearest ancestor that scrolls vertically, else the document scroller. */
export const findScrollContainer = (element: HTMLElement): HTMLElement => {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);

    if (
      overflowY === "auto" ||
      overflowY === "scroll" ||
      overflowY === "overlay"
    ) {
      return node;
    }
  }

  const { scrollingElement } = document;

  return scrollingElement instanceof HTMLElement
    ? scrollingElement
    : document.documentElement;
};

/** Number of source lines in `markdown`. */
export const countLines = (markdown: string): number => {
  let lines = 1;

  for (let i = 0; i < markdown.length; i++) {
    if (markdown.charCodeAt(i) === 10) lines++;
  }

  return lines;
};

type ControlPoint = [line: number, offset: number];

/**
 * Add an exact control point for every source line that starts inside
 * `element`'s text. Paragraphs keep soft/hard breaks as "\n" in the HTML and
 * code shown as source keeps its newlines, so the first character after each
 * "\n" is where the next source line renders. Blank lines have no character
 * and stay interpolated; hidden text (collapsed code) has no rects.
 */
const addTextLinePoints = (
  element: Element,
  firstLine: number,
  origin: number,
  range: Range,
  points: ControlPoint[],
): void => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let line = firstLine;
  // The next character starts `line`.
  let atLineStart = true;

  while (walker.nextNode()) {
    const node = walker.currentNode;

    if (!(node instanceof Text)) continue;

    const text = node.data;
    let i = 0;

    while (i < text.length) {
      if (atLineStart) {
        if (text.charCodeAt(i) === 10) {
          line++;
          i++;
          continue;
        }

        range.setStart(node, i);
        range.setEnd(node, i + 1);

        const rect = range.getClientRects()[0];

        if (rect) points.push([line, rect.top - origin]);

        atLineStart = false;
      }

      const newline = text.indexOf("\n", i);

      if (newline < 0) break;

      line++;
      atLineStart = true;
      i = newline + 1;
    }
  }
};

/**
 * Measure every sourcepos-tagged block in `content` relative to the scroll
 * origin of `scroller`. Elements that are not rendered (display: none) are
 * skipped.
 */
export const buildScrollMap = (
  content: HTMLElement,
  scroller: HTMLElement,
  lineCount: number,
): ScrollMap => {
  // Viewport y of the scroller's content origin.
  const viewportTop = isDocumentScroller(scroller)
    ? 0
    : scroller.getBoundingClientRect().top + scroller.clientTop;

  const origin = viewportTop - scroller.scrollTop;
  const range = document.createRange();

  // Line 1 maps to the very top so "source at top" means "preview at top",
  // even when the first block has margin or the scroller has padding.
  const points: ControlPoint[] = [[1, 0]];

  for (const element of content.querySelectorAll<HTMLElement>(
    ANCHOR_SELECTOR,
  )) {
    const match = SOURCEPOS_REGEX.exec(element.dataset.sourcepos ?? "");

    if (!match) continue;

    const rect = element.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) continue;

    const startLine = Number(match[1]);

    points.push(
      [startLine, rect.top - origin],
      [Number(match[2]) + 1, rect.bottom - origin],
    );

    // Within multi-line text, measure each source line instead of spreading
    // the block's lines evenly over its height (which ignores code-block
    // headers/padding and uneven wrapping). Rendered Mermaid diagrams have no
    // <code> and keep the even spread.
    if (element.tagName === "P") {
      addTextLinePoints(element, startLine, origin, range, points);
    } else if (element.classList.contains("code-block-wrapper")) {
      const code = element.querySelector("pre > code");

      // Code starts on the line after the opening fence.
      if (code) addTextLinePoints(code, startLine + 1, origin, range, points);
    }
  }

  // Trailing lines after the last block run to the end of the content.
  points.push([lineCount + 1, content.getBoundingClientRect().bottom - origin]);

  // Nested blocks (li > p, blockquote > p) share lines; keep the smallest
  // offset per line, then drop any point that would make the map go backwards.
  points.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const lines: number[] = [];
  const offsets: number[] = [];

  for (const [line, offset] of points) {
    const last = lines.length - 1;

    if (last >= 0 && (line === lines[last] || offset < offsets[last])) continue;

    lines.push(line);
    offsets.push(offset);
  }

  return { lines, offsets };
};

/** Index of the last element of `values` (ascending) that is <= `target`, or -1. */
const lastIndexAtOrBelow = (values: number[], target: number): number => {
  let lo = 0;
  let hi = values.length - 1;
  let found = -1;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;

    if (values[mid] <= target) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return found;
};

const interpolate = (from: number[], to: number[], value: number): number => {
  const i = lastIndexAtOrBelow(from, value);

  if (i < 0) return to[0];

  if (i === from.length - 1) return to[i];

  const t = (value - from[i]) / (from[i + 1] - from[i]);

  return to[i] + t * (to[i + 1] - to[i]);
};

/** Scroll offset that puts source `line` at the top of the scroller. */
export const lineToOffset = (map: ScrollMap, line: number): number =>
  interpolate(map.lines, map.offsets, line);

/** Source line at scroll offset `offset`. */
export const offsetToLine = (map: ScrollMap, offset: number): number =>
  interpolate(map.offsets, map.lines, offset);
