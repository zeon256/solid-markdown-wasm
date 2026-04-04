/**
 * Type declarations for @solid-markdown-wasm/example-shared/vite-config
 */

declare module "@solid-markdown-wasm/example-shared/vite-config" {
  export function getManualChunks(
    chunkName: string,
  ): (id: string) => string | undefined;

  export function getAssetFileNames(): (assetInfo: { name?: string }) => string;

  export const OPTIMIZE_DEPS_EXCLUDE: string[];

  export const SHARED_ASSETS_INCLUDE: string[];

  export const SHARED_ASSETS_INLINE_LIMIT: number;
}
