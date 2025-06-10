use comrak::{Options, Plugins, markdown_to_html_with_plugins};
use once_cell::sync::Lazy;
use std::collections::HashMap;
use syntect::{dumps::from_binary, highlighting::ThemeSet, parsing::SyntaxSet};
use wasm_bindgen::prelude::*;

use crate::syntect_plugin::{SyntectAdapter, SyntectAdapterBuilder};

mod syntect_plugin;

#[wasm_bindgen]
pub enum Themes {
    OneTreeTreeSeven = "1337",
    OneHalfDark = "OneHalfDark",
    OneHalfLight = "OneHalfLight",
    Tomorrow = "Tomorrow",
    AgolaDark = "agola-dark",
    AsceticWhite = "ascetic-white",
    Axar = "axar",
    AyuDark = "ayu-dark",
    AyuLight = "ayu-light",
    AyuMirage = "ayu-mirage",
    Base16AtelierDuneLight = "base16-atelierdune-light",
    Base16OceanDark = "base16-ocean-dark",
    Base16OceanLight = "base16-ocean-light",
    BBEdit = "bbedit",
    Boron = "boron",
    Charcoal = "charcoal",
    CheerfullyLight = "cheerfully-light",
    ClassicModified = "classic-modified",
    Demain = "demain",
    DimmedFluid = "dimmed-fluid",
    Dracula = "dracula",
    GrayMatterDark = "gray-matter-dark",
    Green = "green",
    GruvboxDark = "gruvbox-dark",
    GruvboxLight = "gruvbox-light",
    Idle = "idle",
    InspiredGithub = "inspired-github",
    IrWhite = "ir-white",
    Kronuz = "kronuz",
    MaterialDark = "material-dark",
    MaterialLight = "material-light",
    Monokai = "monokai",
    Nord = "nord",
    NyxBold = "nyx-bold",
    OneDark = "one-dark",
    RailsBase16GreenScreenDark = "railsbase16-green-screen-dark",
    SolarizedDark = "solarized-dark",
    SolarizedLight = "solarized-light",
    SubwayMadrid = "subway-madrid",
    SubwayMoscow = "subway-moscow",
    TwoDark = "two-dark",
    VisualStudioDark = "visual-studio-dark",
    Zenburn = "zenburn",
}

const THEMES: [&str; 43] = [
    "1337",
    "OneHalfDark",
    "OneHalfLight",
    "Tomorrow",
    "agola-dark",
    "ascetic-white",
    "axar",
    "ayu-dark",
    "ayu-light",
    "ayu-mirage",
    "base16-atelierdune-light",
    "base16-ocean-dark",
    "base16-ocean-light",
    "bbedit",
    "boron",
    "charcoal",
    "cheerfully-light",
    "classic-modified",
    "demain",
    "dimmed-fluid",
    "dracula",
    "gray-matter-dark",
    "green",
    "gruvbox-dark",
    "gruvbox-light",
    "idle",
    "inspired-github",
    "ir-white",
    "kronuz",
    "material-dark",
    "material-light",
    "monokai",
    "nord",
    "nyx-bold",
    "one-dark",
    "railsbase16-green-screen-dark",
    "solarized-dark",
    "solarized-light",
    "subway-madrid",
    "subway-moscow",
    "two-dark",
    "visual-studio-dark",
    "zenburn",
];

pub static SYNTAX_SET: Lazy<SyntaxSet> =
    Lazy::new(|| from_binary(include_bytes!("../sublime/syntaxes/newlines.packdump")));

pub static THEME_SET: Lazy<ThemeSet> =
    Lazy::new(|| from_binary(include_bytes!("../sublime/themes/all.themedump")));

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
    let mut map = HashMap::with_capacity(THEMES.len());

    for theme in THEMES.iter() {
        let adapter = SyntectAdapterBuilder::new()
            .theme(*theme)
            .syntax_set(&SYNTAX_SET)
            .theme_set(&THEME_SET)
            .build();
        map.insert(*theme, adapter);
    }

    map
});

static PLUGINS: Lazy<HashMap<&'static str, Plugins<'static>>> = Lazy::new(|| {
    let mut map = HashMap::with_capacity(3);

    for (theme, adapter) in ADAPTERS.iter() {
        let mut plugins = Plugins::default();
        plugins.render.codefence_syntax_highlighter = Some(adapter);
        map.insert(*theme, plugins);
    }

    map
});

#[wasm_bindgen]
pub fn render_md(markdown: &str, theme: Themes) -> String {
    markdown_to_html_with_plugins(markdown, &OPTIONS, &PLUGINS[theme.to_str()])
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn print_all_themes() {
        static THEME_SET: Lazy<ThemeSet> =
            Lazy::new(|| from_binary(include_bytes!("../sublime/themes/all.themedump")));

        println!("Available themes:");
        for theme in THEME_SET.themes.keys() {
            println!("`{}`,", theme);
        }
    }

    #[test]
    fn print_default_themes() {
        let themes = ThemeSet::load_defaults();
        println!("Default themes:");
        for theme in themes.themes.keys() {
            println!("- {}", theme);
        }
    }

    #[test]
    fn print_default_syntaxes() {
        let syntaxes = SyntaxSet::load_defaults_newlines();
        println!("Default syntaxes:");
        for syntax in syntaxes.syntaxes().iter() {
            println!("- {}", syntax.name);
        }
    }

    #[test]
    fn print_all_syntaxes() {
        let syntaxes: SyntaxSet =
            from_binary(include_bytes!("../sublime/syntaxes/newlines.packdump"));
        println!("All syntaxes:");
        for syntax in syntaxes.syntaxes().iter() {
            let extensions = syntax
                .file_extensions
                .iter()
                .map(|ext| format!("`{}`", ext))
                .collect::<Vec<String>>()
                .join(", ");
            println!("- **{}**: {}", syntax.name, extensions);
        }
    }
}
