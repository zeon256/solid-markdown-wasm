import * as stylex from "@stylexjs/stylex";
import { Plus, X } from "lucide";
import { type Component, For, Show, createMemo } from "solid-js";
import { type MarkdownDocument, documentTitle } from "../documents";
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
  selectOnly: {
    paddingInlineEnd: 14,
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
  documents: readonly MarkdownDocument[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onAdd: () => void;
}

export const DocumentTabs: Component<DocumentTabsProps> = (props) => {
  let list: HTMLDivElement | undefined;

  // Arrow keys, Home and End move between tabs (automatic activation).
  const handleKeyDown = (event: KeyboardEvent) => {
    const ids = props.documents.map((doc) => doc.id);
    const index = ids.indexOf(props.activeId);
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
        aria-label="Documents"
        {...stylex.attrs(styles.list)}
      >
        <For each={props.documents} keyed={(doc) => doc.id}>
          {(doc) => {
            const title = createMemo(() => documentTitle(doc().content));
            const active = () => doc().id === props.activeId;
            const closable = () => props.documents.length > 1;

            return (
              <div
                {...stylex.attrs(
                  styles.tab,
                  doc().id === props.activeId && styles.tabActive,
                )}
                // Middle click closes, as in browsers and editors.
                onAuxClick={(event) => {
                  if (event.button === 1 && closable()) props.onClose(doc().id);
                }}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={active() ? "true" : "false"}
                  tabindex={active() ? 0 : -1}
                  title={title()}
                  {...stylex.attrs(
                    styles.select,
                    props.documents.length === 1 && styles.selectOnly,
                  )}
                  onClick={() => props.onSelect(doc().id)}
                  onKeyDown={handleKeyDown}
                >
                  {title()}
                </button>
                <Show when={closable()}>
                  <button
                    type="button"
                    tabindex={-1}
                    aria-label={`Close ${title()}`}
                    title="Close"
                    {...stylex.attrs(styles.iconButton, styles.close)}
                    onClick={() => props.onClose(doc().id)}
                  >
                    <Icon icon={X} size={14} />
                  </button>
                </Show>
              </div>
            );
          }}
        </For>
      </div>
      <button
        type="button"
        aria-label="New document"
        title="New document"
        {...stylex.attrs(styles.iconButton, styles.add)}
        onClick={() => props.onAdd()}
      >
        <Icon icon={Plus} size={16} />
      </button>
    </div>
  );
};
