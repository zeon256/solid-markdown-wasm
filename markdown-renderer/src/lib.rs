use comrak::{Options, markdown_to_html_with_plugins, options::Plugins};
use std::{collections::HashMap, sync::LazyLock};
use syntect::{dumps::from_binary, highlighting::ThemeSet, parsing::SyntaxSet};
use wasm_bindgen::prelude::*;

#[cfg(feature = "sanitize")]
use std::collections::HashSet;

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

#[cfg(feature = "sanitize")]
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
    options.render.r#unsafe = true;

    options
});

#[cfg(not(feature = "sanitize"))]
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
    options.render.r#unsafe = true;

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

#[cfg(feature = "sanitize")]
static SANITIZER: LazyLock<ammonia::Builder<'static>> = LazyLock::new(|| {
    let mut builder = ammonia::Builder::default();

    // Get default tags and add iframe + SVG elements
    let mut tags = HashSet::new();
    // Standard HTML tags from ammonia defaults
    for tag in [
        "a",
        "abbr",
        "acronym",
        "area",
        "article",
        "aside",
        "b",
        "bdi",
        "bdo",
        "blockquote",
        "br",
        "caption",
        "center",
        "cite",
        "code",
        "col",
        "colgroup",
        "data",
        "dd",
        "del",
        "details",
        "dfn",
        "div",
        "dl",
        "dt",
        "em",
        "figcaption",
        "figure",
        "footer",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "header",
        "hgroup",
        "hr",
        "i",
        "img",
        "ins",
        "kbd",
        "li",
        "map",
        "mark",
        "menu",
        "nav",
        "ol",
        "p",
        "pre",
        "q",
        "rp",
        "rt",
        "rtc",
        "ruby",
        "s",
        "samp",
        "small",
        "span",
        "strike",
        "strong",
        "sub",
        "summary",
        "sup",
        "table",
        "tbody",
        "td",
        "tfoot",
        "th",
        "thead",
        "time",
        "tr",
        "tt",
        "u",
        "ul",
        "var",
        "wbr",
        // Additional tags for our use case
        "iframe",
        "input",
        // SVG elements
        "svg",
        "g",
        "path",
        "use",
        "defs",
        "symbol",
        "circle",
        "ellipse",
        "line",
        "polygon",
        "polyline",
        "rect",
        "text",
        "tspan",
        "clipPath",
        "mask",
        "linearGradient",
        "radialGradient",
        "stop",
        "filter",
        "feGaussianBlur",
        "feOffset",
        "feBlend",
        "feMerge",
        "feMergeNode",
        "image",
        "foreignObject",
        "title",
        "desc",
    ] {
        tags.insert(tag);
    }
    builder.tags(tags);

    // Allow necessary attributes for various elements
    let mut tag_attributes: HashMap<&str, HashSet<&str>> = HashMap::new();

    // iframe attributes
    let iframe_attrs: HashSet<&str> = [
        "src",
        "width",
        "height",
        "frameborder",
        "allow",
        "allowfullscreen",
        "loading",
        "title",
        "sandbox",
        "referrerpolicy",
    ]
    .into_iter()
    .collect();
    tag_attributes.insert("iframe", iframe_attrs);

    // SVG attributes - common attributes used across many SVG elements
    let svg_common_attrs: HashSet<&str> = [
        "id",
        "class",
        "style",
        "transform",
        "fill",
        "fill-rule",
        "fill-opacity",
        "stroke",
        "stroke-width",
        "stroke-linecap",
        "stroke-linejoin",
        "stroke-opacity",
        "stroke-dasharray",
        "stroke-dashoffset",
        "opacity",
        "clip-path",
        "clip-rule",
        "mask",
        "filter",
        "x",
        "y",
        "width",
        "height",
        "rx",
        "ry",
        "cx",
        "cy",
        "r",
        "d",
        "points",
        "x1",
        "y1",
        "x2",
        "y2",
        "href",
        "xlink:href",
        "overflow",
        "viewBox",
        "preserveAspectRatio",
        "xmlns",
        "xmlns:xlink",
        "xmlns:h5",
        "version",
        "dx",
        "dy",
        "text-anchor",
        "dominant-baseline",
        "font-family",
        "font-size",
        "font-weight",
        "font-style",
        "offset",
        "stop-color",
        "stop-opacity",
        "gradientUnits",
        "gradientTransform",
        "spreadMethod",
        "fx",
        "fy",
        "stdDeviation",
        "result",
        "in",
        "in2",
        "mode",
        "requiredFeatures",
        "systemLanguage",
    ]
    .into_iter()
    .collect();

    // Apply common SVG attributes to all SVG elements
    for svg_tag in [
        "svg",
        "g",
        "path",
        "use",
        "defs",
        "symbol",
        "circle",
        "ellipse",
        "line",
        "polygon",
        "polyline",
        "rect",
        "text",
        "tspan",
        "clipPath",
        "mask",
        "linearGradient",
        "radialGradient",
        "stop",
        "filter",
        "feGaussianBlur",
        "feOffset",
        "feBlend",
        "feMerge",
        "feMergeNode",
        "image",
        "foreignObject",
    ] {
        tag_attributes.insert(svg_tag, svg_common_attrs.clone());
    }

    // Input attributes (for tasklists)
    let input_attrs: HashSet<&str> = ["type", "checked", "disabled"].into_iter().collect();
    tag_attributes.insert("input", input_attrs);

    // Image attributes
    let img_attrs: HashSet<&str> = ["src", "alt", "title", "width", "height"]
        .into_iter()
        .collect();
    tag_attributes.insert("img", img_attrs);

    // Link attributes (note: 'rel' is managed by ammonia automatically)
    let a_attrs: HashSet<&str> = ["href", "title"].into_iter().collect();
    tag_attributes.insert("a", a_attrs);

    // Table alignment
    let td_attrs: HashSet<&str> = ["align"].into_iter().collect();
    tag_attributes.insert("td", td_attrs.clone());
    tag_attributes.insert("th", td_attrs);

    builder.tag_attributes(tag_attributes);

    // Allow style and class on all elements
    builder.add_generic_attributes(["style", "class"]);

    // Allow certain URL schemes
    let url_schemes: HashSet<&str> = ["https", "http", "mailto", "data"].into_iter().collect();
    builder.url_schemes(url_schemes);

    // Use attribute filter to preserve SVG xlink:href fragment references (like #glyph123)
    // which ammonia would otherwise strip as they don't match URL schemes
    builder.attribute_filter(|_element, attribute, value| {
        // Preserve xlink:href attributes with fragment references in SVG elements
        if attribute == "xlink:href" && value.starts_with('#') {
            Some(value.into())
        } else if attribute == "href" && value.starts_with('#') {
            // Also preserve regular href with fragments (for SVG 2.0 compatibility)
            Some(value.into())
        } else {
            // Pass through all other attributes unchanged
            Some(value.into())
        }
    });

    builder
});

