import type { FileTree } from "@pierre/trees";
import * as stylex from "@stylexjs/stylex";
import { FilePlus, FolderPlus } from "lucide";
import { type Component, onSettled } from "solid-js";
import { listenForFileActivation } from "../fileTree";
import { color, font } from "../tokens.stylex";
import { Icon } from "./Icon";
import { Pane } from "./Pane";

const styles = stylex.create({
  actions: {
    display: "flex",
    gap: 2,
  },
  iconButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
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
  // The tree renders in a shadow root; these variables are its theme surface.
  tree: {
    position: "absolute",
    inset: 0,
    "--trees-theme-sidebar-bg": color.bg,
    "--trees-theme-sidebar-fg": color.fg,
    "--trees-theme-sidebar-header-fg": color.muted,
    "--trees-theme-sidebar-border": color.border,
    "--trees-theme-list-hover-bg": color.hover,
    "--trees-theme-list-active-selection-bg": `color-mix(in srgb, ${color.accent} 18%, transparent)`,
    "--trees-theme-list-active-selection-fg": color.fg,
    "--trees-theme-focus-ring": color.focus,
    "--trees-theme-input-bg": color.surface,
    "--trees-theme-input-fg": color.fg,
    "--trees-theme-scrollbar-thumb": color.border,
    "--trees-font-family-override": font.sans,
    "--trees-font-size-override": "13px",
  },
});

interface FileExplorerProps {
  tree: FileTree;
  /** A file was clicked, or Enter was pressed on it, in the tree. */
  onOpenFile: (path: string) => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  xstyle?: stylex.StyleXStyles;
}

/** Sidebar that mounts `tree` for as long as it is rendered. */
export const FileExplorer: Component<FileExplorerProps> = (props) => {
  let host: HTMLDivElement | undefined;

  onSettled(() => {
    if (!host) return;

    props.tree.render({ fileTreeContainer: host });

    const stopListening = listenForFileActivation(props.tree, host, (path) =>
      props.onOpenFile(path),
    );

    return () => {
      stopListening();
      props.tree.unmount();
    };
  });

  return (
    <Pane
      title="Files"
      meta={
        <span {...stylex.attrs(styles.actions)}>
          <button
            type="button"
            aria-label="New file"
            title="New file"
            {...stylex.attrs(styles.iconButton)}
            onClick={() => props.onNewFile()}
          >
            <Icon icon={FilePlus} size={15} />
          </button>
          <button
            type="button"
            aria-label="New folder"
            title="New folder"
            {...stylex.attrs(styles.iconButton)}
            onClick={() => props.onNewFolder()}
          >
            <Icon icon={FolderPlus} size={15} />
          </button>
        </span>
      }
      xstyle={props.xstyle}
    >
      <div ref={host} {...stylex.attrs(styles.tree)} />
    </Pane>
  );
};
