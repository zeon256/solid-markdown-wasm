use pulldown_cmark::{Options, Parser};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn render_md(raw_markdown: &str) -> String {
    let parser = Parser::new_ext(raw_markdown, Options::all());
    let mut buf = String::new();
    let _ = pulldown_cmark::html::write_html_fmt(&mut buf, parser);

    buf
}
