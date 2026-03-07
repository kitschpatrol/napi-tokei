import { execSync } from 'node:child_process'

import { Bench } from 'tinybench'

import { tokei } from '../index.js'

const bench = new Bench()

bench.add('Native tokei – scan this project', () => {
  tokei({ include: ['.'], exclude: ['node_modules', 'target', 'package-template', 'package-template-pnpm'] })
})

bench.add('Native tokei – scan this project (Rust only)', () => {
  tokei({
    include: ['.'],
    exclude: ['node_modules', 'target', 'package-template', 'package-template-pnpm'],
    languages: ['Rust'],
  })
})

bench.add('child_process cloc via tokei CLI (if installed)', () => {
  try {
    execSync(
      'tokei . --exclude node_modules --exclude target --exclude package-template --exclude package-template-pnpm',
      {
        stdio: 'pipe',
      },
    )
  } catch {
    // tokei CLI not installed – skip silently
  }
})

await bench.run()

console.table(bench.table())
