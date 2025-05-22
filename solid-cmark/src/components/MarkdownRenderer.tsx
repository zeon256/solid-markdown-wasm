import { type Component, createEffect, createSignal, onMount } from 'solid-js';
import init, { render_md } from "markdown-renderer";

export interface MarkdownRendererProps {
  debounce: number
}

export const MarkdownRenderer: Component<MarkdownRendererProps> = (props) => {
  const { debounce } = props;

  const [markdownInput, setMarkdownInput] = createSignal('');
  const [renderedHtml, setRenderedHtml] = createSignal('');
  const [loadingWasm, setLoadingWasm] = createSignal(true);
  const [renderLoading, setRenderLoading] = createSignal(false);
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
    }
  });

  // Debounced rendering logic
  createEffect(() => {
    const markdown = markdownInput();
    if (!loadingWasm()) {
      const timer = setTimeout(async () => {
        setRenderLoading(true);
        setError(null);
        try {
          const result = render_md(markdown);
          setRenderedHtml(result);
        } catch (err) {
          console.error("Error rendering Markdown:", err);
          setError(`Failed to render Markdown: ${err}`);
          setRenderedHtml('');
        } finally {
          setRenderLoading(false);
        }
      }, debounce); // Debounce delay

      // Cleanup function to clear the timeout if the component unmounts or input changes quickly
      return () => clearTimeout(timer);
    }
  });

  return (
    <div>
      {error() && <div style={{ color: 'red' }}>{error()}</div>}
      {loadingWasm() && <div>Loading WASM...</div>}
      <div>
        <label for="markdown-input">Markdown Input:</label><br />
        <textarea
          id="markdown-input"
          value={markdownInput()}
          onInput={(e) => setMarkdownInput(e.currentTarget.value)}
          rows={10}
          cols={80}
        />
      </div>
      <div>
        <h2>Rendered HTML:</h2>
        {renderLoading() && <div>Rendering...</div>}
        <div innerHTML={renderedHtml()} />
      </div>
    </div>
  );
};

