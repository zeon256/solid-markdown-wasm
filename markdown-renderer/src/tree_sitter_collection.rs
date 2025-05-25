use once_cell::sync::Lazy;
use std::collections::HashMap;
use tree_sitter::Language;
use tree_sitter_highlight::HighlightConfiguration;

const HIGHLIGHT_NAMES: &[&str; 28] = &[
    "attribute",
    "comment",
    "constant",
    "constant.builtin",
    "constructor",
    "embedded",
    "function",
    "function.builtin",
    "keyword",
    "module",
    "number",
    "operator",
    "property",
    "property.builtin",
    "punctuation",
    "punctuation.bracket",
    "punctuation.delimiter",
    "punctuation.special",
    "string",
    "string.special",
    "tag",
    "type",
    "type.builtin",
    "variable",
    "variable.builtin",
    "variable.parameter",
    "macro",
    "label",
];

// struct LanguageConfig {
//     language: Language,
//     highlight_query: &'static str,
//     injection_query: &'static str,
//     locals_query: &'static str,
// }

// static LANGUAGE_CONFIGS: Lazy<HashMap<&'static str, LanguageConfig>> = Lazy::new(|| {
//     let mut m = HashMap::new();
//     m.insert(
//         "rust",
//         LanguageConfig {
//             language: tree_sitter_rust::LANGUAGE,
//             highlight_query: tree_sitter_rust::HIGHLIGHTS_QUERY,
//             injection_query: "",
//             locals_query: "",
//         },
//     );
//     m.insert(
//         "go",
//         LanguageConfig {
//             language: tree_sitter_go::language(),
//             highlight_query: tree_sitter_go::HIGHLIGHT_QUERY,
//             injection_query: "",
//             locals_query: "",
//         },
//     );
//     m.insert(
//         "c",
//         LanguageConfig {
//             language: tree_sitter_c::language(),
//             highlight_query: tree_sitter_c::HIGHLIGHT_QUERY,
//             injection_query: "",
//             locals_query: "",
//         },
//     );
//     m.insert(
//         "html",
//         LanguageConfig {
//             language: tree_sitter_html::language(),
//             highlight_query: tree_sitter_html::HIGHLIGHT_QUERY,
//             injection_query: tree_sitter_html::INJECTION_QUERY,
//             locals_query: "",
//         },
//     );
//     m.insert(
//         "toml",
//         LanguageConfig {
//             language: tree_sitter_toml::language(),
//             highlight_query: tree_sitter_toml::HIGHLIGHT_QUERY,
//             injection_query: "",
//             locals_query: "",
//         },
//     );
//     m.insert(
//         "python",
//         LanguageConfig {
//             language: tree_sitter_python::language(),
//             highlight_query: tree_sitter_python::HIGHLIGHT_QUERY,
//             injection_query: "",
//             locals_query: "",
//         },
//     );
//     m.insert(
//         "dockerfile",
//         LanguageConfig {
//             language: tree_sitter_dockerfile::language(),
//             highlight_query: "",
//             injection_query: "",
//             locals_query: "",
//         },
//     );
//     m.insert(
//         "json",
//         LanguageConfig {
//             language: tree_sitter_json::language(),
//             highlight_query: tree_sitter_json::HIGHLIGHT_QUERY,
//             injection_query: "",
//             locals_query: "",
//         },
//     );
//     m.insert(
//         "javascript",
//         LanguageConfig {
//             language: tree_sitter_javascript::language(),
//             highlight_query: tree_sitter_javascript::HIGHLIGHT_QUERY,
//             injection_query: tree_sitter_javascript::INJECTION_QUERY,
//             locals_query: tree_sitter_javascript::LOCALS_QUERY,
//         },
//     );
//     m
// });
//
//

pub fn typescript() -> HighlightConfiguration {
    let mut highlights = tree_sitter_typescript::HIGHLIGHTS_QUERY.to_owned();
    highlights.push_str(tree_sitter_javascript::HIGHLIGHT_QUERY);

    let mut locals = tree_sitter_typescript::LOCALS_QUERY.to_owned();
    locals.push_str(tree_sitter_javascript::LOCALS_QUERY);

    let mut conf = HighlightConfiguration::new(
        tree_sitter_typescript::LANGUAGE_TYPESCRIPT.into(),
        "typescript",
        &highlights,
        tree_sitter_javascript::INJECTIONS_QUERY,
        &locals,
    )
    .expect("Failed to create TypeScript configuration");

    conf.configure(HIGHLIGHT_NAMES);

    conf
}

pub fn tsx() -> HighlightConfiguration {
    let mut highlights = tree_sitter_typescript::HIGHLIGHTS_QUERY.to_owned();
    highlights.push_str(tree_sitter_typescript::HIGHLIGHTS_QUERY);
    highlights.push_str(tree_sitter_javascript::HIGHLIGHT_QUERY);

    let mut locals = tree_sitter_typescript::LOCALS_QUERY.to_owned();
    locals.push_str(tree_sitter_javascript::LOCALS_QUERY);

    let mut conf = HighlightConfiguration::new(
        tree_sitter_typescript::LANGUAGE_TSX.into(),
        "tsx",
        &highlights,
        tree_sitter_javascript::INJECTIONS_QUERY,
        &locals,
    )
    .expect("Failed to create TSX configuration");

    conf.configure(HIGHLIGHT_NAMES);

    conf
}

pub fn jsx() -> HighlightConfiguration {
    let mut conf = HighlightConfiguration::new(
        tree_sitter_javascript::LANGUAGE.into(),
        "jsx",
        tree_sitter_javascript::JSX_HIGHLIGHT_QUERY,
        tree_sitter_javascript::INJECTIONS_QUERY,
        "",
    )
    .expect("Failed to create JSX configuration");

    conf.configure(HIGHLIGHT_NAMES);

    conf
}

pub fn javascript() -> HighlightConfiguration {
    let mut conf = HighlightConfiguration::new(
        tree_sitter_javascript::LANGUAGE.into(),
        "javascript",
        tree_sitter_javascript::HIGHLIGHT_QUERY,
        tree_sitter_javascript::INJECTIONS_QUERY,
        tree_sitter_javascript::LOCALS_QUERY,
    )
    .expect("Failed to create javascript configuration");

    conf.configure(HIGHLIGHT_NAMES);

    conf
}
