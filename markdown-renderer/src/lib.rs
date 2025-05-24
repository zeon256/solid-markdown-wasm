use std::sync::LazyLock;

use pulldown_cmark::{CodeBlockKind, Event, Options, Parser, Tag, TagEnd};
use syntect::highlighting::ThemeSet;
use syntect::html::highlighted_html_for_string;
use syntect::parsing::SyntaxSet;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn render_md(markdown: &str, theme: &str) -> String {
    static SYNTAX_SET: LazyLock<SyntaxSet> = LazyLock::new(SyntaxSet::load_defaults_newlines);
    static THEME_SET: LazyLock<ThemeSet> = LazyLock::new(ThemeSet::load_defaults);

    let theme = THEME_SET.themes[theme].clone();

    let mut sr = SYNTAX_SET.find_syntax_plain_text();
    let mut code = String::new();
    let mut html_output = String::new();
    let mut code_block = false;

    let parser = Parser::new_ext(&markdown, Options::all()).filter_map(|event| match event {
        Event::Start(Tag::CodeBlock(CodeBlockKind::Fenced(lang))) => {
            let lang = lang.trim();
            sr = SYNTAX_SET
                .find_syntax_by_token(&lang)
                .unwrap_or_else(|| SYNTAX_SET.find_syntax_plain_text());
            code_block = true;
            None
        }
        Event::End(TagEnd::CodeBlock) => {
            let html = highlighted_html_for_string(&code, &SYNTAX_SET, &sr, &theme)
                .unwrap_or(code.clone());

            code.clear();
            code_block = false;
            Some(Event::Html(html.into()))
        }
        Event::Text(t) => {
            if code_block {
                code.push_str(&t);
                return None;
            }
            let sanitized = ammonia::clean(&t);
            Some(Event::Text(sanitized.into()))
        }
        Event::Html(html) => {
            let sanitized = ammonia::clean(&html);
            Some(Event::Html(sanitized.into()))
        }
        _ => Some(event),
    });

    pulldown_cmark::html::push_html(&mut html_output, parser);

    html_output
}
