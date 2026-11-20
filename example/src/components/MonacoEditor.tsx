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
  value: string;
  language: string;
  theme: string;
  options?: EditorOptions;
  /** Called with the full text after each user edit (not after `value` syncs). */
  onChange?: (value: string) => void;
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

  onSettled(() => {
    let disposed = false;
    let editor: Editor | undefined;

    void import("monaco-editor").then((monaco) => {
      if (disposed || !container) return;

      const created = monaco.editor.create(container, {
        ...props.options,
        value: props.value,
        language: props.language,
        automaticLayout: true,
      });

      editor = created;
      created.onDidChangeModelContent(() => {
        if (!applyingValue) props.onChange?.(created.getValue());
      });
      props.onMount?.(monaco, created);
      setInstance({ monaco, editor: created });
    });

    return () => {
      disposed = true;
      editor?.getModel()?.dispose();
      editor?.dispose();
    };
  });

  createEffect(
    () => ({ current: instance(), value: props.value }),
    ({ current, value }) => {
      const model = current?.editor.getModel();

      if (!current || !model || value === model.getValue()) return;

      applyingValue = true;

      try {
        // An edit rather than setValue keeps the undo stack intact.
        current.editor.executeEdits("", [
          {
            range: model.getFullModelRange(),
            text: value,
            forceMoveMarkers: true,
          },
        ]);
        current.editor.pushUndoStop();
      } finally {
        applyingValue = false;
      }
    },
  );

  createEffect(
    () => ({ current: instance(), language: props.language }),
    ({ current, language }) => {
      const model = current?.editor.getModel();

      if (current && model)
        current.monaco.editor.setModelLanguage(model, language);
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
