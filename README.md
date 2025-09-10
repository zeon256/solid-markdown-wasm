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
- Syntax highlighting using [syntect](https://github.com/trishume/syntect "syntect github")
- Huge support for languages and themes
- Easy to use

## Example
You can visit [live-preview.inve.rs](https://live-preview.inve.rs "live-preview") to see the [example](./example) folder deployed. It uses [solid-monaco](https://github.com/alxnddr/solid-monaco "solid-monaco") + [tailwind](https://tailwindcss.com/ "tailwindcss") + [solidjs](https://www.solidjs.com/ "solidjs") and this library to showcase what is possible.

## Installation

```bash
npm install solid-markdown-wasm
```

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

## Available Themes and supported Languages

For a list of available themes and languages, please refer to [THEMES_AND_LANGS.md](./THEMES_AND_LANGS.md). Autocomplete is also supported via your IDE as the themes are exported as unions of string literals.

## Internals

Internally, the renderer is implemented using the [comrak](https://github.com/kivikakk/comrak "comrak github") library and then compiled down to webassembly using [wasm-pack](https://github.com/rustwasm/wasm-pack "wasm-pack github")
which is [called](./vite.config.ts) by [vite](https://vite.dev/ "vite website"). 

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
npm run build
```

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
