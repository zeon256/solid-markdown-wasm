use regex_macro::regex;
use std::collections::HashMap;
use std::collections::HashSet;

use once_cell::sync::Lazy;
use tree_sitter_highlight::Highlight;
use tree_sitter_highlight::HighlightConfiguration;
use tree_sitter_highlight::Highlighter;
use tree_sitter_highlight::HtmlRenderer;
use tree_sitter_language::LanguageFn as LangFn;

pub static HIGHLIGHT_CONF: Lazy<HashMap<&'static str, Lang>> = Lazy::new(|| init());

pub struct Lang {
    conf: HighlightConfiguration,
    attrs: Vec<Vec<u8>>,
}

fn init() -> HashMap<&'static str, Lang> {
    let mut map = HashMap::new();

    use tree_sitter_c as c;
    use tree_sitter_css as css;
    use tree_sitter_go as go;
    use tree_sitter_javascript as js;
    use tree_sitter_rust as rust;

    add_lang(&mut map, "c", c::LANGUAGE, c::HIGHLIGHT_QUERY);
    add_lang(&mut map, "css", css::LANGUAGE, css::HIGHLIGHTS_QUERY);
    add_lang(&mut map, "go", go::LANGUAGE, go::HIGHLIGHTS_QUERY);
    add_lang(&mut map, "js", js::LANGUAGE, js::HIGHLIGHT_QUERY);
    add_lang(&mut map, "rust", rust::LANGUAGE, rust::HIGHLIGHTS_QUERY);

    map
}

fn add_lang(map: &mut HashMap<&'static str, Lang>, name: &'static str, lang: LangFn, query: &str) {
    // The highlights query contains sexpr-like tree-sitter queries that
    // define highlight names, each one prefixed with @. These names
    // should be chosen from a standard set by the author of the
    // language's tree-sitter grammar. Our highlighter must be configured
    // with a list of highlight names that we are interested in, which
    // should have some overlap with the language's highlight names in
    // order to be useful.

    // Instead of listing our known highlight names here and also in the
    // CSS, I'm going to automatically generate CSS class names from the
    // language's highlights query. The CSS can be kept in sync manually,
    // perhaps with a lint to help out.
    let mut highlight_names = HashSet::new();
    for highlight in regex!(r"@[A-Za-z0-9._-]+").find_iter(query) {
        let highlight = &highlight.as_str()[1..];
        if !highlight_names.contains(highlight) {
            highlight_names.insert(highlight.to_string());
        }
    }

    // The html renderer attribute callback is given an index into the
    // highlight names array, which we translate into a CSS class attribute
    // using a second array. We have a CSS class for each dot-separated part
    // of the highlight name, plus a hilite class for specificity.

    let name_to_attr = |hilite| {
        let mut class = format!("class='hilite {hilite}'").into_bytes();
        for c in class.iter_mut() {
            if *c == b'.' {
                *c = b' ';
            }
        }
        class
    };

    let highlight_names = highlight_names.drain().collect::<Vec<_>>();
    let attrs = highlight_names
        .iter()
        .map(name_to_attr)
        .collect::<Vec<Vec<_>>>();

    // empty strings mean: no injection query; don't track local variables
    let lang = tree_sitter::Language::new(lang);
    let mut conf = HighlightConfiguration::new(lang, name, query, "", "").unwrap();

    conf.configure(&highlight_names);

    map.insert(name, Lang { conf, attrs });
}

impl Lang {
    pub fn highlight(&self, code: &str) -> String {
        let code = code.as_bytes();

        let mut highlighter = Highlighter::new();
        let highlights = highlighter
            .highlight(&self.conf, code, None, |_| None)
            .unwrap();

        let callback = |highlight: Highlight| {
            // output.extend_from_slice(&self.attrs[hilite.0]);
            self.attrs[highlight.0].as_slice()
        };
        let mut renderer = HtmlRenderer::new();
        renderer.render(highlights, code, &callback).unwrap();

        renderer.lines().flat_map(|s| s.chars()).collect()
    }
}
