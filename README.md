# @kitschpatrol/tokei

**Node binding for tokei, a fast code statistics tool.**

> [!NOTE]
>
> This is a fork of [faga295/napi-tokei](https://github.com/faga295/napi-tokei) with an updated version of its [tokei](https://github.com/XAMPPRocky/tokei) dependency and a number of additional changes.
>
> An upstream-compatible [1.1.0 version](https://www.npmjs.com/package/@kitschpatrol/tokei/v/1.1.0) is available on NPM if you just want the updated tokei dependency.
>
> A [2.0.0+ version](https://www.npmjs.com/package/@kitschpatrol/tokei) with breaking improvements is also available.

## Quick start

### Install

Use your preferred package manager.

```sh
npm install @kitschpatrol/tokei
```

### Invoke

```typescript
import { tokei } from '@kitschpatrol/tokei'

const results = tokei()
// Returns:
// [
//   { language: 'JavaScript', files: 2, lines: 610, code: 577, comments: 12, blanks: 21 },
//   { language: 'JSON', files: 6, lines: 156, code: 156, comments: 0, blanks: 0 },
//   { language: 'Markdown', files: 1, lines: 81, code: 0, comments: 57, blanks: 24 },
//   { language: 'Rust', files: 3, lines: 135, code: 126, comments: 0, blanks: 9 },
//   { language: 'TOML', files: 2, lines: 25, code: 20, comments: 0, blanks: 5 },
//   { language: 'TypeScript', files: 4, lines: 596, code: 502, comments: 68, blanks: 26 },
//   { language: 'YAML', files: 1, lines: 2869, code: 2230, comments: 0, blanks: 639 }
// ]
```

## Changes

### Breaking changes

- **Language names use tokei display names**  
  Ensures consistency across input and output.

- **Invalid language names are silently ignored**  
  Instead of falling back to `Text`.

- **`CodeStatus` type removed.**  
  The `Report` type now directly contains `lines`, `code`, `comments`, and `blanks` fields.

- **`lang` field renamed to `language`**

### Additions

- **Additional configuration options**  
  `hidden`, `noIgnore`, `noIgnoreParent`, `noIgnoreDot`, `noIgnoreVcs`, and `treatDocStringsAsComments` are now exposed, matching [tokei's `Config` struct](https://docs.rs/tokei/latest/tokei/struct.Config.html).

- **Per-file statistics**  
  Set `files: true` to get a `reports` array on each `LanguageInfo` with per-file breakdowns. (Equivalent to the tokei CLI `--files` flag.)

- **`Language` type**  
  A TypeScript string literal union of all 329 supported language names, providing autocomplete and type safety for the `languages` option.

- **JSDoc comments**  
  Provide documentation-on-hover for all exported types and fields.

## Examples

```ts
import { tokei } from '@kitschpatrol/tokei'

// Basic usage
const results = tokei()

// Filter by language
const tsOnly = tokei({
  exclude: ['secret_folder'],
  languages: ['TypeScript'],
})

// With per-file reports and config options
const detailed = tokei({
  include: ['.'],
  exclude: ['secret_folder'],
  languages: ['TypeScript', 'Rust'],
  files: true,
  hidden: true,
  treatDocStringsAsComments: true,
})
```
