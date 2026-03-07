fn main() {
  for (lang, _) in tokei::LanguageType::list() {
    println!("{lang}");
  }
}
