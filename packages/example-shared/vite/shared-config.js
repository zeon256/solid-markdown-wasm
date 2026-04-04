/**
 * Shared Vite configuration utilities for examples
 */

/**
 * Get manual chunks function for vendor code splitting
 * @param {string} chunkName - The name of the chunk to split (e.g., "monaco-editor", "solid-monaco")
 * @returns {Function} Manual chunks function for rollup
 */
export function getManualChunks(chunkName) {
  return (id) => {
    if (id.includes(`node_modules/${chunkName}`)) {
      return chunkName;
    }
  };
}

/**
 * Get asset file names function for proper WASM handling
 * @returns {Function} Asset file names function for rollup
 */
export function getAssetFileNames() {
  return (assetInfo) => {
    if (assetInfo.name?.endsWith(".wasm")) {
      return "assets/[name][extname]";
    }
    return "assets/[name]-[hash][extname]";
  };
}

/**
 * Dependencies to exclude from optimization (WASM packages)
 */
export const OPTIMIZE_DEPS_EXCLUDE = ["markdown-renderer"];

/**
 * Assets include patterns
 */
export const SHARED_ASSETS_INCLUDE = ["**/*.wasm"];

/**
 * Default build assets inline limit (0 = disable inlining)
 */
export const SHARED_ASSETS_INLINE_LIMIT = 0;
