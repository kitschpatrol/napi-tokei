#![deny(clippy::all)]
use napi_derive::napi;
use std::env;
use tokei::{Config, LanguageType, Languages};
/// Aggregated code statistics for a single programming language.
#[napi(object)]
pub struct LanguageInfo {
  /// The language name, e.g. `"Rust"`, `"TypeScript"`, `"ASP.NET"`.
  pub language: String,
  /// Number of files detected for this language.
  pub files: u32,
  /// Total number of lines (code + comments + blanks).
  pub lines: u32,
  /// Lines of code (excluding comments and blanks).
  pub code: u32,
  /// Lines of comments.
  pub comments: u32,
  /// Blank lines.
  pub blanks: u32,
  /// Per-file statistics. Only populated when `files` is `true` in options.
  pub reports: Option<Vec<Report>>,
}

/// Code statistics for a single file.
#[napi(object)]
pub struct Report {
  /// The file path.
  pub name: String,
  /// Total number of lines (code + comments + blanks).
  pub lines: u32,
  /// Lines of code (excluding comments and blanks).
  pub code: u32,
  /// Lines of comments.
  pub comments: u32,
  /// Blank lines.
  pub blanks: u32,
}

/// Options for the `tokei` function.
#[derive(Default)]
#[napi(object)]
pub struct TokeiOptions {
  /// Paths to include in the analysis.
  /// @default Current working directory
  pub include: Option<Vec<String>>,
  /// Paths to exclude from the analysis.
  pub exclude: Option<Vec<String>>,
  /// Filter results to only these languages. Uses tokei display names (e.g. `"Rust"`, `"ASP.NET"`).
  /// Invalid names are silently ignored.
  pub languages: Option<Vec<String>>,
  /// Include hidden files and directories.
  /// @default false
  pub hidden: Option<bool>,
  /// Don't respect any ignore files (`.gitignore`, `.ignore`, etc.).
  /// Implies `noIgnoreParent`, `noIgnoreDot`, and `noIgnoreVcs`.
  /// @default false
  pub no_ignore: Option<bool>,
  /// Don't respect ignore files in parent directories.
  /// @default false
  pub no_ignore_parent: Option<bool>,
  /// Don't respect `.ignore` and `.tokeignore` files.
  /// @default false
  pub no_ignore_dot: Option<bool>,
  /// Don't respect VCS ignore files (`.gitignore`, `.hgignore`, etc.).
  /// @default false
  pub no_ignore_vcs: Option<bool>,
  /// Count doc strings (e.g. Python `"""..."""`, Rust `///`) as comments instead of code.
  /// @default false
  pub treat_doc_strings_as_comments: Option<bool>,
  /// Include per-file statistics in the `reports` field of each result.
  /// @default false
  pub files: Option<bool>,
}

fn cwd() -> String {
  env::current_dir()
    .unwrap_or_else(|_| ".".into())
    .to_string_lossy()
    .to_string()
}

fn build_reports(reports: &[tokei::Report]) -> Vec<Report> {
  reports
    .iter()
    .map(|r| Report {
      name: r.name.to_string_lossy().to_string(),
      lines: r.stats.lines() as u32,
      code: r.stats.code as u32,
      comments: r.stats.comments as u32,
      blanks: r.stats.blanks as u32,
    })
    .collect()
}

fn build_language_info(
  lang_type: &LanguageType,
  lang: &tokei::Language,
  include_files: bool,
) -> LanguageInfo {
  LanguageInfo {
    language: lang_type.to_string(),
    files: lang.reports.len() as u32,
    lines: lang.lines() as u32,
    code: lang.code as u32,
    comments: lang.comments as u32,
    blanks: lang.blanks as u32,
    reports: if include_files {
      Some(build_reports(&lang.reports))
    } else {
      None
    },
  }
}

/// Count lines of code, comments, and blanks across files and languages.
///
/// @param options - Configuration for paths, language filters, and analysis behavior.
/// @returns Aggregated statistics per language for the given paths.
#[napi]
pub fn tokei(options: Option<TokeiOptions>) -> Vec<LanguageInfo> {
  let options = options.unwrap_or_default();
  let include_files = options.files.unwrap_or(false);
  let langs: Option<Vec<LanguageType>> = options.languages.map(|lang_names| {
    lang_names
      .iter()
      .filter_map(|s| LanguageType::from_name(s))
      .collect()
  });

  let config = Config {
    hidden: options.hidden,
    no_ignore: options.no_ignore,
    no_ignore_parent: options.no_ignore_parent,
    no_ignore_dot: options.no_ignore_dot,
    no_ignore_vcs: options.no_ignore_vcs,
    treat_doc_strings_as_comments: options.treat_doc_strings_as_comments,
    types: langs.clone(),
    ..Config::default()
  };

  let include = match options.include {
    Some(paths) if !paths.is_empty() => paths,
    _ => vec![cwd()],
  };

  let mut languages = Languages::new();
  languages.get_statistics(
    &include,
    &options
      .exclude
      .unwrap_or_default()
      .iter()
      .map(|s| &**s)
      .collect::<Vec<&str>>(),
    &config,
  );

  if let Some(langs) = langs {
    langs
      .iter()
      .filter_map(|lang_type| {
        languages
          .get(lang_type)
          .map(|lang| build_language_info(lang_type, lang, include_files))
      })
      .collect()
  } else {
    languages
      .iter()
      .map(|(lang_type, lang)| build_language_info(lang_type, lang, include_files))
      .collect()
  }
}
