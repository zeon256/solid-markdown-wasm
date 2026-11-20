import {
  type ContextMenuAnchorRect,
  type ContextMenuItem,
  type ContextMenuOpenContext,
  FileTree,
  type FileTreeMutationEvent,
} from "@pierre/trees";
import { render } from "@solidjs/web";
import * as stylex from "@stylexjs/stylex";
import { FilePlus, FolderPlus, Pencil, Trash2 } from "lucide";
import { type Component, onCleanup } from "solid-js";
import { Icon } from "./components/Icon";
import { color } from "./tokens.stylex";
import { type Workspace, isFolder } from "./workspace";

export type EntryKind = "file" | "folder";

export interface WorkspaceTreeHandlers {
  /** The tree's paths changed (rename, drag and drop, add, delete). */
  onMutation: (event: FileTreeMutationEvent) => void;
  /** "New file" / "New folder" was chosen for `folder`. */
  onCreate: (kind: EntryKind, folder: string) => void;
}

const styles = stylex.create({
  menu: {
    // The tree's shadow root clips with `overflow: hidden` (and has no
    // transform or containment), so a fixed menu escapes the sidebar.
    position: "fixed",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    minWidth: 160,
    padding: 4,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: 8,
    backgroundColor: color.bg,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.18)",
  },
  placement: (top: string, right: string, bottom: string, left: string) => ({
    top,
    right,
    bottom,
    left,
  }),
  item: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    height: 28,
    paddingInline: 8,
    borderWidth: 0,
    borderRadius: 4,
    backgroundColor: {
      default: "transparent",
      ":hover": color.hover,
      ":focus-visible": color.hover,
    },
    color: color.fg,
    font: "inherit",
    fontSize: 13,
    textAlign: "start",
    cursor: "pointer",
    outline: "none",
  },
  danger: {
    color: color.danger,
  },
});

interface TreeMenuProps {
  tree: FileTree;
  item: ContextMenuItem;
  context: ContextMenuOpenContext;
  onCreate: WorkspaceTreeHandlers["onCreate"];
}

const GAP = 4;

// Opens toward the roomier side of the anchor, so it stays on screen without
// measuring itself first.
const placement = ({ top, right, bottom, left }: ContextMenuAnchorRect) => {
  const below = top < window.innerHeight / 2;
  const rightward = left < window.innerWidth / 2;

  return styles.placement(
    below ? `${bottom + GAP}px` : "auto",
    rightward ? "auto" : `${window.innerWidth - right}px`,
    below ? "auto" : `${window.innerHeight - top + GAP}px`,
    rightward ? `${left}px` : "auto",
  );
};

// Up/Down (wrapping), Home and End move between items, as in native menus;
// Tab leaves the menu, so it closes like Escape does.
const handleMenuKeyDown = (
  event: KeyboardEvent,
  context: ContextMenuOpenContext,
) => {
  const menu = event.currentTarget;

  if (!(menu instanceof HTMLElement)) return;

  if (event.key === "Tab") {
    context.close();

    return;
  }

  const items = [...menu.querySelectorAll<HTMLElement>('[role="menuitem"]')];
  const index = items.findIndex((item) => item === document.activeElement);
  let next: number;

  switch (event.key) {
    case "ArrowDown":
      next = (index + 1) % items.length;
      break;
    case "ArrowUp":
      // With nothing focused yet, Up starts from the bottom.
      next = (index === -1 ? items.length : index) - 1;
      next = (next + items.length) % items.length;
      break;
    case "Home":
      next = 0;
      break;
    case "End":
      next = items.length - 1;
      break;
    default:
      return;
  }

  event.preventDefault();
  items[next]?.focus();
};

