use comrak::{Options, markdown_to_html_with_plugins, options::Plugins};
use std::{collections::HashMap, sync::LazyLock};
use syntect::{dumps::from_binary, highlighting::ThemeSet, parsing::SyntaxSet};
use wasm_bindgen::prelude::*;

use crate::syntect_plugin::{SyntectAdapterCached, SyntectAdapterCachedBuilder};

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

pub static SYNTAX_SET: LazyLock<SyntaxSet> =
    LazyLock::new(|| from_binary(include_bytes!("../sublime/syntaxes/newlines.packdump")));

pub static THEME_SET: LazyLock<ThemeSet> =
    LazyLock::new(|| from_binary(include_bytes!("../sublime/themes/all.themedump")));

static OPTIONS: LazyLock<Options> = LazyLock::new(|| {
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

static ADAPTERS: LazyLock<HashMap<&'static str, SyntectAdapterCached>> = LazyLock::new(|| {
    let mut map = HashMap::with_capacity(THEMES.len());

    for theme in THEMES.iter() {
        let adapter = SyntectAdapterCachedBuilder::new()
            .theme(theme)
            .syntax_set(&SYNTAX_SET)
            .theme_set(&THEME_SET)
            .build();
        map.insert(*theme, adapter);
    }

    map
});

static PLUGINS: LazyLock<HashMap<&'static str, Plugins<'static>>> = LazyLock::new(|| {
    let mut map = HashMap::with_capacity(THEMES.len());

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
    use std::{io::Write, sync::LazyLock};

    use super::*;
    use crate::syntect_plugin::{SyntectAdapterUncached, SyntectAdapterUncachedBuilder};

    /// Uncached adapters for generating deterministic ground truth test data.
    static UNCACHED_ADAPTERS: LazyLock<HashMap<&'static str, SyntectAdapterUncached>> =
        LazyLock::new(|| {
            let mut map = HashMap::with_capacity(THEMES.len());

            for theme in THEMES.iter() {
                let adapter = SyntectAdapterUncachedBuilder::new()
                    .theme(theme)
                    .syntax_set(&SYNTAX_SET)
                    .theme_set(&THEME_SET)
                    .build();
                map.insert(*theme, adapter);
            }

            map
        });

    static UNCACHED_PLUGINS: LazyLock<HashMap<&'static str, Plugins<'static>>> =
        LazyLock::new(|| {
            let mut map = HashMap::with_capacity(THEMES.len());

            for (theme, adapter) in UNCACHED_ADAPTERS.iter() {
                let mut plugins = Plugins::default();
                plugins.render.codefence_syntax_highlighter = Some(adapter);
                map.insert(*theme, plugins);
            }

            map
        });

    /// Render markdown without caching - used for generating ground truth test data.
    fn render_md_uncached(markdown: &str, theme: &str) -> String {
        markdown_to_html_with_plugins(markdown, &OPTIONS, &UNCACHED_PLUGINS[theme])
    }

    #[ignore = "Run manually to see all themes: cargo test print_all_themes -- --ignored"]
    #[test]
    fn print_all_themes() {
        static THEME_SET: LazyLock<ThemeSet> =
            LazyLock::new(|| from_binary(include_bytes!("../sublime/themes/all.themedump")));

        println!("Available themes:");
        for theme in THEME_SET.themes.keys() {
            println!("- `{}`", theme);
        }
    }

    #[ignore = "Run manually to see all default themes: cargo test print_default_themes -- --ignored"]
    #[test]
    fn print_default_themes() {
        let themes = ThemeSet::load_defaults();
        println!("Default themes:");
        for theme in themes.themes.keys() {
            println!("- {}", theme);
        }
    }

    #[ignore = "Run manually to see all default syntaxes: cargo test print_default_syntaxes -- --ignored"]
    #[test]
    fn print_default_syntaxes() {
        let syntaxes = SyntaxSet::load_defaults_newlines();
        println!("Default syntaxes:");
        for syntax in syntaxes.syntaxes().iter() {
            println!("- {}", syntax.name);
        }
    }

    #[ignore = "Run manually to see all syntaxes and their file extensions: cargo test print_all_syntaxes -- --ignored"]
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

    #[ignore = "Run manually to regenerate ground truth: cargo test generate_ground_truth_test_data -- --ignored"]
    #[test]
    fn generate_ground_truth_test_data() {
        let md0 = include_str!("../sample-data/md0.md");
        let md1 = include_str!("../sample-data/md1.md");
        let md2 = include_str!("../sample-data/md2.md");

        use std::fs::File;
        let mut file0 = File::create("test-data/md0.html").unwrap();
        let mut file1 = File::create("test-data/md1.html").unwrap();
        let mut file2 = File::create("test-data/md2.html").unwrap();

        // Use uncached rendering for deterministic output
        let _ = file0.write(render_md_uncached(md0, "OneHalfDark").as_bytes());
        let _ = file1.write(render_md_uncached(md1, "OneHalfDark").as_bytes());
        let _ = file2.write(render_md_uncached(md2, "OneHalfDark").as_bytes());
    }

    /// Normalize SVG glyph IDs to make them deterministic for testing.
    /// SVG glyph IDs contain random hashes that differ between runs.
    fn normalize_svg_ids(html: &str) -> String {
        use std::collections::HashMap;
        let mut id_map = HashMap::new();
        let mut counter = 0;

        // Replace all glyph IDs with normalized ones
        // IDs can have variable length hex strings (typically 31-32 chars)
        let id_regex = regex::Regex::new(r#"(id|xlink:href)="(#?)g[A-F0-9]+""#).unwrap();

        id_regex
            .replace_all(html, |caps: &regex::Captures| {
                let attr = &caps[1];
                let hash = &caps[2];
                let full_id = &caps[0];

                // Extract the actual ID (without # if present)
                let id = if hash == "#" {
                    &full_id[full_id.find("#g").unwrap() + 1..full_id.len() - 1]
                } else {
                    &full_id[full_id.find("g").unwrap()..full_id.len() - 1]
                };

                let normalized = id_map.entry(id.to_string()).or_insert_with(|| {
                    let new_id = format!("gNORM{:04}", counter);
                    counter += 1;
                    new_id
                });

                format!(r#"{}="{}{}""#, attr, hash, normalized)
            })
            .to_string()
    }

    #[test]
    fn test_cached_syntax_highlighting() {
        let expected_md0 = include_str!("../test-data/md0.html");
        let expected_md1 = include_str!("../test-data/md1.html");
        let expected_md2 = include_str!("../test-data/md2.html");

        let md0 = include_str!("../sample-data/md0.md");
        let md1 = include_str!("../sample-data/md1.md");
        let md2 = include_str!("../sample-data/md2.md");

        assert_eq!(
            normalize_svg_ids(expected_md0),
            normalize_svg_ids(&render_md(md0, Themes::OneHalfDark))
        );
        assert_eq!(
            normalize_svg_ids(expected_md1),
            normalize_svg_ids(&render_md(md1, Themes::OneHalfDark))
        );
        assert_eq!(
            normalize_svg_ids(expected_md2),
            normalize_svg_ids(&render_md(md2, Themes::OneHalfDark))
        );
    }
}
