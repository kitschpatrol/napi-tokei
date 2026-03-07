import test from 'ava'

import { tokei } from '../index.js'

test('tokei returns language stats for the current project', (t) => {
  const result = tokei({
    include: ['.'],
    exclude: ['node_modules', 'target', 'package-template', 'package-template-pnpm'],
  })
  t.true(Array.isArray(result))
  t.true(result.length > 0)

  const rust = result.find((r) => r.lang === 'Rust')
  t.truthy(rust)
  t.is(typeof rust!.files, 'number')
  t.is(typeof rust!.lines, 'number')
  t.is(typeof rust!.code, 'number')
  t.is(typeof rust!.comments, 'number')
  t.is(typeof rust!.blanks, 'number')
  t.true(rust!.files > 0)
  t.true(rust!.code > 0)
})

test('tokei filters by language', (t) => {
  const result = tokei({ include: ['.'], exclude: ['node_modules', 'target'], languages: ['Rust'] })
  t.true(Array.isArray(result))
  t.is(result.length, 1)
  t.is(result[0].lang, 'Rust')
})

test('tokei hidden option includes dotfiles', (t) => {
  const withoutHidden = tokei({
    include: ['.'],
    exclude: ['node_modules', 'target'],
  })
  const withHidden = tokei({
    include: ['.'],
    exclude: ['node_modules', 'target'],
    hidden: true,
  })
  // With hidden files included, we should get at least as many total lines
  const totalWithout = withoutHidden.reduce((sum, r) => sum + r.lines, 0)
  const totalWith = withHidden.reduce((sum, r) => sum + r.lines, 0)
  t.true(totalWith >= totalWithout)
})

test('tokei noIgnore option disables ignore file processing', (t) => {
  const withIgnore = tokei({
    include: ['.'],
    exclude: ['target'],
  })
  const withoutIgnore = tokei({
    include: ['.'],
    exclude: ['target'],
    noIgnore: true,
  })
  // With ignore files disabled, we should find at least as many lines
  // (node_modules and other gitignored paths would be included)
  const totalWith = withIgnore.reduce((sum, r) => sum + r.lines, 0)
  const totalWithout = withoutIgnore.reduce((sum, r) => sum + r.lines, 0)
  t.true(totalWithout >= totalWith)
})

test('tokei treatDocStringsAsComments shifts counts', (t) => {
  const normal = tokei({
    include: ['.'],
    exclude: ['node_modules', 'target'],
    languages: ['Rust'],
  })
  const docAsComments = tokei({
    include: ['.'],
    exclude: ['node_modules', 'target'],
    languages: ['Rust'],
    treatDocStringsAsComments: true,
  })
  t.truthy(normal[0])
  t.truthy(docAsComments[0])
  // Total lines should remain the same regardless of classification
  t.is(normal[0].lines, docAsComments[0].lines)
  // With doc strings as comments, comments should be >= normal comments
  t.true(docAsComments[0].comments >= normal[0].comments)
})

test('tokei omits reports by default', (t) => {
  const result = tokei({
    include: ['.'],
    exclude: ['node_modules', 'target'],
    languages: ['Rust'],
  })
  t.is(result[0].reports, undefined)
})

test('tokei files option returns per-file reports', (t) => {
  const result = tokei({
    include: ['.'],
    exclude: ['node_modules', 'target'],
    languages: ['Rust'],
    files: true,
  })
  const rust = result[0]
  t.truthy(rust.reports)
  t.true(Array.isArray(rust.reports))
  t.true(rust.reports!.length > 0)
  t.is(rust.reports!.length, rust.files)

  const report = rust.reports![0]
  t.is(typeof report.name, 'string')
  t.true(report.name.endsWith('.rs'))
  t.is(typeof report.lines, 'number')
  t.is(typeof report.code, 'number')
  t.is(typeof report.comments, 'number')
  t.is(typeof report.blanks, 'number')

  // Per-file stats should sum to the language totals
  const totalCode = rust.reports!.reduce((sum, r) => sum + r.code, 0)
  const totalComments = rust.reports!.reduce((sum, r) => sum + r.comments, 0)
  const totalBlanks = rust.reports!.reduce((sum, r) => sum + r.blanks, 0)
  t.is(totalCode, rust.code)
  t.is(totalComments, rust.comments)
  t.is(totalBlanks, rust.blanks)
})