const TreeMenu: Component<TreeMenuProps> = (props) => {
  const isFolder = props.item.kind === "directory";
  // Canonical tree path: folders end in `/`.
  const path = props.item.path;

  // Placement is computed once from the anchor; a resize would strand it.
  const close = () => props.context.close();

  window.addEventListener("resize", close);
  onCleanup(() => window.removeEventListener("resize", close));

  const create = (kind: EntryKind) => {
    props.context.close({ restoreFocus: false });
    props.onCreate(kind, path);
  };

  return (
    <div
      role="menu"
      tabindex={-1}
      aria-label={`Actions for ${props.item.name}`}
      {...stylex.attrs(styles.menu, placement(props.context.anchorRect))}
      onKeyDown={(event) => handleMenuKeyDown(event, props.context)}
    >
      {isFolder && (
        <>
          <button
            type="button"
            role="menuitem"
            {...stylex.attrs(styles.item)}
            onClick={() => create("file")}
          >
            <Icon icon={FilePlus} size={14} />
            New file
          </button>
          <button
            type="button"
            role="menuitem"
            {...stylex.attrs(styles.item)}
            onClick={() => create("folder")}
          >
            <Icon icon={FolderPlus} size={14} />
            New folder
          </button>
        </>
      )}
      <button
        type="button"
        role="menuitem"
        {...stylex.attrs(styles.item)}
        onClick={() => {
          // The rename input takes focus; restoring it to the row would steal it.
          props.context.close({ restoreFocus: false });
          props.tree.startRenaming(path);
        }}
      >
        <Icon icon={Pencil} size={14} />
        Rename
      </button>
      <button
        type="button"
        role="menuitem"
        {...stylex.attrs(styles.item, styles.danger)}
        onClick={() => {
          props.context.close();

          const what = isFolder
            ? `the folder ${path} and everything in it`
            : path;

          if (window.confirm(`Delete ${what}?`)) {
            props.tree.remove(path, { recursive: isFolder });
          }
        }}
      >
        <Icon icon={Trash2} size={14} />
        Delete
      </button>
    </div>
  );
};

/**
 * Build the sidebar tree over the workspace's files and folders. The tree owns
 * structure edits (rename, drag and drop, add, delete) and reports each one
 * through `onMutation`; the workspace follows along. Opening files is not tied
 * to selection, which renames, drags, deletes and multi-select also change;
 * see `listenForFileActivation`.
 */
export const createWorkspaceTree = (
  workspace: Workspace,
  handlers: WorkspaceTreeHandlers,
): FileTree => {
  const active = workspace.files.find((file) => file.id === workspace.activeId);
  let disposeMenu: (() => void) | undefined;

  const tree: FileTree = new FileTree({
    paths: [...workspace.folders, ...workspace.files.map((file) => file.path)],
    initialExpansion: "open",
    initialSelectedPaths: active ? [active.path] : [],
    search: true,
    fileTreeSearchMode: "hide-non-matches",
    density: "compact",
    icons: "standard",
    // Failures are shown, not swallowed; the tree has already reverted.
    renaming: { onError: (message) => window.alert(message) },
    dragAndDrop: { onDropError: (message) => window.alert(message) },
    composition: {
      contextMenu: {
        triggerMode: "both",
        buttonVisibility: "when-needed",
        render: (item, context) => {
          const host = document.createElement("div");

          disposeMenu?.();
          disposeMenu = render(
            () => (
              <TreeMenu
                tree={tree}
                item={item}
                context={context}
                onCreate={handlers.onCreate}
              />
            ),
            host,
          );

          return host;
        },
        onClose: () => {
          disposeMenu?.();
          disposeMenu = undefined;
        },
      },
    },
  });

  tree.onMutation("*", handlers.onMutation);

  return tree;
};

/**
 * Open files the user activates in the tree: a plain click on a file row, or
 * Enter on the focused file (also from the search box, where Enter picks the
 * focused match). Returns a function that stops listening.
 */
export const listenForFileActivation = (
  tree: FileTree,
  host: HTMLElement,
  onOpen: (path: string) => void,
): (() => void) => {
  const handleClick = (event: MouseEvent) => {
    const modified =
      event.shiftKey || event.ctrlKey || event.metaKey || event.altKey;

    if (event.button !== 0 || modified) return;

    for (const entry of event.composedPath()) {
      // Clicks inside the rename input or on the row's ⋯ button aren't opens.
      if (entry instanceof HTMLInputElement) return;

      if (!(entry instanceof HTMLElement)) continue;

      if (entry.dataset.type === "context-menu-trigger") return;

      if (entry.getAttribute("role") === "treeitem") {
        const path = entry.dataset.itemPath;

        if (entry.dataset.itemType === "file" && path) onOpen(path);

        return;
      }
    }
  };

  // Capture phase: the tree stops Enter from propagating inside search.
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" || event.isComposing) return;

    // Enter in the rename input commits the name instead.
    const typing = event.composedPath()[0] instanceof HTMLInputElement;

    if (typing && !tree.isSearchOpen()) return;

    const path = tree.getFocusedPath();

    if (path !== null && !isFolder(path)) onOpen(path);
  };

  host.addEventListener("click", handleClick);
  host.addEventListener("keydown", handleKeyDown, true);

  return () => {
    host.removeEventListener("click", handleClick);
    host.removeEventListener("keydown", handleKeyDown, true);
  };
};
