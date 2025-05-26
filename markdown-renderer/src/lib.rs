use comrak::{
    Options, Plugins, markdown_to_html_with_plugins,
    plugins::syntect::{SyntectAdapter, SyntectAdapterBuilder},
};
use once_cell::sync::Lazy;
use std::collections::HashMap;
use std::sync::LazyLock;
use wasm_bindgen::prelude::*;

static OPTIONS: LazyLock<Options> = LazyLock::new(|| {
    let mut options = Options::default();
    options.extension.table = true;
    options.extension.tasklist = true;
    options.extension.alerts = true;
    options.extension.underline = true;
    options.extension.strikethrough = true;
    options.extension.spoiler = true;
    options.extension.superscript = true;
    options.extension.front_matter_delimiter = Some("---".into());
    options
});

static ADAPTERS: Lazy<HashMap<&'static str, SyntectAdapter>> = Lazy::new(|| {
    let mut map = HashMap::new();
    map.insert(
        "base16-ocean.dark",
        SyntectAdapterBuilder::new()
            .theme("base16-ocean.dark")
            .build(),
    );
    map.insert(
        "base16-ocean.light",
        SyntectAdapterBuilder::new()
            .theme("base16-ocean.light")
            .build(),
    );
    map
});

#[wasm_bindgen]
pub fn render_md(markdown: &str, theme: &str) -> String {
    let mut plugins = Plugins::default();

    if let Some(adapter) = ADAPTERS.get(theme) {
        plugins.render.codefence_syntax_highlighter = Some(adapter);
    }

    markdown_to_html_with_plugins(markdown, &OPTIONS, &plugins)
}
