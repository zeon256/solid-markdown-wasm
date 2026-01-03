![solid-markdown-wasm](https://assets.solidjs.com/banner?type=solid-markdown-wasm&background=tiles&project=%20)

<p align="center">
	<a href="https://biomejs.dev"><img alt="Checked with Biome" src="https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome"></a>
	<a href="https://github.com/zeon256/solid-markdown-wasm/actions/workflows/node.yml"><img alt="Node.js CI" src="https://github.com/zeon256/solid-markdown-wasm/actions/workflows/build-release.yml/badge.svg"></a>
	<img alt="GitHub License" src="https://img.shields.io/github/license/zeon256/solid-markdown-wasm">
	<img alt="NPM Version" src="https://img.shields.io/npm/v/solid-markdown-wasm">
	<a href="https://deepwiki.com/zeon256/solid-markdown-wasm"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>
</p>

# solid-markdown-wasm
> CommonMark markdown renderer for solidjs using wasm

## Features

- Compliant with [CommonMark 0.31.2](https://spec.commonmark.org/0.31.2/ "commonmark spec")
- Math rendering support (using a forked version of [comrak](https://github.com/DoublePrecision/comrak "comrak fork"))
- Syntax highlighting using [syntect](https://github.com/trishume/syntect "syntect github")
- Huge support for languages and themes
- Support for iframes (e.g. YouTube embeds)
- Sanitization of HTML and links for security with ammonia library
- Easy to use

## Users

- [Haxiom](https://haxiom.io)
- Using this project and want your company/project here? Feel free to open a PR!

## Example

You can visit [live-preview.inve.rs](https://live-preview.inve.rs "live-preview") to see the [example](./example) folder deployed. It uses [solid-monaco](https://github.com/alxnddr/solid-monaco "solid-monaco") + [tailwind](https://tailwindcss.com/ "tailwindcss") + [solidjs](https://www.solidjs.com/ "solidjs") and this library to showcase what is possible.

## Installation

```bash
npm install solid-markdown-wasm
```

## Vite Configuration

This library uses WebAssembly. To ensure the WASM binary is kept separate (not inlined as base64), you need to configure Vite:

### Install the required plugin:

```bash
npm install -D vite-plugin-wasm
# or
bun add -d vite-plugin-wasm
```

### Update your `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  plugins: [
    wasm(), // Add this plugin (must be before solid())
    solid(),
  ],
});
```

> **Note:** The `vite-plugin-wasm` plugin ensures the `.wasm` file is kept as a separate binary asset instead of being inlined as base64, which would significantly increase bundle size.

## Usage

```tsx
import { type Component, createSignal } from "solid-js";
import { MarkdownRenderer } from "solid-markdown-wasm";

const App: Component = () => {
  const [markdown, setMarkdown] = createSignal<string>("# Hello, Markdown!");

  const handleInput = (
    event: InputEvent & { currentTarget: HTMLTextAreaElement }
  ) => {
    setMarkdown(event.currentTarget.value);
  };

  return (
    <div>
      <h1>Markdown Editor</h1>
      <textarea
        rows={10}
        cols={50}
        value={markdown()}
        onInput={handleInput}
        placeholder="Enter your markdown here..."
      />
      <h2>Preview:</h2>
      <MarkdownRenderer 
        markdown={markdown()} 
        theme="base16-ocean-dark"
        onLoaded={() => {console.log("Markdown rendered successfully")}}
        fallback={<div>Loading...</div>} 
      />
    </div>
  );
};

export default App;
```

## Customising Code Block Headers

The rendered code blocks include a header with a language label and buttons for copying and collapsing code. You can customise these using CSS.

### CSS Classes

| Class | Description |
|-------|-------------|
| `.code-block-wrapper` | Container wrapping the entire code block |
| `.code-block-header` | The header bar containing language label and buttons |
| `.code-block-language` | The language label text (e.g., "typescript") |
| `.code-block-buttons` | Container for the action buttons |
| `.code-block-copy` | The copy button |
| `.code-block-collapse` | The collapse/expand button |
| `.code-block-wrapper.collapsed` | Applied when code block is collapsed |
| `.code-block-copy.copied` | Applied when code has been copied (for 2 seconds) |

### Example CSS

```css
/* Dark theme header */
.markdown-body .code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #151b23;
  border-bottom: 1px solid #3d444db3;
}

/* Language label */
.markdown-body .code-block-language {
  font-size: 0.75rem;
  font-weight: 500;
  color: #9198a1;
}

/* Button container */
.markdown-body .code-block-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Copy and collapse buttons */
.markdown-body .code-block-copy,
.markdown-body .code-block-collapse {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  color: #9198a1;
  background: transparent;
  border: 1px solid #3d444db3;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.markdown-body .code-block-copy:hover,
.markdown-body .code-block-collapse:hover {
  color: #f0f6fc;
  background-color: #656c7633;
  border-color: #3d444d;
}

/* Icon sizing */
.markdown-body .code-block-copy svg,
.markdown-body .code-block-collapse svg {
  width: 1rem;
  height: 1rem;
}

/* Hide code when collapsed */
.markdown-body .code-block-wrapper.collapsed pre {
  display: none;
}

/* Success state after copying */
.markdown-body .code-block-copy.copied {
  color: #5eeed8;
  border-color: #5eeed8;
}
```

### CSS Variables

The default styles use CSS variables that you can override:

| Variable | Description | Default (dark) |
|----------|-------------|----------------|
| `--bgColor-muted` | Header background | `#151b23` |
| `--borderColor-muted` | Border color | `#3d444db3` |
| `--fgColor-muted` | Muted text/icon color | `#9198a1` |
| `--fgColor-default` | Default text/icon color | `#f0f6fc` |
| `--bgColor-neutral-muted` | Hover background | `#656c7633` |
| `--borderColor-default` | Hover border color | `#3d444d` |
| `--fgColor-success` | Success state color | `#5eeed8` |

## Available Themes and supported Languages

For a list of available themes and languages, please refer to [THEMES_AND_LANGS.md](./THEMES_AND_LANGS.md). Autocomplete is also supported via your IDE as the themes are exported as unions of string literals.

## Internals

Internally, the renderer is implemented using a [forked version of comrak](https://github.com/DoublePrecision/comrak "comrak fork") (with added math rendering support) and then compiled down to webassembly using [wasm-pack](https://github.com/rustwasm/wasm-pack "wasm-pack github")
which is [called](./vite.config.ts) by [vite](https://vite.dev/ "vite website"). The fork extends the original [comrak](https://github.com/kivikakk/comrak "comrak github") library to include mathematical expression rendering capabilities. 

## Security

Since this library uses [comrak](https://github.com/kivikakk/comrak "comrak github") compiled to WebAssembly for Markdown rendering. By default, `solid-markdown-wasm` adheres to a safe-by-default approach, mirroring comrak's behavior of scrubbing raw HTML and potentially dangerous links.

> [!IMPORTANT]
> This library does not expose or utilize any "unsafe" options provided by comrak. Therefore, you can be assured that the rendered output will have potentially harmful HTML and links removed by the underlying comrak library

### Reporting Security Vulnerabilities:

> [!CAUTION]
> To report a security vulnerability, **please do not open a public GitHub issue**. Instead, please use the following method to contact the maintainers privately:

**Email**: Send an email to <me+security@inve.rs>.
Please provide as much detail as possible about the potential vulnerability, including steps to reproduce it. We will acknowledge your report promptly and work to address the issue as quickly as possible.

## Compiling From Source

You will need the following tools to compile from source
- [Rust compiler](https://www.rust-lang.org/ "rust compiler")
- [wasm-pack](https://github.com/rustwasm/wasm-pack "wasm-pack")
- [NodeJS/Bun](https://bun.sh/ "bun runtime")

Then run the following

```bash
bun run build
```

## Performance Optimizations

In order to not recompute syntax highlighting on every render, all code and math blocks are cached in an LRU cache. This drastically improves performance when rendering large documents with many code blocks.

## Contributing

For contributing to `solid-markdown-wasm`, please refer to the [CONTRIBUTING.md](./CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## Support This Project

If you find `solid-markdown-wasm` useful and would like to support its development, you can consider making a donation on wise. Your contribution helps ensure continued maintenance and improvements.

<img src="./@budisyahiddinb-wisetag.png" width="150">

[Donate on Wise](https://wise.com/pay/me/budisyahiddinb)

Thank you for your support!

## License
`solid-markdown-wasm` is released under the [MIT License](./LICENSE.md).

### Contribution
Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in `solid-markdown-wasm` by you, shall be licensed as MIT, without any additional terms or conditions.
