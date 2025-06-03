use comrak::{
    Options, Plugins, markdown_to_html_with_plugins,
    plugins::syntect::{SyntectAdapter, SyntectAdapterBuilder},
};
use once_cell::sync::Lazy;
use std::collections::HashMap;
use syntastica::theme::ResolvedTheme;
use syntastica_adapter::SyntasticaAdapter;
use syntastica_parsers_git::LanguageSetImpl;
use wasm_bindgen::prelude::*;

mod syntastica_adapter;

static GLOBAL_LANGUAGE_SET: Lazy<LanguageSetImpl> = Lazy::new(LanguageSetImpl::new);
static GLOBAL_DARK_THEME: Lazy<ResolvedTheme> = Lazy::new(syntastica_themes::one::darker);
static GLOBAL_LIGHT_THEME: Lazy<ResolvedTheme> = Lazy::new(syntastica_themes::one::light);

const ONE_DARKER: &str = "one-darker";
const ONE_LIGHT: &str = "one-light";
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

static ADAPTERS_TREESITTER: Lazy<HashMap<&'static str, SyntasticaAdapter>> = Lazy::new(|| {
    let mut map = HashMap::with_capacity(2);
    map.insert(
        ONE_DARKER,
        SyntasticaAdapter::new(&GLOBAL_DARK_THEME, &GLOBAL_LANGUAGE_SET),
    );
    map.insert(
        ONE_LIGHT,
        SyntasticaAdapter::new(&GLOBAL_LIGHT_THEME, &GLOBAL_LANGUAGE_SET),
    );
    map
});

static ADAPTERS_SYNTECT: Lazy<HashMap<&'static str, SyntectAdapter>> = Lazy::new(|| {
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

static PLUGINS_TREESITTER: Lazy<HashMap<&'static str, Plugins<'static>>> = Lazy::new(|| {
    let mut map = HashMap::with_capacity(2);
    let mut plugin_dark = Plugins::default();
    plugin_dark.render.codefence_syntax_highlighter = Some(&ADAPTERS_TREESITTER[ONE_DARKER]);

    let mut plugins_light = Plugins::default();
    plugins_light.render.codefence_syntax_highlighter = Some(&ADAPTERS_TREESITTER[ONE_LIGHT]);

    map.insert(ONE_DARKER, plugin_dark);
    map.insert(ONE_LIGHT, plugins_light);

    map
});

static PLUGINS_SYNTECT: Lazy<HashMap<&'static str, Plugins<'static>>> = Lazy::new(|| {
    let mut map = HashMap::with_capacity(2);

    let mut plugin_dark = Plugins::default();
    plugin_dark.render.codefence_syntax_highlighter = Some(&ADAPTERS_SYNTECT[BASE16_OCEAN_DARK]);

    let mut plugin_light = Plugins::default();
    plugin_light.render.codefence_syntax_highlighter = Some(&ADAPTERS_SYNTECT[BASE16_OCEAN_LIGHT]);

    map.insert(BASE16_OCEAN_DARK, plugin_dark);
    map.insert(BASE16_OCEAN_LIGHT, plugin_light);

    map
});

#[wasm_bindgen]
pub fn render_md(markdown: &str, theme: &str) -> String {
    if markdown.len() > 10_000 {
        if theme.contains("dark") {
            markdown_to_html_with_plugins(markdown, &OPTIONS, &PLUGINS_SYNTECT[BASE16_OCEAN_DARK])
        } else {
            markdown_to_html_with_plugins(markdown, &OPTIONS, &PLUGINS_SYNTECT[BASE16_OCEAN_LIGHT])
        }
    } else {
        markdown_to_html_with_plugins(markdown, &OPTIONS, &PLUGINS_TREESITTER[theme])
    }
}
