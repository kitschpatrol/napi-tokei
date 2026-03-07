// Generates a Language union type by querying tokei's LanguageType::list() directly,
// and patches index.d.ts to use it.
import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'

const root = new URL('..', import.meta.url).pathname

// Get all language names directly from the tokei crate
const output = execSync('cargo run --bin list-languages -q', { encoding: 'utf-8', cwd: root })

const languages = output.trim().split('\n')
const unionType = languages.map((l) => `  | '${l.replace(/'/g, "\\'")}'`).join('\n')

const dtsPath = new URL('../index.d.ts', import.meta.url).pathname
let dts = readFileSync(dtsPath, 'utf-8')

// Remove any existing Language definition
dts = dts.replace(/\nexport type Language =[\s\S]*?\n\n/g, '\n')

// Add the union type before the first export
dts = dts.replace('/* eslint-disable */\n', `/* eslint-disable */\n\nexport type Language =\n${unionType}\n`)

// Replace Array<string> with Array<Language> for languages field
dts = dts.replace('languages?: Array<string>', 'languages?: Array<Language>')

// Replace language: string with language: Language in LanguageInfo
dts = dts.replace(/^( +language): string$/m, '$1: Language')

writeFileSync(dtsPath, dts)

console.log(`Generated Language union with ${languages.length} variants`)
