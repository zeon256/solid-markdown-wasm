import { type Component, createEffect, createSignal, onMount } from 'solid-js';
import init, { render_md } from "markdown-renderer";

export interface MarkdownRendererProps {
  markdown: string;
  class?: string;
}

export const MarkdownRenderer: Component<MarkdownRendererProps> = (props) => {
  const [renderedHtml, setRenderedHtml] = createSignal('');
  const [loadingWasm, setLoadingWasm] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // Initialize Wasmer SDK and compile the WASM module
  onMount(async () => {
    setLoadingWasm(true);
    try {
      await init();
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
      const result = render_md(props.markdown);
      setRenderedHtml(result);
    }
  });

  return (
    <div>
      {error() && <div style={{ color: 'red' }}>{error()}</div>}
      {loadingWasm() && <p>Loading WASM...</p>}
      <div class={props.class}>        
        <div innerHTML={renderedHtml()} />
      </div>
    </div>
  );
};

