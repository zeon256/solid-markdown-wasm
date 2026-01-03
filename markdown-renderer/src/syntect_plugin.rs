//! Adapter for the Syntect syntax highlighter plugin.

use comrak::adapters::SyntaxHighlighterAdapter;
use comrak::html;
use mini_moka::unsync::Cache;
use std::borrow::Cow;
use std::cell::RefCell;
use std::collections::{HashMap, hash_map};
use std::fmt::{self, Write};
use std::marker::PhantomData;
use syntect::Error;
use syntect::easy::HighlightLines;
use syntect::highlighting::{Color, ThemeSet};
use syntect::html::{
    ClassStyle, ClassedHTMLGenerator, IncludeBackground, append_highlighted_html_for_styled_line,
};
use syntect::parsing::{SyntaxReference, SyntaxSet};
use syntect::util::LinesWithEndings;

/// Strategy for highlighting code - either cached or uncached.
pub trait HighlightStrategy: Send + Sync {
    fn highlight(
        theme: Option<&String>,
        theme_set: &ThemeSet,
        syntax_set: &SyntaxSet,
        code: &str,
        syntax: &SyntaxReference,
    ) -> Result<String, Error>;
}

/// Uncached highlighting strategy - computes highlighting every time.
#[cfg(test)]
#[derive(Debug)]
pub struct Uncached;

/// Cached highlighting strategy - uses an LRU cache to memoize results.
#[derive(Debug)]
pub struct Cached;

fn do_highlight(
    theme: Option<&String>,
    theme_set: &ThemeSet,
    syntax_set: &SyntaxSet,
    code: &str,
    syntax: &SyntaxReference,
) -> Result<String, Error> {
    match theme {
        Some(theme_name) => {
            let theme = &theme_set.themes[theme_name];
            let mut highlighter = HighlightLines::new(syntax, theme);
            let bg = theme.settings.background.unwrap_or(Color::WHITE);

            let mut output = String::new();
            for line in LinesWithEndings::from(code) {
                let regions = highlighter.highlight_line(line, syntax_set)?;
                append_highlighted_html_for_styled_line(
                    &regions[..],
                    IncludeBackground::IfDifferent(bg),
                    &mut output,
                )?;
            }
            Ok(output)
        }
        None => {
            let mut html_generator =
                ClassedHTMLGenerator::new_with_class_style(syntax, syntax_set, ClassStyle::Spaced);
            for line in LinesWithEndings::from(code) {
                html_generator.parse_html_for_line_which_includes_newline(line)?;
            }
            Ok(html_generator.finalize())
        }
    }
}

#[cfg(test)]
impl HighlightStrategy for Uncached {
    fn highlight(
        theme: Option<&String>,
        theme_set: &ThemeSet,
        syntax_set: &SyntaxSet,
        code: &str,
        syntax: &SyntaxReference,
    ) -> Result<String, Error> {
        do_highlight(theme, theme_set, syntax_set, code, syntax)
    }
}

impl HighlightStrategy for Cached {
    fn highlight(
        theme: Option<&String>,
        theme_set: &ThemeSet,
        syntax_set: &SyntaxSet,
        code: &str,
        syntax: &SyntaxReference,
    ) -> Result<String, Error> {
        thread_local! {
            static LRU: RefCell<Cache<Box<str>, String>> =
                RefCell::new(Cache::builder().max_capacity(1024).build());
        }

        LRU.with_borrow_mut(|lru| {
            let key = Box::<str>::from(code);

            if let Some(html) = lru.get(&key) {
                return Ok(html.clone());
            }

            let result = do_highlight(theme, theme_set, syntax_set, code, syntax)?;
            lru.insert(key, result.clone());
            Ok(result)
        })
    }
}

#[derive(Debug)]
/// Generic Syntect syntax highlighter plugin parameterized by caching strategy.
pub struct SyntectAdapter<S: HighlightStrategy> {
    theme: Option<String>,
    syntax_set: &'static SyntaxSet,
    theme_set: &'static ThemeSet,
    _strategy: PhantomData<S>,
}

/// Type alias for the cached adapter (used in production).
pub type SyntectAdapterCached = SyntectAdapter<Cached>;

/// Type alias for the uncached adapter (used for generating ground truth in tests).
#[cfg(test)]
pub type SyntectAdapterUncached = SyntectAdapter<Uncached>;

impl<S: HighlightStrategy> SyntectAdapter<S> {
    fn highlight_html(&self, code: &str, syntax: &SyntaxReference) -> Result<String, Error> {
        S::highlight(
            self.theme.as_ref(),
            self.theme_set,
            self.syntax_set,
            code,
            syntax,
        )
    }
}

impl<S: HighlightStrategy + Send + Sync> SyntaxHighlighterAdapter for SyntectAdapter<S> {
    fn write_highlighted(
        &self,
        output: &mut dyn Write,
        lang: Option<&str>,
        code: &str,
    ) -> Result<(), fmt::Error> {
        let fallback_syntax = "Plain Text";

        let lang: &str = match lang {
            Some(l) if !l.is_empty() => l,
            _ => fallback_syntax,
        };

        let syntax = self
            .syntax_set
            .find_syntax_by_token(lang)
            .unwrap_or_else(|| {
                self.syntax_set
                    .find_syntax_by_first_line(code)
                    .unwrap_or_else(|| self.syntax_set.find_syntax_plain_text())
            });

        match self.highlight_html(code, syntax) {
            Ok(highlighted_code) => output.write_str(&highlighted_code),
            Err(_) => output.write_str(code),
        }
    }

