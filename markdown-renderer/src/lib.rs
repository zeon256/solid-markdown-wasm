use comrak::{Options, Plugins, markdown_to_html_with_plugins};
use once_cell::sync::Lazy;
use std::collections::HashMap;
use syntastica::theme::ResolvedTheme;
use syntastica_adapter::SyntasticaAdapter;
use syntastica_parsers_git::LanguageSetImpl;
use wasm_bindgen::prelude::*;

mod syntastica_adapter;

static GLOBAL_LANGUAGE_SET: Lazy<LanguageSetImpl> = Lazy::new(LanguageSetImpl::new);
static GLOBAL_DARK_THEME: Lazy<ResolvedTheme> = Lazy::new(syntastica_themes::one::darker);

static OPTIONS: Lazy<Options> = Lazy::new(|| {
    let mut options = Options::default();
    options.extension.table = true;
    options.extension.tasklist = true;
    options.extension.alerts = true;
    options.extension.underline = true;
    options.extension.strikethrough = true;
    options.extension.spoiler = true;
    options.extension.superscript = true;
    options.extension.math_code = true;
    options.extension.math_dollars = true;
    options.extension.front_matter_delimiter = Some("---".into());

    options
});

static ADAPTERS: Lazy<HashMap<&'static str, SyntasticaAdapter>> = Lazy::new(|| {
    let mut map = HashMap::new();
    map.insert(
        "base16-ocean.dark",
        SyntasticaAdapter::new(&GLOBAL_DARK_THEME, &GLOBAL_LANGUAGE_SET),
    );
    map
});

static PLUGINS: Lazy<Plugins<'static>> = Lazy::new(|| {
    let mut plugins = Plugins::default();
    plugins.render.codefence_syntax_highlighter = Some(&ADAPTERS["base16-ocean.dark"]);

    plugins
});

#[wasm_bindgen]
pub fn render_md(markdown: &str, theme: &str) -> String {
    markdown_to_html_with_plugins(markdown, &OPTIONS, &PLUGINS)
}
