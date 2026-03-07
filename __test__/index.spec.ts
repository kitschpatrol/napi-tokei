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
