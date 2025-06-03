use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn render_md(markdown: &str, theme: &str) -> String {
    markdown::to_html_with_options(markdown, &markdown::Options::gfm()).unwrap()
}
