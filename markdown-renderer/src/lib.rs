use once_cell::sync::Lazy;
use pulldown_cmark::{Options, Parser};
use wasm_bindgen::prelude::*;

static OPTIONS: Lazy<Options> = Lazy::new(Options::all);

#[wasm_bindgen]
pub fn render_md(markdown: &str, theme: &str) -> String {
    let parser = Parser::new_ext(markdown, *OPTIONS);

    let mut html_output = String::new();
    pulldown_cmark::html::push_html(&mut html_output, parser);

    html_output
}
