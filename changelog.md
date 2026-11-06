# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Maintenance

- Update pnpm to 12.16.1, refresh remark configuration and CI actions, and adjust dependency release-age exceptions.
- Remove automatic skill synchronization from package preparation and drop the `skills` dependency.
- Remove the `.claude` exception from deep cleanup.

## [2.1.0] - 2026-10-15

### Added

- Support Blade, C3, Djot, and Godot TextScene through Tokei 15, expanding the `Language` union to 333 names.
- Export `__napiBindingTarget` to identify the binding artifact loaded at runtime.
- Add loader-level `NAPI_RS_WASI_FLAVOR` selection with explicit errors for unavailable flavors.

### Fixed

- Honor explicit `NAPI_RS_FORCE_WASI` values so `false` and `0` do not trigger WASI loading, and defer native initialization for WASI requests.
- Improve binding-load diagnostics by safely chaining failure messages without mutating caught exceptions.

### Documentation

- Update language coverage and replace outdated contributor-tooling instructions with the current linting and formatting tools.

### Maintenance

- Refresh NAPI-RS and development tooling, move to pnpm 12, replace Prettier/Taplo with oxfmt, and add contributor skill synchronization.
- Cross-compile FreeBSD x64 binaries with Zig, validate them in a FreeBSD VM, and refresh pinned cross-platform CI actions and dependency installation.
- Add scheduled repository/homepage link checks.
- Add scheduled upstream fork-maintenance automation.
- Synchronize npm, Cargo, and native-loader versions in the release command.

## [2.0.2] - 2026-05-18

### Documentation

- Update contribution guidance, document contributor tooling, and correct documentation links.

### Maintenance

- Move contributor tooling to pnpm 11, refresh development dependencies and CI actions, and run binding tests on Node.js 22.
- Make cleanup portable with `shx`, avoid staging lockfile removal, and preserve `.claude` configuration during cleanup.

## [2.0.1] - 2026-04-05

### Documentation

- Add a CI status badge to the README.

### Maintenance

- Refresh development dependencies and pnpm, and update README tooling commands for mdat 2.
- Add a bumpp-based release script.
- Update metadata-sync automation, pin checkout with read-only permissions, and normalize the CI workflow filename.

## [2.0.0] - 2026-03-07

### Added

- Add `tokeiSync(options?)` for synchronous analysis.
- Expose `hidden`, `noIgnore`, `noIgnoreParent`, `noIgnoreDot`, `noIgnoreVcs`, and `treatDocStringsAsComments` options.
- Support `files: true` to return per-file paths and line/code/comment/blank counts in each language's `reports` array.
- Export a `Language` string-literal union covering supported language names for typed filters and results.
- Allow omitted or null options, defaulting analysis to the current working directory.

### Changed

- **Breaking:** Make `tokei()` run on a background thread and return `Promise<LanguageInfo[]>`; await its result or use `tokeiSync()`.
- **Breaking:** Accept Tokei display names in `languages` instead of Rust enum names, and silently ignore invalid names instead of treating them as plain text.
- **Breaking:** Rename the returned `lang` field to `language`.
- **Breaking:** Replace `Report.status` with direct `lines`, `code`, `comments`, and `blanks` fields.
- **Breaking:** Raise the minimum supported Node.js version from 10 to 18.

### Removed

- **Breaking:** Remove the exported `CodeStatus` type.

### Fixed

- Apply language filters during scanning and skip requested languages without matching files instead of panicking.
- Default empty `include` arrays to the working directory and avoid panics when the working-directory lookup fails.

### Documentation

- Expand the README with installation requirements, API references, async/sync examples, migration guidance, and license attributions.
- Add JSDoc descriptions and defaults to exported functions, types, options, and result fields.

### Maintenance

- Generate language types from Tokei during builds and correct cross-platform paths and native-build flag forwarding.
- Expand integration coverage for configuration, input edge cases, and async/sync parity; skip CLI benchmarks when Tokei is unavailable.
- Add README generation/checking tools and automated GitHub repository metadata synchronization.

## [1.1.0] - 2026-03-06

### Added

