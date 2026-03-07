// Build wrapper that forwards CLI args to `napi build` then runs fix-types.
// This exists because using `&&` in a package script causes pnpm arg
// passthrough (e.g. --target) to attach to the last command instead of
// napi build, and we need to run fix-types after the napi build.
//
// Note: We use execSync instead of NapiCli's programmatic API because
// NapiCli.build() performs deferred file writes (e.g. index.d.ts) after
// the promise resolves, which would race with fix-types.
import { execSync } from 'child_process'
import { fixTypes } from './fix-types.mjs'

const args = process.argv.slice(2)

execSync(`napi build --platform ${args.join(' ')}`, { stdio: 'inherit' })
fixTypes()
