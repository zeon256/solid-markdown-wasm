use comrak::{Options, Plugins, markdown_to_html_with_plugins};
use once_cell::sync::Lazy;
use std::collections::HashMap;
use syntect_adapter::{SyntectAdapter, SyntectAdapterBuilder};
use wasm_bindgen::prelude::*;

mod syntect_adapter;

const BASE16_OCEAN_DARK: &str = "base16-ocean.dark";
const BASE16_OCEAN_LIGHT: &str = "base16-ocean.light";

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

static ADAPTERS: Lazy<HashMap<&'static str, SyntectAdapter>> = Lazy::new(|| {
    let mut map = HashMap::with_capacity(2);
    map.insert(
        BASE16_OCEAN_DARK,
        SyntectAdapterBuilder::new()
            .theme(BASE16_OCEAN_DARK)
            .build(),
    );
    map.insert(
        BASE16_OCEAN_LIGHT,
        SyntectAdapterBuilder::new()
            .theme(BASE16_OCEAN_LIGHT)
            .build(),
    );
    map
});

static PLUGINS: Lazy<HashMap<&'static str, Plugins<'static>>> = Lazy::new(|| {
    let mut map = HashMap::with_capacity(2);

    let mut plugin_dark = Plugins::default();
    plugin_dark.render.codefence_syntax_highlighter = Some(&ADAPTERS[BASE16_OCEAN_DARK]);

    let mut plugin_light = Plugins::default();
    plugin_light.render.codefence_syntax_highlighter = Some(&ADAPTERS[BASE16_OCEAN_LIGHT]);

    map.insert(BASE16_OCEAN_DARK, plugin_dark);
    map.insert(BASE16_OCEAN_LIGHT, plugin_light);

    map
});

#[wasm_bindgen]
pub fn render_md(markdown: &str, theme: &str) -> String {
    markdown_to_html_with_plugins(markdown, &OPTIONS, &PLUGINS[theme])
}