    fn write_pre_tag(
        &self,
        output: &mut dyn Write,
        attributes: HashMap<&'static str, Cow<'_, str>>,
    ) -> Result<(), fmt::Error> {
        match &self.theme {
            Some(theme) => {
                let theme = &self.theme_set.themes[theme];
                let colour = theme.settings.background.unwrap_or(Color::WHITE);

                let style = format!(
                    "background-color:#{:02x}{:02x}{:02x};",
                    colour.r, colour.g, colour.b
                );

                let mut pre_attributes = SyntectPreAttributes::new(attributes, &style);
                html::write_opening_tag(output, "pre", pre_attributes.iter_mut())
            }
            None => {
                let mut attributes: HashMap<&str, &str> = HashMap::new();
                attributes.insert("class", "syntax-highlighting");
                html::write_opening_tag(output, "pre", attributes)
            }
        }
    }

    fn write_code_tag(
        &self,
        output: &mut dyn Write,
        attributes: HashMap<&'static str, Cow<'_, str>>,
    ) -> Result<(), fmt::Error> {
        html::write_opening_tag(output, "code", attributes)
    }
}

struct SyntectPreAttributes<'s> {
    syntect_style: String,
    attributes: HashMap<&'static str, Cow<'s, str>>,
}

impl<'s> SyntectPreAttributes<'s> {
    fn new(attributes: HashMap<&'static str, Cow<'s, str>>, syntect_style: &str) -> Self {
        Self {
            syntect_style: syntect_style.into(),
            attributes,
        }
    }

    fn iter_mut(&mut self) -> SyntectPreAttributesIter<'_, 's> {
        SyntectPreAttributesIter {
            iter_mut: self.attributes.iter_mut(),
            syntect_style: &self.syntect_style,
            style_written: false,
        }
    }
}

struct SyntectPreAttributesIter<'a, 's> {
    iter_mut: hash_map::IterMut<'a, &'static str, Cow<'s, str>>,
    syntect_style: &'a str,
    style_written: bool,
}

impl<'a, 's> Iterator for SyntectPreAttributesIter<'a, 's> {
    type Item = (&'a str, &'a str);

    fn next(&mut self) -> Option<Self::Item> {
        match self.iter_mut.next() {
            Some((k, v)) if *k == "style" && !self.style_written => {
                self.style_written = true;
                v.to_mut().insert_str(0, self.syntect_style);
                Some((k, v))
            }
            Some((k, v)) => Some((k, v)),
            None if !self.style_written => {
                self.style_written = true;
                Some(("style", self.syntect_style))
            }
            None => None,
        }
    }
}

#[derive(Debug)]
/// A builder for [`SyntectAdapter`].
///
/// Allows customization of `Theme`, [`ThemeSet`], and [`SyntaxSet`].
pub struct SyntectAdapterBuilder<S: HighlightStrategy> {
    theme: Option<String>,
    syntax_set: Option<&'static SyntaxSet>,
    theme_set: Option<&'static ThemeSet>,
    _strategy: PhantomData<S>,
}

/// Type alias for the cached adapter builder.
pub type SyntectAdapterCachedBuilder = SyntectAdapterBuilder<Cached>;

/// Type alias for the uncached adapter builder.
#[cfg(test)]
pub type SyntectAdapterUncachedBuilder = SyntectAdapterBuilder<Uncached>;

impl<S: HighlightStrategy> Default for SyntectAdapterBuilder<S> {
    fn default() -> Self {
        SyntectAdapterBuilder {
            theme: Some("InspiredGitHub".into()),
            syntax_set: None,
            theme_set: None,
            _strategy: PhantomData,
        }
    }
}

impl<S: HighlightStrategy> SyntectAdapterBuilder<S> {
    /// Create a new empty [`SyntectAdapterBuilder`].
    pub fn new() -> Self {
        Default::default()
    }

    /// Set the theme.
    pub fn theme(mut self, s: &str) -> Self {
        self.theme.replace(s.into());
        self
    }

    /// Set the syntax set.
    pub fn syntax_set(mut self, s: &'static SyntaxSet) -> Self {
        self.syntax_set.replace(s);
        self
    }

    /// Set the theme set.
    pub fn theme_set(mut self, s: &'static ThemeSet) -> Self {
        self.theme_set.replace(s);
        self
    }

    /// Builds the [`SyntectAdapter`]. Default values:
    /// - `theme`: `InspiredGitHub`
    /// - `syntax_set`: [`SyntaxSet::load_defaults_newlines()`]
    /// - `theme_set`: [`ThemeSet::load_defaults()`]
    pub fn build(self) -> SyntectAdapter<S> {
        SyntectAdapter {
            theme: self.theme,
            syntax_set: self
                .syntax_set
                .unwrap_or_else(|| Box::leak(Box::new(SyntaxSet::load_defaults_newlines()))),
            theme_set: self
                .theme_set
                .unwrap_or_else(|| Box::leak(Box::new(ThemeSet::load_defaults()))),
            _strategy: PhantomData,
        }
    }
}
