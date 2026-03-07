#![deny(clippy::all)]
mod lang;
use lang::LangType;
use napi_derive::napi;
use std::env;
use tokei::{Config, Languages};
#[napi(object)]
pub struct LanguageInfo {
  pub lang: String,
  pub files: u32,
  pub lines: u32,
  pub code: u32,
  pub comments: u32,
  pub blanks: u32,
  pub reports: Option<Vec<Report>>,
}
#[napi(object)]
pub struct Report {
  pub name: String,
  pub lines: u32,
  pub code: u32,
  pub comments: u32,
  pub blanks: u32,
}

#[napi(object)]
pub struct TokeiOptions {
  pub include: Option<Vec<String>>,
  pub exclude: Option<Vec<String>>,
  pub languages: Option<Vec<String>>,
  pub hidden: Option<bool>,
  pub no_ignore: Option<bool>,
  pub no_ignore_parent: Option<bool>,
  pub no_ignore_dot: Option<bool>,
  pub no_ignore_vcs: Option<bool>,
  pub treat_doc_strings_as_comments: Option<bool>,
  pub files: Option<bool>,
}

fn build_reports(reports: &[tokei::Report]) -> Vec<Report> {
  reports
    .iter()
    .map(|r| {
      let stats = r.stats.summarise();
      Report {
        name: r.name.to_string_lossy().to_string(),
        lines: stats.lines() as u32,
        code: stats.code as u32,
        comments: stats.comments as u32,
        blanks: stats.blanks as u32,
      }
    })
    .collect()
}

#[napi]
pub fn tokei(options: TokeiOptions) -> Vec<LanguageInfo> {
  let include_files = options.files.unwrap_or(false);
  let langs: Option<Vec<LangType>> = options
    .languages
    .map(|lang_type| lang_type.iter().map(|s| LangType::from(&**s)).collect());

  let config = Config {
    hidden: options.hidden,
    no_ignore: options.no_ignore,
    no_ignore_parent: options.no_ignore_parent,
    no_ignore_dot: options.no_ignore_dot,
    no_ignore_vcs: options.no_ignore_vcs,
    treat_doc_strings_as_comments: options.treat_doc_strings_as_comments,
    types: langs.as_ref().map(|l| l.iter().map(|lt| **lt).collect()),
    ..Config::default()
  };

  let mut languages = Languages::new();
  languages.get_statistics(
    &options
      .include
      .unwrap_or_else(|| vec![env::current_dir().unwrap().to_string_lossy().to_string()]),
    &options
      .exclude
      .unwrap_or_default()
      .iter()
      .map(|s| &**s)
      .collect::<Vec<&str>>(),
    &config,
  );

  let mut res: Vec<LanguageInfo> = vec![];
  if let Some(langs) = langs {
    langs.iter().for_each(|lang_type| {
      if let Some(lang) = languages.get(&**lang_type) {
        res.push(LanguageInfo {
          lang: lang_type.to_string(),
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
        })
      }
    })
  } else {
    for lang in languages.into_iter() {
      res.push(LanguageInfo {
        lang: lang.0.to_string(),
        files: lang.1.reports.len() as u32,
        lines: lang.1.lines() as u32,
        code: lang.1.code as u32,
        comments: lang.1.comments as u32,
        blanks: lang.1.blanks as u32,
        reports: if include_files {
          Some(build_reports(&lang.1.reports))
        } else {
          None
        },
      })
    }
  }

  res
}
