import { type Component, createSignal, onCleanup, onMount } from "solid-js";
import { MarkdownRenderer } from "solid-markdown-wasm";
import { MonacoEditor } from "solid-monaco";
import initialMarkdown from "../src/assets/markdown_preview.md?raw";

const LoadingFallback = () => (
  <div class="flex justify-center items-center h-full">
    <div class="spinner" />
  </div>
);

const App: Component = () => {
  const [markdown, setMarkdown] = createSignal("");
  const [debouncedMarkdown, setDebouncedMarkdown] = createSignal("");
  const [isDarkMode, setIsDarkMode] = createSignal(
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  let timeoutId: number | NodeJS.Timeout | undefined;

  const debouncedSetMarkdown = (value: string) => {
    // Cancel any pending debounce
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    const debounceAmount = value.length > 10000 ? 50 : 0;

    // Schedule a new update
    timeoutId = setTimeout(() => {
      setDebouncedMarkdown(value);
    }, debounceAmount);
  };

  const handleInput = (str: string) => {
    setMarkdown(str);
    debouncedSetMarkdown(str);
  };

  // Preload markdown on mount
  onMount(async () => {
    try {
      setMarkdown(initialMarkdown);
      setDebouncedMarkdown(initialMarkdown);
    } catch (error) {
      console.error("Failed to load initial markdown:", error);
    }

    // Listen for color scheme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);

    onCleanup(() => {
      mediaQuery.removeEventListener("change", handleChange);
    });
  });

  // Clean up any pending timeouts when the component unmounts
  onCleanup(() => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  });

  const editorOptions = () => ({
    fontFamily: "'Iosevka', monospace",
    fontSize: 22,
    theme: isDarkMode() ? "vs-dark" : "vs-light",
  });

  return (
    <div
      class="flex w-screen h-screen"
      classList={{ "bg-[#1e1e1e]": isDarkMode(), "bg-white": !isDarkMode() }}
    >
      <div class="w-1/2 flex flex-col m-4">
        <MonacoEditor
          language="markdown"
          options={editorOptions()}
          value={markdown()}
          onChange={(val, _ev) => {
            handleInput(val);
          }}
        />
      </div>
      <div
        class="w-1/2 flex flex-col"
        classList={{ "bg-[#0d1117]": isDarkMode(), "bg-white": !isDarkMode() }}
      >
        <div class="m-0 h-full shadow-sm overflow-y-auto p-4 px-6">
          <MarkdownRenderer
            markdown={debouncedMarkdown()}
            theme={isDarkMode() ? "ayu-dark" : "ayu-light"}
            class="markdown-body"
            fallback={<LoadingFallback />}
            onLoaded={() => console.log("WASM Loaded")}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
