use std::sync::LazyLock;

use comrak::{
    Options, Plugins, markdown_to_html, markdown_to_html_with_plugins,
    plugins::syntect::SyntectAdapterBuilder,
};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn render_md(markdown: &str, theme: &str) -> String {
    static OPTIONS: LazyLock<Options> = LazyLock::new(|| {
        let mut options = Options::default();
        options.extension.table = true;
        options.extension.front_matter_delimiter = Some("---".into());
        options
    });

    // let adapter = SyntectAdapterBuilder::new().theme(theme).build();
    // let mut plugins = Plugins::default();
    // plugins.render.codefence_syntax_highlighter = Some(&adapter);

    // markdown_to_html_with_plugins(markdown, &OPTIONS, &plugins)
    markdown_to_html(markdown, &OPTIONS)
}
