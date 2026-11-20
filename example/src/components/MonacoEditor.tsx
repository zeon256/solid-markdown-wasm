import type { JSX } from "@solidjs/web";
import * as stylex from "@stylexjs/stylex";
import type * as MonacoApi from "monaco-editor";
import {
  type Component,
  Show,
  createEffect,
  createSignal,
  onSettled,
} from "solid-js";

export type Monaco = typeof MonacoApi;

export type Editor = MonacoApi.editor.IStandaloneCodeEditor;

export type EditorOptions =
  MonacoApi.editor.IStandaloneEditorConstructionOptions;

export interface MonacoEditorProps {
  /**
   * Identifies the document being edited. Each path gets its own model, so
   * switching paths keeps that document's undo stack, cursor, and scroll.
   * Null shows no document.
   */
  path: string | null;
  /** Paths whose models stay alive; any other model is disposed. */
  openPaths: readonly string[];
  value: string;
  language: string;
  theme: string;
  options?: EditorOptions;
  /**
   * Called with the full text and the edited path after each user edit (not
   * after `value` syncs).
   */
  onChange?: (value: string, path: string) => void;
  /** Called once the editor exists, before `theme` is first applied. */
  onMount?: (monaco: Monaco, editor: Editor) => void;
  loadingState?: JSX.Element;
}

const styles = stylex.create({
  root: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  layer: {
    position: "absolute",
    inset: 0,
  },
});

interface Instance {
  monaco: Monaco;
  editor: Editor;
}

/** Minimal Monaco wrapper; Monaco itself is code-split and loads on mount. */
export const MonacoEditor: Component<MonacoEditorProps> = (props) => {
  let container: HTMLDivElement | undefined;
  const [instance, setInstance] = createSignal<Instance>();
  // True while `value` is written into the model, so that edit is not echoed.
  let applyingValue = false;
  // Models this editor created, and the view state of each one not shown.
  const models = new Map<string, MonacoApi.editor.ITextModel>();
  const viewStates = new Map<string, MonacoApi.editor.ICodeEditorViewState>();
  let shownPath: string | null = null;

  const getModel = (
    monaco: Monaco,
    path: string,
    value: string,
    language: string,
  ) => {
    const existing = models.get(path);

    if (existing) return existing;

    const uri = monaco.Uri.from({ scheme: "inmemory", path: `/${path}` });

    // A model left behind under the same URI (e.g. by hot reload) would make
    // createModel throw; adopt it, and the value sync below corrects its text.
    const model =
      monaco.editor.getModel(uri) ??
      monaco.editor.createModel(value, language, uri);

    models.set(path, model);
    model.onWillDispose(() => {
      models.delete(path);
      viewStates.delete(path);
    });

    return model;
  };

  onSettled(() => {
    let disposed = false;
    let editor: Editor | undefined;

    void import("monaco-editor").then((monaco) => {
      if (disposed || !container) return;

      const created = monaco.editor.create(container, {
        ...props.options,
        model:
          props.path === null
            ? null
            : getModel(monaco, props.path, props.value, props.language),
        automaticLayout: true,
      });

      editor = created;
      shownPath = props.path;
      created.onDidChangeModelContent(() => {
        if (!applyingValue && shownPath !== null)
          props.onChange?.(created.getValue(), shownPath);
      });
      props.onMount?.(monaco, created);
      setInstance({ monaco, editor: created });
    });

    return () => {
      disposed = true;
      editor?.dispose();

      // Each dispose deletes its own entry, which Map iteration tolerates.
      for (const model of models.values()) model.dispose();
    };
  });

  createEffect(
    () => ({
      current: instance(),
      path: props.path,
      value: props.value,
      language: props.language,
    }),
    ({ current, path, value, language }) => {
      if (!current) return;

      const { monaco, editor } = current;

      const model =
        path === null ? null : getModel(monaco, path, value, language);

      const shown = editor.getModel();

      if (shown !== model) {
        // Null when the shown model was disposed (its document closed).
        const viewState = shown && editor.saveViewState();

        if (viewState && shownPath !== null)
          viewStates.set(shownPath, viewState);

        editor.setModel(model);

        const saved = path === null ? undefined : viewStates.get(path);

        if (saved) editor.restoreViewState(saved);
      }

      shownPath = path;

      if (!model) return;

      if (model.getLanguageId() !== language)
        monaco.editor.setModelLanguage(model, language);

      if (value === model.getValue()) return;

      applyingValue = true;

      try {
        // An edit rather than setValue keeps the undo stack intact.
        editor.executeEdits("", [
          {
            range: model.getFullModelRange(),
            text: value,
            forceMoveMarkers: true,
          },
        ]);
        editor.pushUndoStop();
      } finally {
        applyingValue = false;
      }
    },
  );

  createEffect(
    () => props.openPaths,
    (openPaths) => {
      // Deleting the current entry during Map iteration is safe.
      for (const [path, model] of models) {
        if (!openPaths.includes(path)) model.dispose();
      }
    },
  );

  createEffect(
    () => ({ current: instance(), theme: props.theme }),
    ({ current, theme }) => {
      current?.monaco.editor.setTheme(theme);
    },
  );

  createEffect(
    () => ({ current: instance(), options: props.options }),
    ({ current, options }) => {
      current?.editor.updateOptions(options ?? {});
    },
  );

  return (
    <div {...stylex.attrs(styles.root)}>
      <Show when={!instance()}>
        <div {...stylex.attrs(styles.layer)}>{props.loadingState}</div>
      </Show>
      <div ref={container} {...stylex.attrs(styles.layer)} />
    </div>
  );
};
