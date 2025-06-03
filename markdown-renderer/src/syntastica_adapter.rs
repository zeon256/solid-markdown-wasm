use comrak::{adapters::SyntaxHighlighterAdapter, html};
use parking_lot::Mutex;
use std::{collections::HashMap, io};
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

impl SyntaxHighlighterAdapter for SyntasticaAdapter {
    fn write_highlighted(
        &self,
        output: &mut dyn io::Write,
        lang_name: Option<&str>,
        code: &str,
    ) -> io::Result<()> {
        match lang_name {
            Some(lang_name) => {
                let mut processor_guard = self.processor.lock();

                let highlights = processor_guard.process(code, Lang::Rust).unwrap();
                let html = syntastica::render(&highlights, &mut HtmlRenderer::new(), self.theme);

                output.write_all(html.as_bytes())
            }
            None => output.write_all(code.as_bytes()),
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
