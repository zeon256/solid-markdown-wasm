use comrak::{adapters::SyntaxHighlighterAdapter, html};
use parking_lot::Mutex;
use std::{collections::HashMap, io, str::FromStr};
use syntastica::{Processor, renderer::HtmlRenderer, theme::ResolvedTheme};
use syntastica_parsers_git::{Lang, LanguageSetImpl};

pub struct SyntasticaAdapter {
    theme: &'static ResolvedTheme,
    processor: Mutex<Processor<'static, LanguageSetImpl>>,
}

impl SyntasticaAdapter {
    pub fn new(theme: &'static ResolvedTheme, language_set: &'static LanguageSetImpl) -> Self {
        Self {
            theme,
            processor: Mutex::new(Processor::new(language_set)),
        }
    }
}

struct WrappedLang(pub Lang);

impl FromStr for WrappedLang {
    type Err = &'static str;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "bash" => Ok(WrappedLang(Lang::Bash)),
            "c" => Ok(WrappedLang(Lang::C)),
            "cpp" => Ok(WrappedLang(Lang::Cpp)),
            "css" => Ok(WrappedLang(Lang::Css)),
            "go" => Ok(WrappedLang(Lang::Go)),
            "html" => Ok(WrappedLang(Lang::Html)),
            "java" => Ok(WrappedLang(Lang::Java)),
            "javascript" => Ok(WrappedLang(Lang::Javascript)),
            "json" => Ok(WrappedLang(Lang::Json)),
            "kotlin" => Ok(WrappedLang(Lang::Kotlin)),
            "lua" => Ok(WrappedLang(Lang::Lua)),
            "python" => Ok(WrappedLang(Lang::Python)),
            "rust" => Ok(WrappedLang(Lang::Rust)),
            "toml" => Ok(WrappedLang(Lang::Toml)),
            "tsx" => Ok(WrappedLang(Lang::Tsx)),
            "typescript" => Ok(WrappedLang(Lang::Typescript)),
            "yaml" => Ok(WrappedLang(Lang::Yaml)),
            _ => Err("Unknown language string"),
        }
    }
}

impl SyntaxHighlighterAdapter for SyntasticaAdapter {
    fn write_highlighted(
        &self,
        output: &mut dyn io::Write,
        lang_name: Option<&str>,
        code: &str,
    ) -> io::Result<()> {
        let Some(name_str) = lang_name else {
            return output.write_all(code.as_bytes());
        };

        let Ok(lang) = WrappedLang::from_str(name_str) else {
            return output.write_all(code.as_bytes());
        };

        let mut processor_guard = self.processor.lock();

        match processor_guard.process(code, lang.0) {
            Ok(highlights) => {
                let html = syntastica::render(&highlights, &mut HtmlRenderer::new(), self.theme);

                output.write_all(html.as_bytes())
            }
            Err(_) => output.write_all(code.as_bytes()),
        }
    }

    fn write_pre_tag(
        &self,
        output: &mut dyn io::Write,
        attributes: HashMap<String, String>,
    ) -> io::Result<()> {
        html::write_opening_tag(output, "pre", attributes)
    }

    fn write_code_tag(
        &self,
        output: &mut dyn io::Write,
        attributes: HashMap<String, String>,
    ) -> io::Result<()> {
        html::write_opening_tag(output, "code", attributes)
    }
}