#[cfg(feature = "sanitize")]
fn sanitize_html(html: &str) -> String {
    SANITIZER.clean(html).to_string()
}

#[wasm_bindgen]
pub fn render_md(markdown: &str, theme: Themes) -> String {
    let html = markdown_to_html_with_plugins(markdown, &OPTIONS, &PLUGINS[theme.to_str()]);

    #[cfg(feature = "sanitize")]
    {
        sanitize_html(&html)
    }

    #[cfg(not(feature = "sanitize"))]
    {
        html
    }
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

    /// Test that XSS attacks are blocked when sanitize feature is enabled
    #[test]
    #[cfg(feature = "sanitize")]
    fn test_xss_protection() {
        // Test onerror XSS
        let xss_input = r#"<img src="x" onerror="alert('XSS via onerror')">"#;
        let result = render_md(xss_input, Themes::OneHalfDark);
        assert!(
            !result.contains("onerror"),
            "onerror attribute should be stripped: {}",
            result
        );
        assert!(
            !result.contains("alert"),
            "alert should be stripped: {}",
            result
        );

        // Test onclick XSS
        let xss_input2 = r#"<div onclick="alert('XSS')">Click me</div>"#;
        let result2 = render_md(xss_input2, Themes::OneHalfDark);
        assert!(
            !result2.contains("onclick"),
            "onclick attribute should be stripped: {}",
            result2
        );

        // Test javascript: URL
        let xss_input3 = r#"<a href="javascript:alert('XSS')">Click</a>"#;
        let result3 = render_md(xss_input3, Themes::OneHalfDark);
        assert!(
            !result3.contains("javascript:"),
            "javascript: URL should be stripped: {}",
            result3
        );

        // Test script tag
        let xss_input4 = r#"<script>alert('XSS')</script>"#;
        let result4 = render_md(xss_input4, Themes::OneHalfDark);
        assert!(
            !result4.contains("<script>"),
            "script tag should be stripped: {}",
            result4
        );

        // Verify iframe is still allowed
        let iframe_input = r#"<iframe src="https://www.youtube.com/embed/test" width="560" height="315"></iframe>"#;
        let result5 = render_md(iframe_input, Themes::OneHalfDark);
        assert!(
            result5.contains("<iframe"),
            "iframe should be preserved: {}",
            result5
        );
        assert!(
            result5.contains("https://www.youtube.com/embed/test"),
            "iframe src should be preserved: {}",
            result5
        );
    }

    /// Test that SVG math content is preserved when sanitize feature is enabled
    #[test]
    #[cfg(feature = "sanitize")]
    fn test_svg_math_preserved() {
        let math_markdown = r#"$$x = 3y + 2$$"#;
        let result = render_md(math_markdown, Themes::OneHalfDark);

        // SVG element should be preserved
        assert!(
            result.contains("<svg"),
            "SVG element should be preserved: {}",
            result
        );

        // SVG should have viewBox attribute
        assert!(
            result.contains("viewBox"),
            "SVG viewBox should be preserved: {}",
            result
        );

        // Path elements should be preserved (used for glyphs)
        assert!(
            result.contains("<path") || result.contains("<symbol"),
            "SVG path/symbol elements should be preserved: {}",
            result
        );

        // Use elements with xlink:href should be preserved
        assert!(
            result.contains("<use") || result.contains("xlink:href"),
            "SVG use/xlink:href should be preserved: {}",
            result
        );

        // Defs section should be preserved
        assert!(
            result.contains("<defs"),
            "SVG defs should be preserved: {}",
            result
        );
    }

    #[test]
    #[cfg_attr(feature = "sanitize", ignore = "Sanitization modifies HTML output")]
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
