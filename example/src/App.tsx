import { type Component, createSignal, onCleanup, onMount, For } from "solid-js";
import { MarkdownRenderer, type Themes } from "solid-markdown-wasm";
import { MonacoEditor } from "solid-monaco";
import initialMarkdown from "../src/assets/markdown_preview.md?raw";
import haxiomLogo from "../src/assets/haxiom.svg";

// All available themes from the Rust lib.rs (matches the Themes type)
const CODE_THEMES: Themes[] = [
  "1337",
  "OneHalfDark",
  "OneHalfLight",
  "Tomorrow",
  "agola-dark",
  "ascetic-white",
  "axar",
  "ayu-dark",
  "ayu-light",
  "ayu-mirage",
  "base16-atelierdune-light",
  "base16-ocean-dark",
  "base16-ocean-light",
  "bbedit",
  "boron",
  "charcoal",
  "cheerfully-light",
  "classic-modified",
  "demain",
  "dimmed-fluid",
  "dracula",
  "gray-matter-dark",
  "green",
  "gruvbox-dark",
  "gruvbox-light",
  "idle",
  "inspired-github",
  "ir-white",
  "kronuz",
  "material-dark",
  "material-light",
  "monokai",
  "nord",
  "nyx-bold",
  "one-dark",
  "railsbase16-green-screen-dark",
  "solarized-dark",
  "solarized-light",
  "subway-madrid",
  "subway-moscow",
  "two-dark",
  "visual-studio-dark",
  "zenburn",
];

const EDITOR_THEMES = [
  { value: "vs", label: "Light" },
  { value: "vs-dark", label: "Dark" },
  { value: "hc-black", label: "High Contrast" },
] as const;

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
  const [codeTheme, setCodeTheme] = createSignal<Themes>(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "ayu-dark" : "ayu-light"
  );
  const [editorTheme, setEditorTheme] = createSignal<string>(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "vs-dark" : "vs"
  );
  let timeoutId: number | NodeJS.Timeout | undefined;

  const debouncedSetMarkdown = (value: string) => {
    // Cancel any pending debounce
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    const debounceAmount = value.length > 100000 ? 50 : 0;

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
      setCodeTheme(e.matches ? "ayu-dark" : "ayu-light");
      setEditorTheme(e.matches ? "vs-dark" : "vs");
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
    theme: editorTheme(),
  });

  const selectClass = () =>
    `px-3 py-1.5 rounded border text-sm font-medium cursor-pointer ${
      isDarkMode()
        ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
    }`;

  return (
    <div
      class="flex flex-col w-screen h-screen"
      classList={{ "bg-[#1e1e1e]": isDarkMode(), "bg-white": !isDarkMode() }}
    >
      {/* Toolbar */}
      <div
        class="flex items-center justify-between px-6 py-3 border-b"
        classList={{
          "bg-black border-gray-700": isDarkMode(),
          "bg-gray-100 border-gray-200": !isDarkMode(),
        }}
      >
        {/* Left side - Logo and project name */}
        <div class="flex items-center gap-3">
          <img src={haxiomLogo} alt="Haxiom" class="h-6 w-6" classList={{ "invert": isDarkMode() }} />
          <span class="font-semibold" classList={{ "text-white": isDarkMode(), "text-gray-900": !isDarkMode() }}>
            Haxiom
          </span>
          <span classList={{ "text-gray-500": isDarkMode(), "text-gray-400": !isDarkMode() }}>/</span>
          <span classList={{ "text-gray-400": isDarkMode(), "text-gray-500": !isDarkMode() }}>solid-markdown-wasm</span>
        </div>

        {/* Right side - Theme selectors and Try Haxiom */}
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label
              class="text-sm font-medium"
              classList={{ "text-gray-300": isDarkMode(), "text-gray-700": !isDarkMode() }}
            >
              Editor Theme:
            </label>
            <select
              class={selectClass()}
              value={editorTheme()}
              onChange={(e) => setEditorTheme(e.currentTarget.value)}
            >
              <For each={EDITOR_THEMES}>
                {(theme) => <option value={theme.value}>{theme.label}</option>}
              </For>
            </select>
          </div>

          <div class="flex items-center gap-2">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label
              class="text-sm font-medium"
              classList={{ "text-gray-300": isDarkMode(), "text-gray-700": !isDarkMode() }}
            >
              Code Block Theme:
            </label>
            <select
              class={selectClass()}
              value={codeTheme()}
              onChange={(e) => setCodeTheme(e.currentTarget.value as Themes)}
            >
              <For each={CODE_THEMES}>{(theme) => <option value={theme}>{theme}</option>}</For>
            </select>
          </div>
          {/* Try Haxiom link */}
          <a
          href="https://haxiom.io"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm font-medium px-3 py-1.5 rounded transition-colors text-black hover:opacity-80"
          style={{ "background-color": "#6fffe9" }}
          >
            Try Haxiom
          </a>
        </div>
      </div>

      {/* Main content */}
      <div class="flex flex-1 overflow-hidden">
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
              theme={codeTheme()}
              class="markdown-body"
              fallback={<LoadingFallback />}
              onLoaded={() => console.log("WASM Loaded")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
