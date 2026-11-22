import guide from "@solid-markdown-wasm/example-shared/assets/markdown_preview.md?raw";
import type { FileTreeMutationEvent } from "solid-trees";
import gantt from "./assets/gantt_test.md?raw";

/**
 * Paths follow solid-trees: `/`-separated, no leading slash, and folders
 * end in `/` (`notes/`), files do not (`notes/todo.md`).
 */
export interface MarkdownFile {
  /** Stable across renames and moves; keys the tab and the editor model. */
  id: string;
  path: string;
  content: string;
}

export interface Workspace {
  files: MarkdownFile[];
  /** Explicit folders, so empty ones survive a reload. */
  folders: string[];
  /** Ids of the files open as tabs, in tab order. */
  openIds: string[];
  /** Null when no tab is open. */
  activeId: string | null;
}

/** Bump when the stored shape changes; older data is set aside, not read. */
const VERSION = 1;

interface StoredWorkspace extends Workspace {
  version: number;
}

export const STORAGE_KEY = "solid-markdown-wasm:workspace";

/** Where unreadable saved data goes instead of being overwritten. */
const BACKUP_KEY = `${STORAGE_KEY}:rejected`;

export const isFolder = (path: string) => path.endsWith("/");

/** Last path segment, without a folder's trailing slash. */
export const baseName = (path: string) => {
  const end = isFolder(path) ? path.length - 1 : path.length;

  return path.slice(path.lastIndexOf("/", end - 1) + 1, end);
};

/** Folder holding `path` (`""` at the root). */
export const parentFolder = (path: string) =>
  path.slice(
    0,
    path.lastIndexOf("/", isFolder(path) ? path.length - 2 : path.length) + 1,
  );

