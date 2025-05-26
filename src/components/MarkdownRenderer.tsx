import init, { render_md } from "markdown-renderer";
import { type Component, createEffect, createSignal, onMount } from "solid-js";

export interface MarkdownRendererProps {
  markdown: string;
  class?: string;
  theme?: string;
}

export const MarkdownRenderer: Component<MarkdownRendererProps> = (props) => {
  const { theme = "base16-ocean.dark" } = props;
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
      {loadingWasm() && <p>Loading WASM...</p>}
      <div class={props.class}>
        <div innerHTML={renderedHtml()} />
      </div>
    </div>
  );
};
