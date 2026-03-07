import test from 'ava'

import { tokei, tokeiSync } from '../index.js'

test('tokeiSync returns language stats for the current project', (t) => {
  const result = tokeiSync({
    include: ['.'],
    exclude: ['node_modules', 'target', 'package-template', 'package-template-pnpm'],
  })
  t.true(Array.isArray(result))
  t.true(result.length > 0)

  const rust = result.find((r) => r.language === 'Rust')
  t.truthy(rust)
  t.is(typeof rust!.files, 'number')
  t.is(typeof rust!.lines, 'number')
  t.is(typeof rust!.code, 'number')
  t.is(typeof rust!.comments, 'number')
  t.is(typeof rust!.blanks, 'number')
  t.true(rust!.files > 0)
  t.true(rust!.code > 0)
})

test('tokeiSync filters by language', (t) => {
  const result = tokeiSync({ include: ['.'], exclude: ['node_modules', 'target'], languages: ['Rust'] })
  t.true(Array.isArray(result))
  t.is(result.length, 1)
  t.is(result[0].language, 'Rust')
})

test('tokeiSync hidden option includes dotfiles', (t) => {
  const withoutHidden = tokeiSync({
    include: ['.'],
    exclude: ['node_modules', 'target'],
  })
  const withHidden = tokeiSync({
    include: ['.'],
    exclude: ['node_modules', 'target'],
    hidden: true,
  })
  // With hidden files included, we should get at least as many total lines
  const totalWithout = withoutHidden.reduce((sum, r) => sum + r.lines, 0)
  const totalWith = withHidden.reduce((sum, r) => sum + r.lines, 0)
  t.true(totalWith >= totalWithout)
})

test('tokeiSync noIgnore option disables ignore file processing', (t) => {
  const withIgnore = tokeiSync({
    include: ['.'],
    exclude: ['target'],
  })
  const withoutIgnore = tokeiSync({
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

test('tokeiSync treatDocStringsAsComments shifts counts', (t) => {
  const normal = tokeiSync({
    include: ['.'],
    exclude: ['node_modules', 'target'],
    languages: ['Rust'],
  })
  const docAsComments = tokeiSync({
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

test('tokeiSync omits reports by default', (t) => {
  const result = tokeiSync({
    include: ['.'],
    exclude: ['node_modules', 'target'],
    languages: ['Rust'],
  })
  t.is(result[0].reports, undefined)
})

test('tokeiSync files option returns per-file reports', (t) => {
  const result = tokeiSync({
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

test('tokeiSync silently ignores invalid language names', (t) => {
  const result = tokeiSync({
    include: ['.'],
    exclude: ['node_modules', 'target'],
    languages: ['Rust', 'NotARealLanguage'],
  })
  t.is(result.length, 1)
  t.is(result[0].language, 'Rust')
})

test('tokeiSync works with no arguments', (t) => {
  const result = tokeiSync()
  t.true(Array.isArray(result))
  t.true(result.length > 0)
})

test('tokeiSync handles empty include array by falling back to cwd', (t) => {
  const result = tokeiSync({ include: [] })
  t.true(Array.isArray(result))
  t.true(result.length > 0)
})

test('tokeiSync returns empty array when all language names are invalid', (t) => {
  const result = tokeiSync({
    include: ['.'],
    exclude: ['node_modules', 'target'],
    languages: ['NotARealLanguage', 'AlsoFake'],
  })
  t.true(Array.isArray(result))
  t.is(result.length, 0)
})

test('tokeiSync exclude works without include (uses cwd)', (t) => {
  const result = tokeiSync({ exclude: ['node_modules', 'target'] })
  t.true(Array.isArray(result))
  t.true(result.length > 0)
  const rust = result.find((r) => r.language === 'Rust')
  t.truthy(rust)
  t.true(rust!.code > 0)
})

test('tokeiSync noIgnoreVcs option disables .gitignore processing', (t) => {
  const withVcsIgnore = tokeiSync({
    include: ['.'],
    exclude: ['target'],
  })
  const withoutVcsIgnore = tokeiSync({
    include: ['.'],
    exclude: ['target'],
    noIgnoreVcs: true,
  })
  const totalWith = withVcsIgnore.reduce((sum, r) => sum + r.lines, 0)
  const totalWithout = withoutVcsIgnore.reduce((sum, r) => sum + r.lines, 0)
  t.true(totalWithout >= totalWith)
})

test('tokeiSync noIgnoreDot option disables .ignore and .tokeignore processing', (t) => {
  const withDotIgnore = tokeiSync({
    include: ['.'],
    exclude: ['node_modules', 'target'],
  })
  const withoutDotIgnore = tokeiSync({
    include: ['.'],
    exclude: ['node_modules', 'target'],
    noIgnoreDot: true,
  })
  const totalWith = withDotIgnore.reduce((sum, r) => sum + r.lines, 0)
  const totalWithout = withoutDotIgnore.reduce((sum, r) => sum + r.lines, 0)
  t.true(totalWithout >= totalWith)
})

test('tokeiSync noIgnoreParent option disables parent ignore files', (t) => {
  const withParentIgnore = tokeiSync({
    include: ['.'],
    exclude: ['node_modules', 'target'],
  })
  const withoutParentIgnore = tokeiSync({
    include: ['.'],
    exclude: ['node_modules', 'target'],
    noIgnoreParent: true,
  })
  const totalWith = withParentIgnore.reduce((sum, r) => sum + r.lines, 0)
  const totalWithout = withoutParentIgnore.reduce((sum, r) => sum + r.lines, 0)
  t.true(totalWithout >= totalWith)
})

// Async tokei() tests

test('tokei returns a promise', async (t) => {
  const promise = tokei({
    include: ['.'],
    exclude: ['node_modules', 'target'],
    languages: ['Rust'],
  })
  t.true(promise instanceof Promise)
  const result = await promise
  t.true(Array.isArray(result))
})

test('tokei returns language stats for the current project', async (t) => {
  const result = await tokei({
    include: ['.'],
    exclude: ['node_modules', 'target', 'package-template', 'package-template-pnpm'],
  })
  t.true(Array.isArray(result))
  t.true(result.length > 0)

  const rust = result.find((r) => r.language === 'Rust')
  t.truthy(rust)
  t.is(typeof rust!.files, 'number')
  t.is(typeof rust!.lines, 'number')
  t.is(typeof rust!.code, 'number')
  t.is(typeof rust!.comments, 'number')
  t.is(typeof rust!.blanks, 'number')
  t.true(rust!.files > 0)
  t.true(rust!.code > 0)
})

test('tokei filters by language', async (t) => {
  const result = await tokei({ include: ['.'], exclude: ['node_modules', 'target'], languages: ['Rust'] })
  t.true(Array.isArray(result))
  t.is(result.length, 1)
  t.is(result[0].language, 'Rust')
})

test('tokei works with no arguments', async (t) => {
  const result = await tokei()
  t.true(Array.isArray(result))
  t.true(result.length > 0)
})

test('tokei produces same results as tokeiSync', async (t) => {
  const options = {
    include: ['.'],
    exclude: ['node_modules', 'target'],
    languages: ['Rust'],
  }
  const syncResult = tokeiSync(options)
  const asyncResult = await tokei(options)

  t.deepEqual(asyncResult, syncResult)
})

test('tokei files option returns per-file reports', async (t) => {
  const result = await tokei({
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
})
