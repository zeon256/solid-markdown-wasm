import logo from "@solid-markdown-wasm/example-shared/assets/logo.svg";
import {
  CODE_THEMES,
  type Themes,
  parseCodeTheme,
} from "@solid-markdown-wasm/example-shared/constants";
import * as stylex from "@stylexjs/stylex";
import { Moon, Package, Sun } from "lucide-solid";
import { type Component, For, Show } from "solid-js";
import { color } from "../tokens.stylex";

const REPO_URL = "https://github.com/zeon256/solid-markdown-wasm";
const NPM_URL = "https://www.npmjs.com/package/solid-markdown-wasm";
const ICON_SIZE = 16;

// Phones: drop the decorative tagline and divider so the controls fit.
const NARROW = "@media (max-width: 640px)";

// lucide deprecated its brand icons, so the GitHub mark is inlined.
const GithubMark: Component = () => (
  <svg
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const styles = stylex.create({
  bar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 24,
    rowGap: 10,
    paddingBlock: 10,
    paddingInline: 20,
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: color.border,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
    color: color.fg,
    textDecoration: "none",
  },
  logo: {
    width: 24,
    height: 24,
    flexShrink: 0,
  },
  name: {
    margin: 0,
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: "-0.01em",
  },
  tagline: {
    display: {
      default: "inline",
      [NARROW]: "none",
    },
    paddingInlineStart: 10,
    borderInlineStartWidth: 1,
    borderInlineStartStyle: "solid",
    borderInlineStartColor: color.border,
    fontSize: 13,
    color: color.muted,
  },
  controls: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
  },
  field: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: color.muted,
    cursor: "pointer",
  },
  select: {
    maxWidth: 200,
    height: 30,
    paddingInline: 8,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: 6,
    backgroundColor: color.bg,
    color: color.fg,
    font: "inherit",
    cursor: "pointer",
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${color.focus}`,
    },
    outlineOffset: 1,
  },
  checkbox: {
    width: 15,
    height: 15,
    margin: 0,
    accentColor: color.accent,
    cursor: "pointer",
  },
  separator: {
    display: {
      default: "block",
      [NARROW]: "none",
    },
    width: 1,
    height: 20,
    backgroundColor: color.border,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  iconButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    padding: 0,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: 6,
    backgroundColor: {
      default: "transparent",
      ":hover": color.hover,
    },
    color: {
      default: color.muted,
      ":hover": color.fg,
    },
    cursor: "pointer",
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${color.focus}`,
    },
    outlineOffset: 1,
    transitionProperty: "background-color, color",
    transitionDuration: "120ms",
  },
});

interface HeaderProps {
  isDark: boolean;
  onToggleColorScheme: () => void;
  codeTheme: Themes;
  onCodeThemeChange: (theme: Themes) => void;
  autoRenderMermaid: boolean;
  onAutoRenderMermaidChange: (enabled: boolean) => void;
}

export const Header: Component<HeaderProps> = (props) => (
  <header {...stylex.attrs(styles.bar)}>
    <a href={REPO_URL} {...stylex.attrs(styles.brand)}>
      <img src={logo} alt="" {...stylex.attrs(styles.logo)} />
      <h1 {...stylex.attrs(styles.name)}>solid-markdown-wasm</h1>
      <span {...stylex.attrs(styles.tagline)}>Live preview</span>
    </a>

    <div {...stylex.attrs(styles.controls)}>
      <label {...stylex.attrs(styles.field)}>
        Code theme
        <select
          {...stylex.attrs(styles.select)}
          value={props.codeTheme}
          onChange={(event) => {
            const theme = parseCodeTheme(event.currentTarget.value);

            if (theme) props.onCodeThemeChange(theme);
          }}
        >
          <For each={CODE_THEMES}>
            {(theme) => <option value={theme}>{theme}</option>}
          </For>
        </select>
      </label>

      <label {...stylex.attrs(styles.field)}>
        <input
          type="checkbox"
          {...stylex.attrs(styles.checkbox)}
          checked={props.autoRenderMermaid}
          onChange={(event) =>
            props.onAutoRenderMermaidChange(event.currentTarget.checked)
          }
        />
        Auto-render Mermaid
      </label>

      <span {...stylex.attrs(styles.separator)} aria-hidden="true" />

      <div {...stylex.attrs(styles.actions)}>
        <button
          type="button"
          {...stylex.attrs(styles.iconButton)}
          aria-label={
            props.isDark ? "Switch to light theme" : "Switch to dark theme"
          }
          title={
            props.isDark ? "Switch to light theme" : "Switch to dark theme"
          }
          onClick={() => props.onToggleColorScheme()}
        >
          <Show when={props.isDark} fallback={<Moon size={ICON_SIZE} />}>
            <Sun size={ICON_SIZE} />
          </Show>
        </button>
        <a
          href={NPM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="solid-markdown-wasm on npm"
          title="npm"
          {...stylex.attrs(styles.iconButton)}
        >
          <Package size={ICON_SIZE} />
        </a>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Source on GitHub"
          title="GitHub"
          {...stylex.attrs(styles.iconButton)}
        >
          <GithubMark />
        </a>
      </div>
    </div>
  </header>
);
