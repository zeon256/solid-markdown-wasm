use std::collections::HashMap;

use comrak::adapters::SyntaxHighlighterAdapter;
use comrak::html;
use std::io;

use crate::highlight::HIGHLIGHT_CONF;

pub struct TreeSitterAdapter {
    theme: Option<String>,
}

impl TreeSitterAdapter {
    pub fn new(theme: Option<&str>) -> Self {
        Self {
            theme: theme.map(String::from),
        }
    }

    pub fn highlight_html(&self, code: &str, lang: Option<&str>) -> String {
        let highlight_conf = &HIGHLIGHT_CONF["rust"];
        highlight_conf.highlight(code)
    }
}

impl SyntaxHighlighterAdapter for TreeSitterAdapter {
    fn write_highlighted(
        &self,
        output: &mut dyn io::Write,
        lang: Option<&str>,
        code: &str,
    ) -> io::Result<()> {
        let highlighted_code = self.highlight_html(code, lang);
        output.write_all(highlighted_code.as_bytes())
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
    ) -> std::io::Result<()> {
        html::write_opening_tag(output, "code", attributes)
    }
}
