<!-- title -->

# @kitschpatrol/tokei

<!-- /title -->

<!-- badges -->

[![NPM Package @kitschpatrol/tokei](https://img.shields.io/npm/v/@kitschpatrol/tokei.svg)](https://npmjs.com/package/@kitschpatrol/tokei)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/license/mit/)
[![CI](https://github.com/kitschpatrol/napi-tokei/actions/workflows/ci.yml/badge.svg)](https://github.com/kitschpatrol/napi-tokei/actions/workflows/ci.yml)

<!-- /badges -->

<!-- short-description -->

**Node bindings for Tokei, a fast code counting tool.**

<!-- /short-description -->

> [!NOTE]
>
> This is a fork of [faga295/napi-tokei](https://github.com/faga295/napi-tokei) with an updated version of [Tokei](https://github.com/XAMPPRocky/tokei) and a number of additional changes.
>
> An upstream-compatible [1.1.0 version](https://www.npmjs.com/package/@kitschpatrol/tokei/v/1.1.0) is available on NPM if you just want the updated Tokei dependency.
>
> A [2.0.0+ version](https://www.npmjs.com/package/@kitschpatrol/tokei) with breaking improvements is also available.
>
> A full accounting of the changes is [available below](#changes).

## Overview

Node.js native bindings for [Tokei](https://github.com/XAMPPRocky/tokei), a fast code statistics tool written in Rust. It counts lines of code, comments, and blanks across 329 programming languages, with support for language filtering, per-file breakdowns, and configurable ignore rules.

## Getting started

### Dependencies

- [Node](https://nodejs.org/) 18+

Tokei binaries are included for x86\_64, aarch64, i686, and armv7.

_WebAssembly is not supported._

### Installation

Add the library to your project's `package.json`:

```sh
npm install @kitschpatrol/tokei
```

### Invocation

```typescript
import { tokei } from '@kitschpatrol/tokei'

const results = await tokei()

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

## Usage

The library exposes `tokei(options?)` and `tokeiSync(options?)` functions with options similar to those provided by the [Tokei's `get_statistics` method](https://docs.rs/tokei/latest/tokei/struct.Languages.html#method.get_statistics) and the [Tokei CLI tool](https://github.com/XAMPPRocky/tokei).

### API

#### `tokei(options?): Promise<LanguageInfo[]>`

Count lines of code, comments, and blanks across files and languages. Runs on a background thread and returns a promise, so it doesn't block the Node.js event loop.

#### `tokeiSync(options?): LanguageInfo[]`

Synchronous version of `tokei`. Blocks the event loop until the analysis is complete. Useful for scripts, CLI tools, or cases where blocking is acceptable.

#### `TokeiOptions`

All fields are optional.

| Field                       | Type         | Default | Description                                                                                                                        |
| --------------------------- | ------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `include`                   | `string[]`   | `["."]` | Paths to include in the analysis. Defaults to the current working directory.                                                       |
| `exclude`                   | `string[]`   |         | Paths to exclude from the analysis. Tokei respects `.gitignore` and similar files by default.                                      |
| `languages`                 | `Language[]` |         | Filter results to only these languages. Uses Tokei display names (e.g. `"Rust"`, `"ASP.NET"`). Invalid names are silently ignored. |
| `hidden`                    | `boolean`    | `false` | Include hidden files and directories.                                                                                              |
| `noIgnore`                  | `boolean`    | `false` | Don't respect any ignore files. Implies `noIgnoreParent`, `noIgnoreDot`, and `noIgnoreVcs`.                                        |
| `noIgnoreParent`            | `boolean`    | `false` | Don't respect ignore files in parent directories.                                                                                  |
| `noIgnoreDot`               | `boolean`    | `false` | Don't respect `.ignore` and `.tokeignore` files.                                                                                   |
| `noIgnoreVcs`               | `boolean`    | `false` | Don't respect VCS ignore files (`.gitignore`, `.hgignore`, etc.).                                                                  |
| `treatDocStringsAsComments` | `boolean`    | `false` | Count doc strings (e.g. Python `"""..."""`, Rust `///`) as comments instead of code.                                               |
| `files`                     | `boolean`    | `false` | Include per-file statistics in the `reports` field of each result.                                                                 |

#### `LanguageInfo`

Aggregated code statistics for a single programming language.

| Field      | Type        | Description                                                            |
| ---------- | ----------- | ---------------------------------------------------------------------- |
| `language` | `Language`  | The language name, e.g. `"Rust"`, `"TypeScript"`, `"ASP.NET"`.         |
| `files`    | `number`    | Number of files detected for this language.                            |
| `lines`    | `number`    | Total number of lines (code + comments + blanks).                      |
| `code`     | `number`    | Lines of code (excluding comments and blanks).                         |
| `comments` | `number`    | Lines of comments.                                                     |
| `blanks`   | `number`    | Blank lines.                                                           |
| `reports`  | `Report[]?` | Per-file statistics. Only populated when `files` is `true` in options. |

#### `Report`

Code statistics for a single file. Only included when `files: true` is set.

| Field      | Type     | Description                                       |
| ---------- | -------- | ------------------------------------------------- |
| `name`     | `string` | The file path.                                    |
| `lines`    | `number` | Total number of lines (code + comments + blanks). |
| `code`     | `number` | Lines of code (excluding comments and blanks).    |
| `comments` | `number` | Lines of comments.                                |
| `blanks`   | `number` | Blank lines.                                      |

#### `Language`

A TypeScript string literal union of all 329 supported language names, providing autocomplete and type safety for the `languages` option. See the [full list in the type definitions](index.d.ts).

### Examples

```ts
import { tokei, tokeiSync } from '@kitschpatrol/tokei'

// Basic async usage
const results = await tokei()

// Basic sync usage
const resultsSync = tokeiSync()

// Filter by language
const tsOnly = await tokei({
  exclude: ['secret_folder'],
  languages: ['TypeScript'],
})

// With per-file reports and config options
const detailed = await tokei({
  include: ['.'],
  exclude: ['secret_folder'],
  languages: ['TypeScript', 'Rust'],
  files: true,
  hidden: true,
  treatDocStringsAsComments: true,
})
```

## Changes

Modifications from [upstream](https://github.com/faga295/napi-tokei) include the following:

### 1.1.0+

- **Tokei 14**\
  Adds 'files' count to returned object. Other bug fixes and improvements.

- **Modernized project template**\
  Based on latest [napi-rs/package-template-pnpm](https://github.com/napi-rs/package-template-pnpm)

- **Integration tests**

### 2.0.0+

- **`tokei()` is now async and returns a `Promise`**\
  _Breaking_\
  The `tokei()` function now runs on a background thread and returns `Promise<LanguageInfo[]>` instead of `LanguageInfo[]`. A synchronous `tokeiSync()` function is also available. To migrate, either `await` the result of `tokei()`, or switch to `tokeiSync()`.

- **Language names use Tokei display names**\
  _Breaking_\
  Ensures consistency across input and output.

- **Invalid language names are silently ignored**\
  _Breaking_\
  Instead of falling back to `Text`.

- **`CodeStatus` type removed.**\
  _Breaking_\
  The `Report` type now directly contains `lines`, `code`, `comments`, and `blanks` fields.

- **`lang` field renamed to `language`**\
  _Breaking_

- **Additional configuration options**\
  `hidden`, `noIgnore`, `noIgnoreParent`, `noIgnoreDot`, `noIgnoreVcs`, and `treatDocStringsAsComments` are now exposed, matching [Tokei's `Config` struct](https://docs.rs/tokei/latest/tokei/struct.Config.html).

- **Per-file statistics**\
  Set `files: true` to get a `reports` array on each `LanguageInfo` with per-file breakdowns. (Equivalent to the Tokei CLI `--files` flag.)

- **`Language` type**\
  A TypeScript string literal union of all 329 supported language names, providing autocomplete and type safety for the `languages` option.

- **JSDoc comments**\
  Provide documentation-on-hover for all exported types and fields.

## Maintainers

[kitschpatrol](https://github.com/kitschpatrol)

## Acknowledgments

[Erin Power (@XAMPPRocky)](https://xampproc.ky/) and [contributors](https://github.com/XAMPPRocky/tokei/graphs/contributors) develop the [Tokei](https://github.com/XAMPPRocky/tokei) library and CLI.

[Liu Zhaochen (@faga295)](https://github.com/faga295) developed the [fork](https://github.com/faga295/napi-tokei) on which this repo is based.

The [napi-rs](https://github.com/napi-rs/napi-rs) project makes bridging Rust and Node much more tractable.

<!-- contributing -->

## Contributing

[Issues](https://github.com/kitschpatrol/napi-tokei/issues) are welcome and appreciated.

Please open an issue to discuss changes before submitting a pull request. Unsolicited PRs (especially AI-generated ones) are unlikely to be merged.

This repository uses [@kitschpatrol/shared-config](https://github.com/kitschpatrol/shared-config) (via its `ksc` CLI) for linting and formatting, plus [MDAT](https://github.com/kitschpatrol/mdat) for readme placeholder expansion.

<!-- /contributing -->

<!-- license -->

## License

[MIT](license.txt) © [Eric Mika](https://ericmika.com)

<!-- /license -->

_The above license applies to changes in this fork, the MIT-licensed upstream and template projects are cited in [license.txt](license.txt)._
