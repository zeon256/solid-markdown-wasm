# @solid-markdown-wasm/example-shared

Shared resources for the solid-markdown-wasm example applications. This package eliminates duplication between the React and Solid examples by providing common assets, styles, constants, and configuration utilities.

## What's Included

### Assets (`./assets/*`)
- `haxiom.svg` - Haxiom logo used in both examples
- `markdown_preview.md` - Default markdown content for the editors

### Styles (`./styles/*`)

- **`base.css`** - Tailwind imports, spinner animation, CSS variables for theming
- **`markdown.css`** - Base `.markdown-body` styles for rendered markdown content
- **`code-blocks.css`** - Code block wrapper, header, and button styles
- **`mermaid.css`** - Mermaid diagram rendering styles and preview overlay

### Constants (`./constants`)

TypeScript exports:
- `CODE_THEMES` - Array of 40+ available syntax highlighting themes
- `EDITOR_THEMES` - Array of Monaco editor themes (Light, Dark, High Contrast)
- `DEFAULT_MERMAID_CONFIG` - Mermaid configuration function for consistent diagram theming
- `DARK_MODE_MEDIA_QUERY` - Media query string for dark mode detection
- Helper functions: `getDefaultCodeTheme()`, `getDefaultEditorTheme()`, `getPrefersDark()`
- Types: `Themes`, `EditorTheme`, `MermaidTheme`, `MermaidConfigFn`

### Vite Config (`./vite-config`)

JavaScript exports:
- `getManualChunks(chunkName)` - Function for vendor code splitting
- `getAssetFileNames()` - Asset file naming function with WASM support
- `OPTIMIZE_DEPS_EXCLUDE` - Dependencies to exclude from optimization
- `SHARED_ASSETS_INCLUDE` - Asset include patterns
- `SHARED_ASSETS_INLINE_LIMIT` - Build config for WASM handling

## Usage

### Importing Assets

```typescript
import haxiomLogo from "@solid-markdown-wasm/example-shared/assets/haxiom.svg";
import initialMarkdown from "@solid-markdown-wasm/example-shared/assets/markdown_preview.md?raw";
```

### Importing Styles

```css
@import "@solid-markdown-wasm/example-shared/styles/base.css";
@import "@solid-markdown-wasm/example-shared/styles/markdown.css";
@import "@solid-markdown-wasm/example-shared/styles/code-blocks.css";
@import "@solid-markdown-wasm/example-shared/styles/mermaid.css";
```

### Importing Constants

```typescript
import {
  CODE_THEMES,
  EDITOR_THEMES,
  DEFAULT_MERMAID_CONFIG,
  type Themes,
  type EditorTheme,
} from "@solid-markdown-wasm/example-shared/constants";
```

### Using Shared Vite Config

```typescript
import {
  getManualChunks,
  getAssetFileNames,
  OPTIMIZE_DEPS_EXCLUDE,
  SHARED_ASSETS_INCLUDE,
  SHARED_ASSETS_INLINE_LIMIT,
} from "@solid-markdown-wasm/example-shared/vite-config";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: getManualChunks("monaco-editor"),
        assetFileNames: getAssetFileNames(),
      },
    },
    assetsInlineLimit: SHARED_ASSETS_INLINE_LIMIT,
  },
  assetsInclude: SHARED_ASSETS_INCLUDE,
  optimizeDeps: {
    exclude: OPTIMIZE_DEPS_EXCLUDE,
  },
});
```

## Benefits

- **DRY Principle**: ~500+ lines of duplicated CSS eliminated
- **Single Source of Truth**: Themes and configuration defined once
- **Consistent Styling**: Both examples share identical visual styles
- **Easier Maintenance**: Updates apply to both examples automatically
- **Reduced Bundle Size**: Shared assets only exist once in the monorepo

## Notes

- This package is marked as `private` and is only intended for use within the solid-markdown-wasm monorepo
- The package uses TypeScript files directly (no build step required) since it's consumed within the monorepo
- CSS files use Tailwind v4 `@import` syntax
- The vite-config is provided as JavaScript (not TypeScript) to avoid Node.js loader issues
