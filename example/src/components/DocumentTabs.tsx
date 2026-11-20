import * as stylex from "@stylexjs/stylex";
import { Plus, X } from "lucide";
import { type Component, For, createMemo, onFlush } from "solid-js";
import { type MarkdownFile, baseName } from "../workspace";
import { color } from "../tokens.stylex";
import { Icon } from "./Icon";

const styles = stylex.create({
  bar: {
    display: "flex",
    alignItems: "stretch",
    height: 36,
    flexShrink: 0,
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: color.borderMuted,
  },
  list: {
    display: "flex",
    minWidth: 0,
    overflowX: "auto",
    scrollbarWidth: "none",
  },
  tab: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    maxWidth: 200,
    borderInlineEndWidth: 1,
    borderInlineEndStyle: "solid",
    borderInlineEndColor: color.borderMuted,
    color: {
      default: color.muted,
      ":hover": color.fg,
    },
  },
  tabActive: {
    backgroundColor: color.bg,
    color: color.fg,
    // Covers the bar's bottom border so the tab joins the editor below.
    marginBottom: -1,
    boxShadow: `inset 0 2px 0 ${color.accent}`,
  },
  select: {
    minWidth: 0,
    height: "100%",
    paddingInlineStart: 14,
    paddingInlineEnd: 4,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: "inherit",
    font: "inherit",
    fontSize: 13,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    cursor: "pointer",
    outline: {
      default: "none",
      ":focus-visible": `2px solid ${color.focus}`,
    },
    outlineOffset: -2,
  },
  iconButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: 22,
    height: 22,
    padding: 0,
    borderWidth: 0,
    borderRadius: 4,
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
  },
  close: {
    marginInlineEnd: 6,
  },
  add: {
    alignSelf: "center",
    marginInline: 6,
  },
});

interface DocumentTabsProps {
  files: readonly MarkdownFile[];
  /** Null only when no tab is open. */
  activeId: string | null;
  /** Id of the element the tabs control (the editor panel). */
  panelId: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onAdd: () => void;
}

/** DOM id of a file's tab, for the panel's `aria-labelledby`. */
export const tabId = (fileId: string) => `tab-${fileId}`;

export const DocumentTabs: Component<DocumentTabsProps> = (props) => {
  let list: HTMLDivElement | undefined;
  let addButton: HTMLButtonElement | undefined;

  // Open files per name: a shared name shows the whole path instead.
  const nameCounts = createMemo(() => {
    const counts = new Map<string, number>();

    for (const file of props.files) {
      const name = baseName(file.path);

      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    return counts;
  });

  // Arrow keys, Home and End move between tabs (automatic activation);
  // Delete closes the focused tab and hands focus to the tab that takes over.
  const handleKeyDown = (event: KeyboardEvent, id: string) => {
    const ids = props.files.map((file) => file.id);
    const index = ids.indexOf(id);
    let next: number;

    switch (event.key) {
      case "ArrowLeft":
        next = (index - 1 + ids.length) % ids.length;
        break;
      case "ArrowRight":
        next = (index + 1) % ids.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = ids.length - 1;
        break;
      case "Delete":
        event.preventDefault();
        props.onClose(id);
        // The closed tab's button is gone after the update; with no tabs
        // left, focus lands on "New file" rather than the page.
        onFlush(() => {
          const activeTab = list?.querySelector<HTMLElement>(
            '[role="tab"][aria-selected="true"]',
          );

          (activeTab ?? addButton)?.focus();
        });

        return;
      default:
        return;
    }

    event.preventDefault();
    props.onSelect(ids[next]);
    list?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
  };

  return (
    <div {...stylex.attrs(styles.bar)}>
      <div
        ref={list}
        role="tablist"
        aria-label="Open files"
        {...stylex.attrs(styles.list)}
      >
        <For each={props.files} keyed={(file) => file.id}>
          {(file) => {
            const active = () => file().id === props.activeId;

            const label = () => {
              const name = baseName(file().path);

              return (nameCounts().get(name) ?? 0) > 1 ? file().path : name;
            };

            return (
              <div
                {...stylex.attrs(
                  styles.tab,
                  file().id === props.activeId && styles.tabActive,
                )}
              >
                <button
                  type="button"
                  role="tab"
                  id={tabId(file().id)}
                  aria-controls={props.panelId}
                  aria-selected={active() ? "true" : "false"}
                  aria-keyshortcuts="Delete"
                  tabindex={active() ? 0 : -1}
                  title={file().path}
                  {...stylex.attrs(styles.select)}
                  onClick={() => props.onSelect(file().id)}
                  onKeyDown={(event) => handleKeyDown(event, file().id)}
                  // Middle click closes, as in browsers and editors; stopping
                  // the press keeps it from starting autoscroll.
                  onMouseDown={(event) => {
                    if (event.button === 1) event.preventDefault();
                  }}
                  onAuxClick={(event) => {
                    if (event.button === 1) props.onClose(file().id);
                  }}
                >
                  {label()}
                </button>
                <button
                  type="button"
                  tabindex={-1}
                  aria-label={`Close ${file().path}`}
                  title="Close"
                  {...stylex.attrs(styles.iconButton, styles.close)}
                  onClick={() => props.onClose(file().id)}
                >
                  <Icon icon={X} size={14} />
                </button>
              </div>
            );
          }}
        </For>
      </div>
      <button
        ref={addButton}
        type="button"
        aria-label="New file"
        title="New file"
        {...stylex.attrs(styles.iconButton, styles.add)}
        onClick={() => props.onAdd()}
      >
        <Icon icon={Plus} size={16} />
      </button>
    </div>
  );
};