export const newFileId = () =>
  `file-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const defaultWorkspace = (): Workspace => {
  const welcome = { id: newFileId(), path: "guide.md", content: guide };

  return {
    files: [
      welcome,
      { id: newFileId(), path: "examples/gantt.md", content: gantt },
    ],
    folders: [],
    openIds: [welcome.id],
    activeId: welcome.id,
  };
};

// Relative, no empty segments; the trailing slash must match the kind.
const isValidPath = (path: string, folder: boolean) =>
  path !== "" &&
  !path.startsWith("/") &&
  !path
    .slice(0, folder ? -1 : undefined)
    .split("/")
    .includes("") &&
  isFolder(path) === folder;

/**
 * Decode saved data into a workspace the tree will accept, or null. The tree
 * throws on duplicate paths and on a file and folder sharing a name, which
 * would otherwise break every load.
 */
const decodeWorkspace = (raw: string): Workspace | null => {
  // SAFETY: only `version` and the array checks are trusted from this
  // assertion; every entry is coerced with String() and validated below, and
  // a null entry throws into the caller's catch.
  const stored = JSON.parse(raw) as Partial<StoredWorkspace> | null;

  if (
    stored?.version !== VERSION ||
    !Array.isArray(stored.files) ||
    !Array.isArray(stored.folders) ||
    !Array.isArray(stored.openIds)
  ) {
    return null;
  }

  const files = stored.files.map((file) => ({
    id: String(file.id),
    path: String(file.path),
    content: String(file.content),
  }));

  const folders = [...new Set(stored.folders.map(String))];
  const ids = new Set(files.map((file) => file.id));
  const filePaths = new Set(files.map((file) => file.path));

  // Every folder the paths imply, so a file can't shadow one.
  const impliedFolders = new Set(
    [...filePaths, ...folders].flatMap((path) =>
      path
        .split("/")
        .slice(0, -1)
        .map(
          (_, index, segments) => `${segments.slice(0, index + 1).join("/")}/`,
        ),
    ),
  );

  const valid =
    ids.size === files.length &&
    filePaths.size === files.length &&
    files.every(
      (file) =>
        file.id !== "" &&
        isValidPath(file.path, false) &&
        !impliedFolders.has(`${file.path}/`),
    ) &&
    folders.every((folder) => isValidPath(folder, true));

  if (!valid) return null;

  const openIds = [...new Set(stored.openIds.map(String))].filter((id) =>
    ids.has(id),
  );

  const activeId = String(stored.activeId);

  return {
    files,
    folders,
    openIds,
    activeId: openIds.includes(activeId) ? activeId : (openIds[0] ?? null),
  };
};

/** Keep `raw` under the backup key and start over with the sample files. */
const setAside = (raw: string | null): Workspace => {
  console.warn(`Saved workspace is unreadable; kept it as "${BACKUP_KEY}".`);

  try {
    if (raw !== null) localStorage.setItem(BACKUP_KEY, raw);
  } catch {
    // Nowhere to keep it; the fresh workspace replaces it on the next save.
  }

  return defaultWorkspace();
};

export const loadWorkspace = (): Workspace => {
  let raw: string | null = null;

  try {
    raw = localStorage.getItem(STORAGE_KEY);

    if (raw === null) return defaultWorkspace();

    return decodeWorkspace(raw) ?? setAside(raw);
  } catch {
    return setAside(raw);
  }
};

/**
 * Last resort when the tree still rejects a decoded workspace: set the saved
 * data aside and start over.
 */
export const discardSavedWorkspace = (): Workspace => {
  let raw: string | null = null;

  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage blocked: nothing to keep.
  }

  return setAside(raw);
};

/** False when the browser refused the write (storage full or blocked). */
export const saveWorkspace = (workspace: Workspace): boolean => {
  const stored: StoredWorkspace = { version: VERSION, ...workspace };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    return true;
  } catch {
    return false;
  }
};

/** Open `path` in a tab (if it isn't already) and make it active. */
export const openPath = (workspace: Workspace, path: string): Workspace => {
  const file = workspace.files.find((candidate) => candidate.path === path);

  if (!file) return workspace;

  const open = workspace.openIds.includes(file.id);

  if (open && workspace.activeId === file.id) return workspace;

  return {
    ...workspace,
    openIds: open ? workspace.openIds : [...workspace.openIds, file.id],
    activeId: file.id,
  };
};

/** Make an open tab active. */
export const activate = (workspace: Workspace, id: string): Workspace =>
  workspace.activeId === id || !workspace.openIds.includes(id)
    ? workspace
    : { ...workspace, activeId: id };

/** Close tabs; a closed active tab hands over to its right, else left, neighbour. */
export const closeTabs = (
  workspace: Workspace,
  ids: readonly string[],
): Workspace => {
  if (!workspace.openIds.some((id) => ids.includes(id))) return workspace;

  const openIds = workspace.openIds.filter((id) => !ids.includes(id));

  if (workspace.activeId === null || !ids.includes(workspace.activeId)) {
    return { ...workspace, openIds };
  }

  // Tabs before the active one that stay open: the neighbour sits right after them.
  const kept = workspace.openIds
    .slice(0, workspace.openIds.indexOf(workspace.activeId))
    .filter((id) => !ids.includes(id)).length;

  return {
    ...workspace,
    openIds,
    activeId: openIds[Math.min(kept, openIds.length - 1)] ?? null,
  };
};

export const setContent = (
  workspace: Workspace,
  id: string,
  content: string,
): Workspace => ({
  ...workspace,
  files: workspace.files.map((file) =>
    file.id === id ? { ...file, content } : file,
  ),
});

/** First free `untitled.md` / `folder/` style name in `folder`. */
export const freePath = (
  workspace: Workspace,
  folder: string,
  kind: "file" | "folder",
) => {
  const paths = [
    ...workspace.files.map((file) => file.path),
    ...workspace.folders,
  ];

  // The tree allows one entry per name, file or folder; a folder name is also
  // taken by any path inside it, even if the folder was never created alone.
  const taken = (path: string) =>
    paths.some((existing) =>
      kind === "folder"
        ? existing.startsWith(path) || existing === path.slice(0, -1)
        : existing === path || existing.startsWith(`${path}/`),
    );

  const name = (n: number) => {
    const suffix = n === 1 ? "" : `-${n}`;

    return kind === "file" ? `untitled${suffix}.md` : `folder${suffix}/`;
  };

  let n = 1;

  while (taken(folder + name(n))) n += 1;

  return folder + name(n);
};

/**
 * When a move or delete empties the folder that held `path`, the tree keeps
 * showing it; record it so it survives a reload. Its ancestors need no entry:
 * they contain it.
 */
const keepEmptiedFolder = (workspace: Workspace, path: string): Workspace => {
  const folder = parentFolder(path);

  const occupied =
    workspace.files.some((file) => file.path.startsWith(folder)) ||
    workspace.folders.some((existing) => existing.startsWith(folder));

  if (folder === "" || occupied) return workspace;

  return { ...workspace, folders: [...workspace.folders, folder] };
};

const movedPath = (path: string, from: string, to: string) => {
  if (path === from) return to;

  if (isFolder(from) && path.startsWith(from))
    return to + path.slice(from.length);

  return path;
};

/**
 * Mirror a change the tree made (rename, drag and drop, add, delete) so the
 * workspace keeps owning file contents and tabs. `newId` names files the
 * tree added.
 */
export const applyTreeMutation = (
  workspace: Workspace,
  event: FileTreeMutationEvent,
  newId: () => string,
): Workspace => {
  switch (event.operation) {
    case "add": {
      if (isFolder(event.path)) {
        return { ...workspace, folders: [...workspace.folders, event.path] };
      }

      if (workspace.files.some((file) => file.path === event.path))
        return workspace;

      return {
        ...workspace,
        files: [
          ...workspace.files,
          { id: newId(), path: event.path, content: "" },
        ],
      };
    }

    case "move": {
      // The tree reports `to` canonically; `from` is spelled as the caller
      // wrote it, so a folder may arrive without its trailing slash.
      const from =
        isFolder(event.to) && !isFolder(event.from)
          ? `${event.from}/`
          : event.from;

      return keepEmptiedFolder(
        {
          ...workspace,
          files: workspace.files.map((file) => ({
            ...file,
            path: movedPath(file.path, from, event.to),
          })),
          folders: workspace.folders.map((folder) =>
            movedPath(folder, from, event.to),
          ),
        },
        from,
      );
    }

    case "remove": {
      const removed = (path: string) =>
        isFolder(event.path)
          ? path.startsWith(event.path)
          : path === event.path;

      const removedIds = workspace.files.flatMap((file) =>
        removed(file.path) ? [file.id] : [],
      );

      return closeTabs(
        keepEmptiedFolder(
          {
            ...workspace,
            files: workspace.files.filter((file) => !removed(file.path)),
            folders: workspace.folders.filter((folder) => !removed(folder)),
          },
          event.path,
        ),
        removedIds,
      );
    }

    case "batch":
      return event.events.reduce(
        (current, inner) => applyTreeMutation(current, inner, newId),
        workspace,
      );

    case "reset":
      return workspace;
  }
};
