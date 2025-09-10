import init, { render_md, type Themes } from "markdown-renderer";
import {
  type Component,
  createEffect,
  createSignal,
  type JSX,
  onMount,
  Show,
} from "solid-js";

export interface MarkdownRendererProps {
  markdown: string;
  class?: string;
  theme?: Themes;
  fallback?: JSX.Element;
  onLoaded?: () => void;
}

export const MarkdownRenderer: Component<MarkdownRendererProps> = (props) => {
  const { theme = "one-dark" } = props;
  const [renderedHtml, setRenderedHtml] = createSignal("");
  const [loadingWasm, setLoadingWasm] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // Initizalize wasm module
  onMount(async () => {
    setLoadingWasm(true);
    try {
      const initOutput = await init();
      console.debug(initOutput);
    } catch (err) {
      console.error("Error initializing WASM:", err);
      setError(`Failed to initialize WASM: ${err}`);
    } finally {
      setLoadingWasm(false);
      console.debug("Loaded WASM successfully");
      props.onLoaded?.();
    }
  });

  createEffect(() => {
    if (!loadingWasm()) {
      const startTime = performance.now();
      const result = render_md(props.markdown, theme);
      setRenderedHtml(result);
      const endTime = performance.now();
      console.debug(`Time taken: ${endTime - startTime}`);
    }
  });

  return (
    <div>
      {error() && <div style={{ color: "red" }}>{error()}</div>}
      <Show when={!loadingWasm() && !error()} fallback={props.fallback}>
        <div class={props.class}>
          <div innerHTML={renderedHtml()} />
        </div>
      </Show>
    </div>
  );
};