- Include a `files` count in each language's statistics.
- Restore native build targets for Linux x64 GNU/musl, Linux ARM32 GNU, Linux ARM64 musl, Windows x86/ARM64, and FreeBSD x64.
- Allow custom native bindings through `NAPI_RS_NATIVE_LIBRARY_PATH` and optional package-version checks through `NAPI_RS_ENFORCE_VERSION_CHECK`.

### Changed

- Upgrade Tokei from 12.1.2 to 14.0.0, expanding language coverage from 226 to 329 identifiers.
- **Breaking:** Consolidate the native binding and TypeScript entry points into the fork package `@kitschpatrol/tokei`, replacing the separate `@faga` packages.

### Removed

- **Breaking:** Remove the default-export wrapper and its `Total` aggregate; use the named `tokei(options)` export returning per-language arrays.

### Fixed

- Fall back to installed platform bindings when a local binary fails to load, and improve libc detection and load-error diagnostics.
- Ensure published packages include and advertise TypeScript declaration files.

### Documentation

- Update installation and import examples for the fork namespace and explain the fork's relationship to upstream.

### Maintenance

- Modernize builds with NAPI-RS 3, pnpm 10, Oxlint/oxc-node, and refreshed formatting and benchmark tooling.
- Add statistics/filter integration tests and Tokei benchmarks, restore cross-platform CI checks, and enable npm publication provenance.

## [0.0.8] - 2023-05-23

### Fixed

- Restore macOS ARM64 to the native packaging targets.

## [0.0.7] - 2023-05-23

### Changed

- **Breaking:** Limit prebuilt native packages to macOS x64/ARM64, Linux ARM64 GNU, and Windows x64.

### Documentation

- Correct the usage example to use the default import and an options object with language filtering.

### Maintenance

- Replace native artifact collection with a pnpm-workspace-aware script that copies binaries into their platform packages.

## [0.0.6] - 2023-05-23

### Fixed

- Repair native binding installation by aligning platform package names and binary filenames and declaring bindings as optional dependencies.
- Build the JavaScript wrapper before publishing so its declared entry point is included.

### Maintenance

- Enable public Changesets publishing and streamline CI dependency installation on Node.js 18.

## [0.0.5] - 2023-05-22

### Added

- Introduce a synchronous Rust-backed `tokei(options)` API for per-language line, code, comment, and blank counts, with TypeScript declarations.
- Support include/exclude path lists and language filters, defaulting analysis to the current working directory.
- Provide an `@faga/tokei` default wrapper returning language-keyed statistics and a `Total` aggregate, while re-exporting the core API and types.
- Provide an `@faga/tokei-core` native package for Node.js 10+, with platform-specific binding loading for macOS, Windows, Linux, Android, and FreeBSD.

### Documentation

- Add npm, Yarn, and pnpm installation instructions, usage examples, and a runnable playground.

### Maintenance

- Set up pnpm/Rust builds, formatting, cross-platform CI, and Changesets-based publishing.

[Unreleased]: https://github.com/kitschpatrol/napi-tokei/compare/v2.1.0...HEAD
[0.0.5]: https://github.com/kitschpatrol/napi-tokei/releases/tag/v0.0.5
[0.0.6]: https://github.com/kitschpatrol/napi-tokei/compare/v0.0.5...v0.0.6
[0.0.7]: https://github.com/kitschpatrol/napi-tokei/compare/v0.0.6...v0.0.7
[0.0.8]: https://github.com/kitschpatrol/napi-tokei/compare/v0.0.7...v0.0.8
[1.1.0]: https://github.com/kitschpatrol/napi-tokei/compare/v0.0.8...v1.1.0
[2.0.0]: https://github.com/kitschpatrol/napi-tokei/compare/v1.1.0...v2.0.0
[2.0.1]: https://github.com/kitschpatrol/napi-tokei/compare/v2.0.0...v2.0.1
[2.0.2]: https://github.com/kitschpatrol/napi-tokei/compare/v2.0.1...v2.0.2
[2.1.0]: https://github.com/kitschpatrol/napi-tokei/compare/v2.0.2...v2.1.0
